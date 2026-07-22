import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/database/client";
import { SESSION_COOKIE_NAME } from "@/services/auth/constants";

const SESSION_TTL_DAYS = 30;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET environment variable is required in production");
  }
  return secret ?? "development-auth-secret";
}

function hashToken(token: string) {
  return createHmac("sha256", getAuthSecret()).update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createUserSession(userId: string, portalRole?: "CUSTOMER" | "ORGANIZATION") {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const requestHeaders = await headers();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  // We only store the hash. The cookie contains the raw token.
  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: requestHeaders.get("user-agent"),
      ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim(),
    },
  });

  const cookieStore = await cookies();
  // Cookie format: sessionId.rawToken
  cookieStore.set(SESSION_COOKIE_NAME, `${session.id}.${token}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  if (portalRole) {
    cookieStore.set("fluxa_portal_role", portalRole, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });
  }

  // Also create a refresh token for compatibility if needed, though session is the primary driver
  try {
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt,
      },
    });
  } catch (err) {
    console.warn("Prisma error during refresh token creation.", err);
  }

  return session;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawSession) return null;

  const [sessionId, token] = rawSession.split(".");
  if (!sessionId || !token) return null;

  const portalRole = cookieStore.get("fluxa_portal_role")?.value || "CUSTOMER";

  try {
    const dbSession = await prisma.session.findFirst({
      where: { id: sessionId, status: "ACTIVE" },
      include: {
        user: {
          include: {
            memberships: {
              where: { status: "ACTIVE" },
              include: {
                organization: true,
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!dbSession || !dbSession.tokenHash || !dbSession.user) return null;

    // Timing safe comparison to prevent token leakage
    const candidate = Buffer.from(hashToken(token), "hex");
    const expected = Buffer.from(dbSession.tokenHash, "hex");

    if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
      return null;
    }

    if (dbSession.expiresAt < new Date()) {
      await prisma.session.update({
        where: { id: dbSession.id },
        data: { status: "EXPIRED" }
      });
      return null;
    }

    // Enforce user-level pause/delete check
    if (dbSession.user.status === "SUSPENDED" || dbSession.user.deletedAt !== null) {
      return null;
    }

    // Filter memberships that belong to active organizations
    const activeMemberships = dbSession.user.memberships.filter((m: any) => {
      return (
        m.organization &&
        m.organization.status === "ACTIVE" &&
        m.organization.deletedAt === null
      );
    });

    return {
      session: {
        id: dbSession.id,
        userId: dbSession.userId,
        portalRole,
      },
      user: {
        id: dbSession.user.id,
        email: dbSession.user.email,
        name: dbSession.user.name,
        memberships: activeMemberships.map((m: any) => ({
          ...m,
          permissions: m.role.permissions.map((p: any) => p.permission.code),
        })),
      },
      // FOR BACKWARD COMPATIBILITY
      id: dbSession.id,
      userId: dbSession.userId,
    };
  } catch (err) {
    console.warn("Prisma error fetching session", err);
    return null;
  }
}

export async function signOutCurrentSession() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const [sessionId, token] = rawSession?.split(".") ?? [];

  if (sessionId) {
    try {
      await prisma.session.update({
        where: { id: sessionId },
        data: { status: "REVOKED", revokedAt: new Date() },
      });
    } catch (err) {
      console.warn("Prisma error revoking session", err);
    }
  }

  if (token) {
    try {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (err) {
      console.warn("Prisma error revoking refresh token", err);
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("fluxa_portal_role");
}
