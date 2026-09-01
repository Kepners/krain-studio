import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@/lib/calendar-sync/providers";
import { finishConnection } from "@/lib/calendar-sync/service";
import type { Provider } from "@/lib/calendar-sync/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL(`/calendar-sync?error=${encodeURIComponent(error)}`, request.url));
  if ((provider !== "google" && provider !== "microsoft") || !code || !state) return NextResponse.json({ error: "Invalid calendar connection callback" }, { status: 400 });
  try {
    await exchangeAuthorizationCode(provider as Provider, code, state);
    await finishConnection();
    return NextResponse.redirect(new URL(`/calendar-sync?connected=${provider}`, request.url));
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Connection failed";
    return NextResponse.redirect(new URL(`/calendar-sync?error=${encodeURIComponent(message)}`, request.url));
  }
}
