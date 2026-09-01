# Krain calendar sync

## What it does

Krain uses its own Microsoft 365 calendar and a separate Google calendar named **Krain Studio**.

It never reads, writes, or imports BuildSales calendar data.

The service stores the Outlook event ID and Google event ID together.

An Outlook edit updates that Google event.

A Google edit updates that Outlook event.

The stored content fingerprint prevents the return notification from creating a loop.

## First connection

1. Create a Microsoft Entra app for Krain.
2. Add `https://www.krain.studio/api/calendar-sync/callback/microsoft` as its web redirect URL.
3. Give it delegated `Calendars.ReadWrite` permission.
4. For `kepners@outlook.com`, set the Microsoft tenant value to `consumers`.
5. Create a Google OAuth web client.
6. Add `https://www.krain.studio/api/calendar-sync/callback/google` as its authorised redirect URL.
7. Enable Google Calendar API and use the `calendar` scope.
8. Put the IDs and secrets in the private Contabo environment file.
9. Open `https://www.krain.studio/calendar-sync` and connect Microsoft first, then Google.

When both accounts connect, Krain creates a separate Google calendar named **Krain Studio**.

It copies existing Outlook events once, then starts two-way sync.

## Safety rules

- The Microsoft subscription renews before its 7-day expiry.
- The Google watch channel renews before it expires.
- A 5-minute private schedule reconciles both calendars after missed webhooks.
- Deleted events are deleted on the linked calendar only.
- Tokens are encrypted in Krain's private data volume.
- The connection page needs the setup password from the private environment file.

## Deliberate boundary

This service has no BuildSales URL, secret, database connection, or calendar ID.

BuildSales can appear in Google Calendar separately without interacting with Krain.
