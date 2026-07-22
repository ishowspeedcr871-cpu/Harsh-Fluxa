const crypto = require("crypto");
const MASTER_DEVELOPER_TTL_HOURS = 8;
function getMasterSecret() { return "development-master-session-secret"; }
function signPayload(payload) {
  return crypto.createHmac("sha256", getMasterSecret()).update(payload).digest("base64url");
}
function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
function encodeSession(identity) {
  const payload = Buffer.from(JSON.stringify(identity)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}
function decodeSession(rawSession) {
  const [payload, signature] = rawSession?.split(".") ?? [];
  if (!payload || !signature || !safeEqual(signature, signPayload(payload))) return null;
  try {
    const identity = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const authenticatedAt = new Date(identity.authenticatedAt).getTime();
    const expiresAt = authenticatedAt + MASTER_DEVELOPER_TTL_HOURS * 60 * 60 * 1000;
    if (!identity.id || Number.isNaN(authenticatedAt) || expiresAt < Date.now()) return null;
    return identity;
  } catch (e) {
    console.error(e);
    return null;
  }
}
const id = { id: "Harsh", authenticatedAt: new Date().toISOString() };
const enc = encodeSession(id);
console.log("enc", enc);
const dec = decodeSession(enc);
console.log("dec", dec);
