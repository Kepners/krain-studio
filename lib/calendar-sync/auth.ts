import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { secureEqual } from "./crypto";
import { calendarEnv } from "./env";

const cookieName = "krain-calendar-setup";
const sign = (value: string) => crypto.createHmac("sha256", calendarEnv.encryptionKey()).update(value).digest("base64url");

export const createSetupSession = (response: NextResponse) => {
  const expiresAt = Date.now() + 60 * 60 * 1000;
  const value = String(expiresAt);
  response.cookies.set(cookieName, `${value}.${sign(value)}`, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 });
};

export const hasSetupSession = async () => {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const [expiresAt, signature] = value.split(".");
  return Boolean(expiresAt && signature && Number(expiresAt) > Date.now() && secureEqual(signature, sign(expiresAt)));
};

export const requireSetupSession = async () => await hasSetupSession() ? undefined : NextResponse.json({ error: "Sign in required" }, { status: 401 });

export const checkSetupPassword = (password: string) => secureEqual(password, calendarEnv.setupPassword());

export const hasCronAccess = (request: NextRequest) => {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return Boolean(supplied) && secureEqual(supplied, calendarEnv.cronSecret());
};
