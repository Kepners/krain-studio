export type Provider = "google" | "microsoft";

export type CalendarDateTime =
  | { kind: "date"; value: string }
  | { kind: "dateTime"; value: string };

export type CalendarAttendee = {
  email: string;
  name?: string;
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
};

export type NormalizedEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  start: CalendarDateTime;
  end: CalendarDateTime;
  attendees: CalendarAttendee[];
  recurrence: string[];
};

export type OAuthToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type EventLink = {
  outlookEventId: string;
  googleEventId: string;
  outlookHash: string;
  googleHash: string;
  deletedAt: string | null;
};
