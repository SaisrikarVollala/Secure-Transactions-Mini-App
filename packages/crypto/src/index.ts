import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import "dotenv/config";
const ALGORITHM = "aes-256-gcm";
const NONCE_LENGTH = 12; 
const TAG_LENGTH = 16; 
const KEY_LENGTH = 32; 



const masterHex=process.env.MASTER_KEY_HEX||"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
const MASTER_KEY = Buffer.from(
  masterHex,
  "hex"
);

export type TxSecureRecord = {
  id: string;
  partyId: string;
  createdAt: string;
  payload_nonce: string;
  payload_ct: string;
  payload_tag: string;
  dek_wrap_nonce: string;
  dek_wrapped: string;
  dek_wrap_tag: string;
  alg: "AES-256-GCM";
  mk_version: 1;
};

export interface EncryptionResult {
  encryptedData: string; 
  nonce: string; 
  tag: string; 
}

export function encryptAES256GCM(
  plaintext: Buffer,
  key: Buffer
): EncryptionResult {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Key must be ${KEY_LENGTH} bytes`);
  }


  const nonce = randomBytes(NONCE_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, nonce);

  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const tag = cipher.getAuthTag();

  if (tag.length !== TAG_LENGTH) {
    throw new Error(`Tag must be ${TAG_LENGTH} bytes`);
  }
  return {
    encryptedData: encrypted.toString("hex"),
    nonce: nonce.toString("hex"),
    tag: tag.toString("hex"),
  };
}


export function decryptAES256GCM(
  encryptedData: string,
  nonce: string,
  tag: string,
  key: Buffer
): Buffer {
  
  if (key.length !== KEY_LENGTH) {
    console.log(key)
    throw new Error(`Key must be ${KEY_LENGTH} bytes`);
  }

  const nonceBuffer = Buffer.from(nonce, "hex");
  if (nonceBuffer.length !== NONCE_LENGTH) {
    throw new Error(`Nonce must be ${NONCE_LENGTH} bytes, got ${nonceBuffer.length}`);
  }

  const tagBuffer = Buffer.from(tag, "hex");
  if (tagBuffer.length !== TAG_LENGTH) {
    throw new Error(`Tag must be ${TAG_LENGTH} bytes, got ${tagBuffer.length}`);
  }

  const encryptedBuffer = Buffer.from(encryptedData, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, nonceBuffer);
  decipher.setAuthTag(tagBuffer);

  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}


export function isValidHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
}


export function envelopeEncrypt(payload: object): Omit<TxSecureRecord, "id" | "partyId" | "createdAt"> {
  
  const dek = randomBytes(KEY_LENGTH);
  console.log(dek)
  
  const payloadJson = JSON.stringify(payload);
  const payloadBuffer = Buffer.from(payloadJson, "utf-8");

  const payloadEncryption = encryptAES256GCM(payloadBuffer, dek);

  
  const dekWrapping = encryptAES256GCM(dek, MASTER_KEY);
  console.log("wrappedup")
  return {
    payload_nonce: payloadEncryption.nonce,
    payload_ct: payloadEncryption.encryptedData,
    payload_tag: payloadEncryption.tag,
    dek_wrap_nonce: dekWrapping.nonce,
    dek_wrapped: dekWrapping.encryptedData,
    dek_wrap_tag: dekWrapping.tag,
    alg: "AES-256-GCM",
    mk_version: 1,
  };
}


export function envelopeDecrypt(record: TxSecureRecord): object {
  
  const hexFields = [
    "payload_nonce",
    "payload_ct",
    "payload_tag",
    "dek_wrap_nonce",
    "dek_wrapped",
    "dek_wrap_tag",
  ] as const;

  for (const field of hexFields) {
    if (!isValidHex(record[field])) {
      throw new Error(`Invalid hex string in field: ${field}`);
    }
  }

  
  if (Buffer.from(record.payload_nonce, "hex").length !== NONCE_LENGTH) {
    throw new Error(`payload_nonce must be ${NONCE_LENGTH} bytes`);
  }
  if (Buffer.from(record.dek_wrap_nonce, "hex").length !== NONCE_LENGTH) {
    throw new Error(`dek_wrap_nonce must be ${NONCE_LENGTH} bytes`);
  }
  if (Buffer.from(record.payload_tag, "hex").length !== TAG_LENGTH) {
    throw new Error(`payload_tag must be ${TAG_LENGTH} bytes`);
  }
  if (Buffer.from(record.dek_wrap_tag, "hex").length !== TAG_LENGTH) {
    throw new Error(`dek_wrap_tag must be ${TAG_LENGTH} bytes`);
  }

  try {
    
    const dek = decryptAES256GCM(
      record.dek_wrapped,
      record.dek_wrap_nonce,
      record.dek_wrap_tag,
      MASTER_KEY
    );

    if (dek.length !== KEY_LENGTH) {
      throw new Error(`Unwrapped DEK must be ${KEY_LENGTH} bytes`);
    }

    
    const payloadBuffer = decryptAES256GCM(
      record.payload_ct,
      record.payload_nonce,
      record.payload_tag,
      dek
    );

    
    const payloadJson = payloadBuffer.toString("utf-8");
    return JSON.parse(payloadJson);
  } catch (error) {
    if (error instanceof Error) {
      
      if (error.message.includes("Unsupported state or unable to authenticate data")) {
        throw new Error("Decryption failed: Data has been tampered with or tag is invalid");
      }
      throw error;
    }
    throw new Error("Decryption failed");
  }
}


export function generateId(): string {
  return `tx_${randomBytes(16).toString("hex")}`;
}