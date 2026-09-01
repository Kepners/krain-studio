import { NextRequest, NextResponse } from "next/server";
import { calendarDb } from "@/lib/calendar-sync/db";
import { reconcileMicrosoft } from "@/lib/calendar-sync/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const validationToken = request.nextUrl.searchParams.get("validationToken");
  if (validationToken) return new NextResponse(validationToken, { status: 200, headers: { "content-type": "text/plain" } });
  const body = await request.json().catch(() => null) as { value?: Record<string, unknown>[] } | null;
  const subscription = calendarDb.getSecretJson<{ clientState: string }>("microsoft:subscription");
  if (!body?.value || !subscription) return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  for (const item of body.value) {
    if (item.clientState !== subscription.clientState) return NextResponse.json({ error: "Invalid notification signature" }, { status: 401 });
    const notificationId = String(item.id ?? "");
    if (!notificationId || !calendarDb.acceptNotification("microsoft", notificationId)) continue;
    void reconcileMicrosoft().catch(console.error);
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
