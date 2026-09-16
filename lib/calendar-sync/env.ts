import path from "node:path";

const value = (name: string, optional = false): string => {
  const result = process.env[name];
  if (!result && !optional) throw new Error(`Missing required calendar-sync setting: ${name}`);
  return result ?? "";
};

export const calendarEnv = {
  dbPath: () => process.env.KRAIN_CALENDAR_DB_PATH || path.join(process.cwd(), ".data", "krain-calendar-sync.db"),
  publicUrl: () => value("KRAIN_CALENDAR_PUBLIC_URL").replace(/\/$/, ""),
  encryptionKey: () => value("KRAIN_CALENDAR_ENCRYPTION_KEY"),
  setupPassword: () => value("KRAIN_CALENDAR_SETUP_PASSWORD"),
  cronSecret: () => value("KRAIN_CALENDAR_CRON_SECRET"),
  microsoftClientId: () => value("KRAIN_MICROSOFT_CLIENT_ID"),
  microsoftClientSecret: () => value("KRAIN_MICROSOFT_CLIENT_SECRET"),
  microsoftTenantId: () => value("KRAIN_MICROSOFT_TENANT_ID"),
  microsoftCalendarId: () => process.env.KRAIN_MICROSOFT_CALENDAR_ID || "primary",
  googleClientId: () => value("KRAIN_GOOGLE_CLIENT_ID"),
  googleClientSecret: () => value("KRAIN_GOOGLE_CLIENT_SECRET"),
  inboxDryRun: () => process.env.KRAIN_INBOX_DRY_RUN === "true",
  inboxImportHistorical: () => process.env.KRAIN_INBOX_IMPORT_HISTORICAL === "true",
  inboxes: () => (["krain", "buildsales"] as const).map(mailbox => {
    const prefix = `KRAIN_INBOX_${mailbox.toUpperCase()}_`;
    const host = process.env[`${prefix}HOST`];
    const user = process.env[`${prefix}USER`];
    const pass = process.env[`${prefix}PASSWORD`];
    if (!host || !user || !pass) throw new Error(`Missing required IMAP settings for ${mailbox}: HOST, USER and PASSWORD are all required.`);
    const port = Number(process.env[`${prefix}PORT`] || 993);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid IMAP port for ${mailbox}.`);
    return { mailbox, host, user, pass, port };
  }),
};
