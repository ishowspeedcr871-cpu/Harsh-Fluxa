import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAuditLog } from "@/services/audit/log";
import { verifyPassword } from "@/services/auth/password";

const MASTER_DEVELOPER_COOKIE = "fluxa_master_developer";
const MASTER_DEVELOPER_TTL_HOURS = 8;

type MasterDeveloperIdentity = {
  id: string;
  authenticatedAt: string;
};

function getMasterSecret() {
  const secret = process.env.MASTER_DEVELOPER_SESSION_SECRET || process.env.AUTH_SECRET;
  return secret || "development-master-session-secret";
}

function signPayload(payload: string) {
  return createHmac("sha256", getMasterSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function configuredMasterId() {
  const envId = process.env.MASTER_DEVELOPER_ID;
  if (envId && envId.trim() !== "" && !envId.includes("replace-with-actual")) {
    return envId.trim();
  }
  return null;
}

function configuredMasterPasswordHash() {
  const envHash = process.env.MASTER_DEVELOPER_PASSWORD_HASH;
  if (envHash && envHash.trim() !== "" && !envHash.includes("replace-with-generated")) {
    return envHash.trim();
  }
  return null;
}

function encodeSession(identity: MasterDeveloperIdentity) {
  const payload = Buffer.from(JSON.stringify(identity)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function decodeSession(rawSession?: string): MasterDeveloperIdentity | null {
  console.log("decodeSession: rawSession length:", rawSession?.length);
  const [payload, signature] = rawSession?.split(".") ?? [];
  if (!payload || !signature) {
    console.log("decodeSession failed: missing payload or signature");
    return null;
  }
  const expectedSig = signPayload(payload);
  if (!safeEqual(signature, expectedSig)) {
    console.log("decodeSession failed: signature mismatch", { signature, expectedSig });
    return null;
  }

  try {
    const identity = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as MasterDeveloperIdentity;
    const authenticatedAt = new Date(identity.authenticatedAt).getTime();
    const expiresAt = authenticatedAt + MASTER_DEVELOPER_TTL_HOURS * 60 * 60 * 1000;
    if (!identity.id) {
       console.log("decodeSession failed: no id");
       return null;
    }
    if (Number.isNaN(authenticatedAt)) {
       console.log("decodeSession failed: NaN authenticatedAt");
       return null;
    }
    if (expiresAt < Date.now()) {
       console.log("decodeSession failed: expired");
       return null;
    }
    return identity;
  } catch (err) {
    console.log("decodeSession failed: JSON parse error", err);
    return null;
  }
}

export async function authenticateMasterDeveloper(input: { masterId: string; password: string }) {
  const expectedId = configuredMasterId();
  const expectedPasswordHash = configuredMasterPasswordHash();
  const normalizedInputId = input.masterId.trim();
  
  let validId = expectedId ? (normalizedInputId.toLowerCase() === expectedId.toLowerCase()) : false;
  let validPassword = false;
  if (expectedPasswordHash) {
    if (expectedPasswordHash.startsWith("scrypt:")) {
      validPassword = verifyPassword(input.password, expectedPasswordHash);
    } else {
      validPassword = input.password === expectedPasswordHash;
    }
  }


  if (!validId || !validPassword) {
    await createAuditLog({
      action: "developer.login_failed",
      entityType: "MasterDeveloperSession",
      severity: "WARNING",
      metadata: { attemptedId: normalizedInputId || "unknown" },
    });
    return false;
  }

  const masterDeveloperId = expectedId ?? "";
  const identity: MasterDeveloperIdentity = {
    id: masterDeveloperId,
    authenticatedAt: new Date().toISOString(),
  };
  const cookieStore = await cookies();
  cookieStore.set(MASTER_DEVELOPER_COOKIE, encodeSession(identity), {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: MASTER_DEVELOPER_TTL_HOURS * 60 * 60,
  });

  await createAuditLog({
    action: "developer.login_succeeded",
    entityType: "MasterDeveloperSession",
    entityId: expectedId ?? undefined,
    metadata: { authenticatedAt: identity.authenticatedAt },
  });
  return true;
}

export async function getMasterDeveloperSession() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(MASTER_DEVELOPER_COOKIE)?.value;
  console.log("getMasterDeveloperSession: rawSession length:", rawSession?.length);
  return decodeSession(rawSession);
}

export async function revokeMasterDeveloperSession() {
  const cookieStore = await cookies();
  cookieStore.delete(MASTER_DEVELOPER_COOKIE);
}
