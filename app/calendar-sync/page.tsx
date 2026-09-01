"use client";

import { FormEvent, useEffect, useState } from "react";

type Status = { microsoftConnected: boolean; googleConnected: boolean; googleCalendarId: string | null; migratedAt: string | null };

export default function CalendarSyncPage() {
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState("");
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
  return <main style={{ maxWidth: 640, margin: "8rem auto", padding: "0 1.5rem", fontFamily: "sans-serif" }}>
    <p style={{ letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12 }}>Krain Studio</p>
    <h1>Calendar sync</h1>
    {!signedIn ? <form onSubmit={signIn}><p>Enter the private setup password to connect Outlook and Google.</p><input aria-label="Setup password" type="password" value={password} onChange={event => setPassword(event.target.value)} required /><button type="submit">Open setup</button>{message && <p>{message}</p>}</form> : <section>
      <p>Google Calendar receives Krain events only. BuildSales is not connected here.</p>
      <p>Microsoft Outlook: <strong>{status?.microsoftConnected ? "connected" : "not connected"}</strong></p>
      <p>Google Calendar: <strong>{status?.googleConnected ? "connected" : "not connected"}</strong></p>
      <button onClick={() => { window.location.href = "/api/calendar-sync/connect/microsoft"; }}>Connect Microsoft 365</button>{" "}
      <button onClick={() => { window.location.href = "/api/calendar-sync/connect/google"; }}>Connect Google Calendar</button>
      {status?.migratedAt && <p>Existing Outlook events were copied on {new Date(status.migratedAt).toLocaleString()}.</p>}
    </section>}
  </main>;
}
