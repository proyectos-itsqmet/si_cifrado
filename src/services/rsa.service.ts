/**
 * Servicio RSA (Cifrado Asimétrico)
 * Usa Web Crypto API (SubtleCrypto) para RSA-OAEP.
 * Implementa cifrado híbrido: RSA protege la clave AES-GCM que cifra el archivo.
 * - Clave pública → cifrar
 * - Clave privada → descifrar
 */
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/file.utils';

const RSA_PARAMS: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

export const rsaGenerateKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  const keyPair = await crypto.subtle.generateKey(RSA_PARAMS, true, ['encrypt', 'decrypt']);

  const publicKeyDer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyDer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicKey = `-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(publicKeyDer)
    .match(/.{1,64}/g)!.join('\n')}\n-----END PUBLIC KEY-----`;

  const privateKey = `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(privateKeyDer)
    .match(/.{1,64}/g)!.join('\n')}\n-----END PRIVATE KEY-----`;

  return { publicKey, privateKey };
};

const importPublicKey = async (pem: string): Promise<CryptoKey> => {
  const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, '');
  const der = base64ToArrayBuffer(base64);
  return crypto.subtle.importKey('spki', der, RSA_PARAMS, false, ['encrypt']);
};

const importPrivateKey = async (pem: string): Promise<CryptoKey> => {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const der = base64ToArrayBuffer(base64);
  return crypto.subtle.importKey('pkcs8', der, RSA_PARAMS, false, ['decrypt']);
};

export const rsaEncryptFile = async (file: File, publicKeyPem: string): Promise<Blob> => {
  const fileBuffer = await file.arrayBuffer();

  // 1. Generar clave AES-GCM aleatoria
  const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);

  // 2. Cifrar el archivo con AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, fileBuffer);

  // 3. Cifrar la clave AES con RSA
  const publicKey = await importPublicKey(publicKeyPem);
  const encryptedAesKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawAesKey);

  const output = JSON.stringify({
    algorithm: 'RSA-OAEP + AES-GCM',
    keySize: 2048,
    timestamp: new Date().toISOString(),
    fileName: file.name,
    fileType: file.type,
    encryptedKey: arrayBufferToBase64(encryptedAesKey),
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encryptedData),
  });

  return new Blob([output], { type: 'application/json' });
};

export const rsaDecryptFile = async (
  encFile: File,
  privateKeyPem: string
): Promise<{ blob: Blob; name: string }> => {
  const text = await encFile.text();
  const parsed = JSON.parse(text);

  const privateKey = await importPrivateKey(privateKeyPem);

  // 1. Descifrar clave AES con RSA
  const encryptedAesKey = base64ToArrayBuffer(parsed.encryptedKey);
  const rawAesKey = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encryptedAesKey);

  // 2. Importar clave AES recuperada
  const aesKey = await crypto.subtle.importKey('raw', rawAesKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);

  // 3. Descifrar datos del archivo
  const iv = new Uint8Array(base64ToArrayBuffer(parsed.iv));
  const encryptedData = base64ToArrayBuffer(parsed.data);
  const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, encryptedData);

  const blob = new Blob([decryptedData], { type: parsed.fileType || 'application/octet-stream' });
  return { blob, name: parsed.fileName };
};
