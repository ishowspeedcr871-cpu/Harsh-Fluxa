import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_TTL_MINUTES = 15;
export const OTP_DIGITS = 4;

export function getOtpSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable is required in production");
    }
    console.warn("AUTH_SECRET is missing. Falling back to development secret.");
    return "development-auth-secret";
  }
  return secret;
}

export function normalizeOtp(code: string) {
  return code.replace(/\D/g, "").slice(0, OTP_DIGITS);
}

export function hashOtp(code: string) {
  return createHmac("sha256", getOtpSecret()).update(normalizeOtp(code)).digest("hex");
}

export function compareOtp(code: string, codeHash: string) {
  const candidate = Buffer.from(hashOtp(code), "hex");
  const expected = Buffer.from(codeHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function generateOtpCode() {
  return randomInt(0, 10 ** OTP_DIGITS)
    .toString()
    .padStart(OTP_DIGITS, "0");
}
