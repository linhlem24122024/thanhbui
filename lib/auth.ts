import "server-only";
import { SignJWT, jwtVerify } from "jose";

const MEMBER_COOKIE = "phk_session";
const ADMIN_COOKIE = "phk_admin_session";
const MEMBER_TTL = "7d";
const ADMIN_TTL = "12h";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Thiếu AUTH_SECRET trong biến môi trường (.env.local).");
  return new TextEncoder().encode(secret);
}

export async function signMemberToken(memberId: string): Promise<string> {
  return new SignJWT({ memberId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MEMBER_TTL)
    .sign(getSecret());
}

export async function verifyMemberToken(token: string): Promise<{ memberId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.memberId !== "string") return null;
    return { memberId: payload.memberId };
  } catch {
    return null;
  }
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_TTL)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const cookieNames = { member: MEMBER_COOKIE, admin: ADMIN_COOKIE } as const;
