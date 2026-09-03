// A two-provider world for driving the real sync service end to end.
//
// It is a stand-in for Microsoft and Google, not for any lib/calendar-sync code:
// every module under test is the real one. The world reproduces the one Microsoft
// behaviour that caused the incident — Graph stores a description as HTML, so
// text handed to it comes back escaped one level more than it went in.

import { escapeOnce, type Recorded } from "./calendar-rig";

export type GraphEvent = Record<string, unknown> & { id: string };
export type GoogleEvent = Record<string, unknown> & { id: string };

export const graphStoredBody = (text: string) => ({ contentType: "html", content: `<html><head></head><body><p>${escapeOnce(text)}</p></body></html>` });

export class FakeCalendarWorld {
  readonly outlook = new Map<string, GraphEvent>();
  readonly google = new Map<string, GoogleEvent>();
  private nextOutlook = 1;
  private nextGoogle = 1;
  private syncToken = 0;
  /** Every request the world could not route. A non-empty list is a defect in the check, never a pass. */
  readonly unrouted: Recorded[] = [];

  seedOutlook(event: Partial<GraphEvent> & { id: string; description?: string }) {
    const { description, ...rest } = event;
    const stored: GraphEvent = {
      subject: "Site visit",
      location: { displayName: "Unit 4" },
      start: { dateTime: "2026-09-10T09:00:00.0000000", timeZone: "UTC" },
      end: { dateTime: "2026-09-10T10:00:00.0000000", timeZone: "UTC" },
      attendees: [],
      body: description === undefined ? graphStoredBody("Bring the as-built set") : graphStoredBody(description),
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
      start: { dateTime: "2026-09-10T09:00:00.000Z", timeZone: "UTC" },
      end: { dateTime: "2026-09-10T10:00:00.000Z", timeZone: "UTC" },
      attendees: [],
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
    if (segments.includes("subscriptions")) {
      if (call.method === "POST" || call.method === "PATCH") return { id: "graph-subscription-1", expirationDateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() };
      this.unrouted.push(call);
      throw new Error(`unexpected Graph subscription request: ${call.method} ${url.pathname}`);
    }
    // /v1.0/me/events  or  /v1.0/me/events/{id}
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
    if (call.method === "POST" && id === undefined) {
      const created = this.applyGraphBody({ id: `AAMkOutlook-${this.nextOutlook += 1}`, attendees: [] } as GraphEvent, call.body);
      this.outlook.set(created.id, created);
      return created;
    }
    if (call.method === "PATCH" && id !== undefined) {
      const existing = this.outlook.get(id);
      if (!existing) return new Response(JSON.stringify({ error: { code: "ErrorItemNotFound" } }), { status: 404 });
      const updated = this.applyGraphBody({ ...existing }, call.body);
      this.outlook.set(id, updated);
      return updated;
    }
    if (call.method === "DELETE" && id !== undefined) { this.outlook.delete(id); return undefined; }
    this.unrouted.push(call);
    throw new Error(`unexpected Graph request: ${call.method} ${url.pathname}`);
  }

  /** Microsoft stores a description as HTML, so text it is given comes back escaped one level more. */
  private applyGraphBody(target: GraphEvent, body: unknown): GraphEvent {
    const sent = (body ?? {}) as Record<string, unknown>;
    const next: GraphEvent = { ...target };
    for (const key of ["subject", "location", "start", "end", "isAllDay", "recurrence"]) {
      if (sent[key] !== undefined) next[key] = sent[key];
    }
    const sentBody = sent.body as { content?: string; contentType?: string } | undefined;
    if (sentBody !== undefined) next.body = graphStoredBody(String(sentBody.content ?? ""));
    if (sent.attendees !== undefined) next.attendees = sent.attendees;
    return next;
  }

  private handleGoogle(call: Recorded, segments: string[], url: URL): unknown {
    const events = segments.indexOf("events");
    if (events === -1) {
      if (call.method === "DELETE") return undefined; // deleting a whole calendar
      this.unrouted.push(call); throw new Error(`unexpected Google path: ${call.method} ${url.pathname}`);
    }
    const raw = segments[events + 1];
    const id = raw ? decodeURIComponent(raw) : undefined;

    if (id === "watch") return { id: "google-channel-1", resourceId: "google-resource-1", expiration: String(Date.now() + 24 * 60 * 60 * 1000) };
    if (call.method === "GET") {
      if (id === undefined) return { items: [...this.google.values()], nextSyncToken: `token-${this.syncToken += 1}` };
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
