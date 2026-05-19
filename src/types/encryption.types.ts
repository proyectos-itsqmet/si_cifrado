export type Algorithm = 'aes' | 'rsa';
export type Mode = 'encrypt' | 'decrypt';

export interface EncryptionResult {
  fileName: string;
  data: Blob;
  mimeType: string;
}

export interface RsaKeyPair {
  publicKey: string;
  privateKey: string;
}
