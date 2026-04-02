import crypto from "crypto";

// AES-256-GCM — authenticated encryption (confidentiality + tamper detection)
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // bytes — random per file
const TAG_LENGTH = 16; // bytes — GCM auth tag

// Binary layout of every encrypted file stored in Appwrite:
//   [ IV (16 bytes) | AUTH_TAG (16 bytes) | CIPHERTEXT (n bytes) ]

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error(
      "ENCRYPTION_SECRET is not set in environment variables. Add it to .env.local"
    );
  }
  // Strip quotes if accidentally double-quoted in .env
  const cleaned = secret.replace(/^["']|["']$/g, "");
  const key = Buffer.from(cleaned, "hex");
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_SECRET must be exactly 64 hex characters (32 bytes), but got ${cleaned.length} chars (${key.length} bytes)`
    );
  }
  return key;
}

/**
 * Encrypt a raw file buffer.
 * Returns a new Buffer with layout: [IV | AUTH_TAG | CIPHERTEXT]
 */
export function encryptBuffer(plaintext: Buffer): Buffer {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt a buffer produced by encryptBuffer().
 * Throws a clear error if the key is wrong or data is corrupted.
 */
export function decryptBuffer(ciphertext: Buffer): Buffer {
  const key = getKey();

  if (ciphertext.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error(
      "Encrypted data is too short — file may be corrupted or was not encrypted with this system"
    );
  }

  const iv = ciphertext.subarray(0, IV_LENGTH);
  const authTag = ciphertext.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = ciphertext.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
