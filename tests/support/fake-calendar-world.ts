// A stand-in Microsoft and Google, for driving the real sync service end to end.
//
// Nothing under lib/calendar-sync is stubbed; only the two providers are.
//
// The Microsoft side deliberately ACCEPTS writes it should never be sent. If the
// sync ever issues one, the world serves it and the request stays visible in the
// recorder, so a check can assert on it. A world that refused would hide the very
// thing the checks exist to catch.
//
// Two Microsoft behaviours are reproduced faithfully, because both caused defects:
//   - Graph stores a description as HTML, so text handed to it comes back escaped.
//   - Graph sends a BARE timestamp with a separate timeZone field, never a "Z".

import { escapeOnce, BST_DAY, type Recorded } from "./calendar-rig";

export type GraphEvent = Record<string, unknown> & { id: string };
export type GoogleEvent = Record<string, unknown> & { id: string };

export const graphStoredBody = (text: string) => ({ contentType: "html", content: `<html><head></head><body><p>${escapeOnce(text)}</p></body></html>` });

/** How Microsoft Graph actually writes a time: no offset on the value, the zone in its own field. */
export const graphTime = (day: string, clock: string) => ({ dateTime: `${day}T${clock}.0000000`, timeZone: "UTC" });

export class FakeCalendarWorld {
  readonly outlook = new Map<string, GraphEvent>();
  readonly google = new Map<string, GoogleEvent>();
  private nextGoogle = 1;
  /** Every request the world could not route. A non-empty list is a defect in the check, never a pass. */
  readonly unrouted: Recorded[] = [];
  /** Every request that would have CHANGED a Microsoft calendar. Must always be empty. */
  readonly outlookChanges: Recorded[] = [];

  seedOutlook(event: Partial<GraphEvent> & { id: string; description?: string }) {
    const { description, ...rest } = event;
    const stored: GraphEvent = {
      subject: "Site visit",
      location: { displayName: "Unit 4" },
      start: graphTime(BST_DAY, "09:00:00"),
      end: graphTime(BST_DAY, "10:00:00"),
      attendees: [],
      body: graphStoredBody(description ?? "Bring the as-built set"),
      ...rest,
    } as GraphEvent;
    this.outlook.set(stored.id, stored);
    return stored;
  }

  seedGoogle(event: Partial<GoogleEvent> & { id: string }) {
    const stored: GoogleEvent = {
      summary: "KS - Site visit",
      description: "Bring the as-built set",
      location: "Unit 4",
      start: { dateTime: `${BST_DAY}T09:00:00.000Z`, timeZone: "UTC" },
      end: { dateTime: `${BST_DAY}T10:00:00.000Z`, timeZone: "UTC" },
      recurrence: [],
      ...event,
    } as GoogleEvent;
    this.google.set(stored.id, stored);
    return stored;
  }

  handle = (call: Recorded): unknown => {
    const url = new URL(call.url);
    const segments = url.pathname.split("/").filter(Boolean);
    if (url.hostname === "graph.microsoft.com") return this.handleGraph(call, segments, url);
    if (url.hostname === "www.googleapis.com") return this.handleGoogle(call, segments, url);
    this.unrouted.push(call);
    throw new Error(`the fake world was asked for an unexpected host: ${call.method} ${call.url}`);
  };

  private handleGraph(call: Recorded, segments: string[], url: URL): unknown {
    const events = segments.indexOf("events");
    if (events === -1) { this.unrouted.push(call); throw new Error(`unexpected Graph path: ${call.method} ${url.pathname}`); }
    const raw = segments[events + 1];
    const id = raw ? decodeURIComponent(raw) : undefined;

    if (call.method === "GET") {
      if (id === undefined) return { value: [...this.outlook.values()] };
      const found = this.outlook.get(id);
      if (!found) return new Response(JSON.stringify({ error: { code: "ErrorItemNotFound" } }), { status: 404 });
      return found;
    }

    // Anything below this line should be unreachable. It is served, not refused, so a check can see it.
    this.outlookChanges.push(call);
    if (call.method === "POST" && id === undefined) {
      const created = { id: `AAMkOutlook-forbidden-${this.outlookChanges.length}`, ...(call.body as Record<string, unknown>) } as GraphEvent;
      this.outlook.set(created.id, created);
      return created;
    }
    if (call.method === "DELETE" && id !== undefined) { this.outlook.delete(id); return undefined; }
    if (id !== undefined) {
      const merged = { ...(this.outlook.get(id) ?? { id }), ...(call.body as Record<string, unknown>), id } as GraphEvent;
      this.outlook.set(id, merged);
      return merged;
    }
    return { id: "AAMkOutlook-forbidden" };
  }

  private handleGoogle(call: Recorded, segments: string[], url: URL): unknown {
    const events = segments.indexOf("events");
    if (events === -1) {
      if (call.method === "DELETE") return undefined; // deleting a whole calendar
      this.unrouted.push(call); throw new Error(`unexpected Google path: ${call.method} ${url.pathname}`);
    }
    const raw = segments[events + 1];
    const id = raw ? decodeURIComponent(raw) : undefined;

    if (call.method === "GET") {
      if (id === undefined) return { items: [...this.google.values()] };
      const found = this.google.get(id);
      if (!found) return new Response(JSON.stringify({ error: { message: "Not Found" } }), { status: 404 });
      return found;
    }
    if (call.method === "POST" && id === undefined) {
      const created = { ...(call.body as Record<string, unknown>), id: `google-${this.nextGoogle += 1}` } as GoogleEvent;
      this.google.set(created.id, created);
      return created;
    }
    if (call.method === "PUT" && id !== undefined) {
      const replaced = { ...(call.body as Record<string, unknown>), id } as GoogleEvent;
      this.google.set(id, replaced);
      return replaced;
    }
    if (call.method === "DELETE" && id !== undefined) { this.google.delete(id); return undefined; }
    this.unrouted.push(call);
    throw new Error(`unexpected Google request: ${call.method} ${url.pathname}`);
  }
}
