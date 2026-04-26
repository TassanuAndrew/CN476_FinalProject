import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "dev-secret-change-me"
);

export const ADMIN_COOKIE = "kanomjeen_admin";

export async function signAdminToken(adminId: number): Promise<string> {
  return await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyAdminToken(
  token: string | undefined | null
): Promise<{ adminId: number } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { adminId: payload.adminId as number };
  } catch {
    return null;
  }
}

export async function getAdminFromCookies(): Promise<{ adminId: number } | null> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}
