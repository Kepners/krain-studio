import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { seal, unseal } from "./crypto";
import { calendarEnv } from "./env";
import type { EventLink, OAuthToken, Provider } from "./types";

let database: Database.Database | undefined;

const db = () => {
  if (database) return database;
  const dbPath = calendarEnv.dbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new Database(dbPath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS event_links (
      outlook_event_id TEXT PRIMARY KEY,
      google_event_id TEXT NOT NULL UNIQUE,
      outlook_hash TEXT NOT NULL,
      google_hash TEXT NOT NULL,
      deleted_at TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS received_notifications (
      provider TEXT NOT NULL,
      notification_id TEXT NOT NULL,
      received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(provider, notification_id)
    );
    CREATE TABLE IF NOT EXISTS write_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      event_id TEXT NOT NULL,
      written_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS write_audit_recent ON write_audit(provider, event_id, written_at);
  `);
  return database;
};

export const getSetting = (key: string) => db().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;

export const setSetting = (key: string, value: string) => {
  db().prepare(`INSERT INTO settings(key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`).run(key, value);
};

export const deleteSetting = (key: string) => db().prepare("DELETE FROM settings WHERE key = ?").run(key);

export const getSecretJson = <T>(key: string): T | undefined => {
  const row = getSetting(key);
  return row ? JSON.parse(unseal(row.value)) as T : undefined;
};

export const setSecretJson = (key: string, value: unknown) => setSetting(key, seal(JSON.stringify(value)));

export const getToken = (provider: Provider) => getSecretJson<OAuthToken>(`${provider}:token`);
export const setToken = (provider: Provider, token: OAuthToken) => setSecretJson(`${provider}:token`, token);

const eventLinkFields = "outlook_event_id AS outlookEventId, google_event_id AS googleEventId, outlook_hash AS outlookHash, google_hash AS googleHash, deleted_at AS deletedAt";

export const getLinkByOutlook = (outlookEventId: string) => db().prepare(`SELECT ${eventLinkFields} FROM event_links WHERE outlook_event_id = ?`).get(outlookEventId) as EventLink | undefined;
export const getLinkByGoogle = (googleEventId: string) => db().prepare(`SELECT ${eventLinkFields} FROM event_links WHERE google_event_id = ?`).get(googleEventId) as EventLink | undefined;

export const saveLink = (link: EventLink) => {
  db().prepare(`INSERT INTO event_links(outlook_event_id, google_event_id, outlook_hash, google_hash, deleted_at, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(outlook_event_id) DO UPDATE SET google_event_id = excluded.google_event_id,
      outlook_hash = excluded.outlook_hash, google_hash = excluded.google_hash,
      deleted_at = excluded.deleted_at, updated_at = CURRENT_TIMESTAMP`).run(link.outlookEventId, link.googleEventId, link.outlookHash, link.googleHash, link.deletedAt);
};

export const markDeleted = (link: EventLink) => saveLink({ ...link, deletedAt: new Date().toISOString() });
export const listActiveLinks = () => db().prepare(`SELECT ${eventLinkFields} FROM event_links WHERE deleted_at IS NULL`).all() as EventLink[];
export const clearEventLinks = () => db().prepare("DELETE FROM event_links").run();

export const recordWrite = (provider: Provider, eventId: string) => db().prepare("INSERT INTO write_audit(provider, event_id) VALUES (?, ?)").run(provider, eventId);

export const countRecentWrites = (provider: Provider, eventId: string | undefined, minutes: number) => {
  const since = `-${Math.max(0, Math.trunc(minutes))} minutes`;
  const row = eventId === undefined
    ? db().prepare("SELECT COUNT(*) AS total FROM write_audit WHERE provider = ? AND written_at >= datetime('now', ?)").get(provider, since) as { total: number }
    : db().prepare("SELECT COUNT(*) AS total FROM write_audit WHERE provider = ? AND event_id = ? AND written_at >= datetime('now', ?)").get(provider, eventId, since) as { total: number };
  return row.total;
};

export const listRecentWrites = (provider: Provider, minutes: number) => db().prepare("SELECT provider, event_id AS eventId, written_at AS writtenAt FROM write_audit WHERE provider = ? AND written_at >= datetime('now', ?) ORDER BY written_at DESC").all(provider, `-${Math.max(0, Math.trunc(minutes))} minutes`) as { provider: Provider; eventId: string; writtenAt: string }[];

export const acceptNotification = (provider: Provider, notificationId: string) => {
  try {
    db().prepare("INSERT INTO received_notifications(provider, notification_id) VALUES (?, ?)").run(provider, notificationId);
    return true;
  } catch {
    return false;
  }
};

export const calendarDb = { db, getSetting, setSetting, deleteSetting, getSecretJson, setSecretJson, getToken, setToken, getLinkByOutlook, getLinkByGoogle, saveLink, markDeleted, listActiveLinks, clearEventLinks, acceptNotification, recordWrite, countRecentWrites, listRecentWrites };
