/**
 * AES-256-CBC con formato OpenSSL binario ("Salted__" + 8B salt + ciphertext).
 * Usa SHA-256 para key derivation (default de OpenSSL 1.1.0+ / 3.x en Kali).
 *
 * Kali Linux — cifrar:   openssl enc -aes-256-cbc -in file -out file.aes.enc -pass pass:CLAVE
 * Kali Linux — descifrar: openssl enc -aes-256-cbc -d -in file.aes.enc -out file -pass pass:CLAVE
 */

function concat(a: Uint8Array, b: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(a.length + b.length);
  out.set(a); out.set(b, a.length);
  return out;
}

// EVP_BytesToKey con SHA-256 — igual al default de OpenSSL 1.1.0+
// AES-256-CBC necesita 32B de clave + 16B de IV = 48B en total
// SHA-256 produce 32B → D0 = clave completa, D1[0:16] = IV
async function evpBytesToKey(
  password: Uint8Array,
  salt: Uint8Array,
): Promise<{ key: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer> }> {
  const ps = concat(password, salt);
  const d0 = new Uint8Array(await crypto.subtle.digest('SHA-256', ps));
  const d1 = new Uint8Array(await crypto.subtle.digest('SHA-256', concat(d0, ps)));
  return { key: d0, iv: d1.slice(0, 16) };
}

const MAGIC = new TextEncoder().encode('Salted__');

export const aesEncryptFile = async (file: File, password: string): Promise<Blob> => {
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const passwordBytes = new TextEncoder().encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(8));

  const { key, iv } = await evpBytesToKey(passwordBytes, salt);
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, fileBytes),
  );

  // Formato OpenSSL: "Salted__" (8B) + salt (8B) + ciphertext
  const output = new Uint8Array(16 + ciphertext.length);
  output.set(MAGIC, 0);
  output.set(salt, 8);
  output.set(ciphertext, 16);

  return new Blob([output], { type: 'application/octet-stream' });
};

export const aesDecryptFile = async (
  encFile: File,
  password: string,
): Promise<{ blob: Blob; name: string }> => {
  const fileBuf = await encFile.arrayBuffer();
  const fileBytes = new Uint8Array(fileBuf);

  if (fileBytes.length < 16 || new TextDecoder().decode(fileBytes.slice(0, 8)) !== 'Salted__') {
    throw new Error('Formato no compatible: el archivo no tiene cabecera OpenSSL (Salted__)');
  }

  const salt = fileBytes.slice(8, 16);
  const ciphertextBuf = fileBuf.slice(16);

  const passwordBytes = new TextEncoder().encode(password);
  const { key, iv } = await evpBytesToKey(passwordBytes, salt);
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['decrypt']);

  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, ciphertextBuf);
  } catch {
    throw new Error('Contraseña incorrecta o archivo corrupto');
  }

  const originalName = encFile.name.replace(/\.aes\.enc$/i, '');
  const ext = originalName.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
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

  return {
    blob: new Blob([plaintext], { type: mimeMap[ext] ?? 'application/octet-stream' }),
    name: originalName,
  };
};
