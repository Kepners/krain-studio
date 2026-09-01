import { NextResponse } from "next/server";
import { requireSetupSession } from "@/lib/calendar-sync/auth";
import { calendarSyncStatus } from "@/lib/calendar-sync/service";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireSetupSession();
  return denied ?? NextResponse.json(calendarSyncStatus());
}
