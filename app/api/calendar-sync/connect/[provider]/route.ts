import { NextRequest, NextResponse } from "next/server";
import { requireSetupSession } from "@/lib/calendar-sync/auth";
import { authorizationUrl } from "@/lib/calendar-sync/providers";
import type { Provider } from "@/lib/calendar-sync/types";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const denied = await requireSetupSession();
  if (denied) return denied;
  const { provider } = await context.params;
  if (provider !== "google" && provider !== "microsoft") return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  return NextResponse.redirect(authorizationUrl(provider as Provider));
}
