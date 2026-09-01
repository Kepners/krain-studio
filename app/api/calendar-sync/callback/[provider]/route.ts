import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@/lib/calendar-sync/providers";
import { finishConnection } from "@/lib/calendar-sync/service";
import { calendarEnv } from "@/lib/calendar-sync/env";
import type { Provider } from "@/lib/calendar-sync/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const setupPage = (query: string) => new URL(`/calendar-sync?${query}`, calendarEnv.publicUrl());
  if (error) return NextResponse.redirect(setupPage(`error=${encodeURIComponent(error)}`));
  if ((provider !== "google" && provider !== "microsoft") || !code || !state) return NextResponse.json({ error: "Invalid calendar connection callback" }, { status: 400 });
  try {
    await exchangeAuthorizationCode(provider as Provider, code, state);
    await finishConnection();
    return NextResponse.redirect(setupPage(`connected=${provider}`));
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Connection failed";
    return NextResponse.redirect(setupPage(`error=${encodeURIComponent(message)}`));
  }
}
