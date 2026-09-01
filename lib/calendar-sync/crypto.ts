import crypto from "node:crypto";
import { calendarEnv } from "./env";

const key = () => {
  const decoded = Buffer.from(calendarEnv.encryptionKey(), "base64");
  if (decoded.length !== 32) throw new Error("KRAIN_CALENDAR_ENCRYPTION_KEY must be a base64 32-byte key");
  return decoded;
};

export const seal = (plainText: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
};

export const unseal = (cipherText: string) => {
  const data = Buffer.from(cipherText, "base64url");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};

export const secureEqual = (left: string, right: string) => {
  const a = crypto.createHash("sha256").update(left).digest();
  const b = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(a, b);
};

export const randomSecret = () => crypto.randomBytes(32).toString("base64url");

export const hash = (value: unknown) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
