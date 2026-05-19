/**
 * Servicio AES (Cifrado Simétrico)
 * Usa la librería crypto-js para cifrar/descifrar archivos con AES-256.
 * La misma contraseña sirve para cifrar y descifrar.
 */
import CryptoJS from 'crypto-js';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/file.utils';

export const aesEncryptFile = async (file: File, password: string): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = arrayBufferToBase64(arrayBuffer);

  const metadata = JSON.stringify({ name: file.name, type: file.type });
  const payload = JSON.stringify({ meta: metadata, data: base64Data });

  const encrypted = CryptoJS.AES.encrypt(payload, password).toString();

  const output = JSON.stringify({
    algorithm: 'AES-256',
    mode: 'CBC',
    timestamp: new Date().toISOString(),
    encrypted,
  });

  return new Blob([output], { type: 'application/json' });
};

export const aesDecryptFile = async (encFile: File, password: string): Promise<{ blob: Blob; name: string }> => {
  const text = await encFile.text();
  const parsed = JSON.parse(text);

  const bytes = CryptoJS.AES.decrypt(parsed.encrypted, password);
  const payloadStr = bytes.toString(CryptoJS.enc.Utf8);

  if (!payloadStr) throw new Error('Contraseña incorrecta o archivo corrupto');

  const payload = JSON.parse(payloadStr);
  const { meta, data } = payload;
  const { name, type } = JSON.parse(meta);

  const arrayBuffer = base64ToArrayBuffer(data);
  const blob = new Blob([arrayBuffer], { type });

  return { blob, name };
};
