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
};
