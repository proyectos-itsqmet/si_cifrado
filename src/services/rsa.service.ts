/**
 * RSA con formato OpenPGP — compatible con GPG en Kali Linux.
 *
 * Kali — importar claves:  gpg --import public_key.asc
 *                           gpg --import private_key.asc
 * Kali — listar claves:    gpg --list-keys
 * Kali — cifrar:           gpg --recipient "SI Cifrado" --encrypt --output file.gpg file.jpg
 * Kali — descifrar:        gpg --output file.jpg --decrypt file.gpg
 */
import * as openpgp from 'openpgp';

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  pdf: 'application/pdf', txt: 'text/plain', csv: 'text/csv',
  json: 'application/json', xml: 'application/xml',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
  mp4: 'video/mp4', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
  zip: 'application/zip', rar: 'application/vnd.rar', gz: 'application/gzip',
};

export const rsaGenerateKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  const { publicKey, privateKey } = await openpgp.generateKey({
    type: 'ecc',
    curve: 'curve25519',
    userIDs: [{ name: 'SI Cifrado', email: 'sicifrado@local' }],
  });
  return { publicKey, privateKey };
};

export const rsaEncryptFile = async (file: File, publicKeyArmored: string): Promise<Blob> => {
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const message = await openpgp.createMessage({
    binary: fileBytes,
    filename: file.name,
  });

  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: publicKey,
    format: 'binary',
  });

  return new Blob([encrypted as Uint8Array], { type: 'application/pgp-encrypted' });
};

export const rsaDecryptFile = async (
  encFile: File,
  privateKeyArmored: string,
): Promise<{ blob: Blob; name: string }> => {
  const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
  const encBytes = new Uint8Array(await encFile.arrayBuffer());

  const message = await openpgp.readMessage({ binaryMessage: encBytes });

  const { data, filename } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
    format: 'binary',
  });

  const name = (filename as string | undefined) || encFile.name.replace(/\.gpg$/i, '');
  const ext = name.split('.').pop()?.toLowerCase() ?? '';

  return {
    blob: new Blob([data as Uint8Array], { type: MIME_MAP[ext] ?? 'application/octet-stream' }),
    name,
  };
};
