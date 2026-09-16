# Gmail-master calendar sync

## What it does

`kepners@gmail.com` is the single master calendar.

The server reads `text/calendar` invitations from `matt@krain.studio` and
`matt@buildsales.homes` over read-only IMAP access. It creates a plain event in Gmail.

Krain meetings use the `KS -` prefix. BuildSales meetings use `BSH -`.

The 2 work addresses are IMAP mailboxes. They do not have independent Microsoft calendar folders.
Adding Gmail to Outlook shows the same master calendar there without copying it again.

## Safety rules

- Scheduled maintenance never writes to Outlook or Microsoft Graph.
- Google event bodies contain no attendee list or guest email addresses.
- Every Google write uses `sendUpdates=none`.
- Each Mailcow app password permits IMAP only, never SMTP.
- A stable invitation key prevents repeated events.
- Google failures remain retryable. They are not recorded as completed messages.
- The first live pass records current mailbox positions and imports no old mail.
- A per-meeting write limit stops a repeated update loop.

## Live setup

1. Publish the Google OAuth consent screen to Production so its refresh token lasts.
2. Restrict the OAuth request to the `calendar.events` scope.
3. Create an IMAP-only Mailcow app password for each work mailbox.
4. Store both passwords only in Contabo's private runtime environment file.
5. Deploy the application and reconnect `kepners@gmail.com`.
6. Run the first baseline pass with historical import disabled.
7. Send 1 controlled test invitation and prove exactly 1 Gmail event appears.
8. Add Gmail to Outlook so that same master calendar is visible there.

## Never

- Never restore Google-to-Outlook or Outlook calendar writes.
- Never forward invitation emails between accounts.
- Never copy attendees into the Gmail event body.
- Never enable SMTP for the mailbox app passwords.
- Never backfill old invitation mail without reviewing the proposed events first.
