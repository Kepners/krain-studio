"use client";

import { FormEvent, useEffect, useState } from "react";

type Status = {
  googleConnected: boolean;
  googleCalendarId: string | null;
  writesPaused: { reason: string; at: string } | null;
};

/** Turns the reason the sync recorded into a sentence a person can read. */
const whyItIsOff = (reason: string) => {
  if (reason.includes("never enabled")) return "It has never been switched on since the invitation problem on 3 September.";
  if (reason.includes("was written")) return "Krain saw the same meeting being copied over and over, so it stopped itself.";
  if (reason.includes("writes in")) return "Krain saw far too many changes in one hour, so it stopped itself.";
  if (reason.startsWith("switched off by")) return `Someone switched it off (${reason.replace("switched off by ", "")}).`;
  return reason;
};

const box = { border: "1px solid #ddd", borderRadius: 8, padding: "1rem 1.25rem", margin: "1.5rem 0" };

export default function CalendarSyncPage() {
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  const load = async () => {
    const response = await fetch("/api/calendar-sync/status");
    if (response.ok) { setSignedIn(true); setStatus(await response.json() as Status); }
  };
  useEffect(() => { void load(); }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/calendar-sync/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    if (!response.ok) { setMessage("That password did not work."); return; }
    setPassword(""); setMessage(""); await load();
  };

  const setSwitch = async (on: boolean) => {
    setBusy(true); setMessage("");
    const response = await fetch("/api/calendar-sync/switch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ on, name }) });
    const result = await response.json().catch(() => null) as { error?: string } | null;
    setBusy(false);
    if (!response.ok) { setMessage(result?.error ?? "That did not work."); return; }
    setName(""); await load();
  };

  const copyingIsOn = status ? status.writesPaused === null : false;

  return <main style={{ maxWidth: 640, margin: "8rem auto", padding: "0 1.5rem", fontFamily: "sans-serif", lineHeight: 1.7 }}>
    <p style={{ letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12 }}>Krain Studio</p>
    <h1>Calendar sync</h1>

    {!signedIn ? <form onSubmit={signIn}>
      <p>Enter the private setup password to connect your Gmail calendar.</p>
      <input aria-label="Setup password" type="password" value={password} onChange={event => setPassword(event.target.value)} required />
      <button type="submit">Open setup</button>
      {message && <p>{message}</p>}
    </form> : <section>

      <p><strong>kepners@gmail.com is your master calendar.</strong></p>
      <p>Invitations from both work inboxes are copied into it.</p>
      <p>Nobody is emailed. Guest addresses are never copied.</p>

      <p>Google Calendar: <strong>{status?.googleConnected ? "connected" : "not connected"}</strong></p>
      <button onClick={() => { window.location.href = "/api/calendar-sync/connect/google"; }}>Connect Google Calendar</button>

      <div style={box}>
        <h2 style={{ fontSize: 18, margin: "0 0 .5rem" }}>Copying</h2>

        {copyingIsOn ? <>
          <p><strong>Copying is on.</strong></p>
          <p>Krain checks both work inboxes every few minutes.</p>
          <p>New, changed, and cancelled invitations update Gmail.</p>
          <button onClick={() => void setSwitch(false)} disabled={busy}>Switch copying off</button>
        </> : <>
          <p><strong>Copying is off.</strong></p>
          <p>{whyItIsOff(status?.writesPaused?.reason ?? "")}</p>
          <p>Nothing is being copied while it is off.</p>

          <p style={{ marginTop: "1.25rem" }}><strong>If you switch it on, Krain will:</strong></p>
          <ul>
            <li>read invitation files from both work inboxes</li>
            <li>copy each meeting into your Gmail calendar</li>
            <li>never copy guest email addresses</li>
            <li>never write anything to Outlook</li>
            <li>never send an email to anyone</li>
          </ul>
          <p>Any meeting it stopped stays stopped until you start it yourself.</p>

          <p>Type your name, then switch it on.</p>
          <input aria-label="Your name" placeholder="Your name" value={name} onChange={event => setName(event.target.value)} />{" "}
          <button onClick={() => void setSwitch(true)} disabled={busy || !name.trim()}>Switch copying on</button>
        </>}

        {message && <p><strong>{message}</strong></p>}
      </div>

    </section>}
  </main>;
}
