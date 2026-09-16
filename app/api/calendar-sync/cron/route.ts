import { NextRequest, NextResponse } from "next/server";
import { hasCronAccess } from "@/lib/calendar-sync/auth";
import { maintainInboxCalendarSync } from "@/lib/calendar-sync/service";

export const runtime = "nodejs";

/** This schedule reads only the 2 IMAP work inboxes. It never reads or writes Microsoft Graph. */
export async function POST(request: NextRequest) {
  if (!hasCronAccess(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    await maintainInboxCalendarSync();
    return NextResponse.json({ ok: true });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Calendar maintenance failed" }, { status: 500 });
  }
}
