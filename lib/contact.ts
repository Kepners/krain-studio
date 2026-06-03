// Single source of truth for every way someone can reach Krain Studio.
//
// To turn a channel on, fill in its value below. Empty string = channel is
// hidden everywhere on the site (so nothing ships as a broken/placeholder link).
//
//   whatsappNumber — international format, DIGITS ONLY (no +, spaces or dashes).
//                    UK mobile 07700 900123  ->  "447700900123"
//   linkedinUrl    — full profile URL, e.g. "https://www.linkedin.com/in/matt-krain"
//
const config = {
  email: "matt@krain.studio",
  whatsappNumber: "447740363639", // 07740 363639 in international format
  linkedinUrl: "", // TODO: set me — e.g. "https://www.linkedin.com/in/your-handle"
} as const;

// Pre-filled message that drops into WhatsApp when a visitor taps the button.
const WHATSAPP_GREETING =
  "Hi Matt — I've got a set of plans I'd like to discuss.";

export type Channel = {
  /** stable key for React lists */
  key: "email" | "whatsapp" | "linkedin";
  /** short button label */
  label: string;
  /** the value shown / used (address, handle, etc.) */
  value: string;
  /** href the button points at */
  href: string;
  /** true for off-site links (opens new tab, adds rel=noopener) */
  external: boolean;
  /** accessible label for screen readers */
  aria: string;
};

export const contact = {
  email: config.email,
  whatsappNumber: config.whatsappNumber,
  linkedinUrl: config.linkedinUrl,

  /** mailto: link */
  emailHref: `mailto:${config.email}`,

  /** WhatsApp "click to chat" deep link, or "" if not configured */
  whatsappHref: config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(WHATSAPP_GREETING)}`
    : "",
};

/**
 * Every configured channel, in display order. Channels with no value set are
 * omitted automatically, so callers can map over this without guarding.
 */
export function channels(): Channel[] {
  const list: Channel[] = [
    {
      key: "email",
      label: config.email,
      value: config.email,
      href: contact.emailHref,
      external: false,
      aria: `Email ${config.email}`,
    },
  ];

  if (contact.whatsappHref) {
    list.push({
      key: "whatsapp",
      label: "WhatsApp",
      value: contact.whatsappNumber,
      href: contact.whatsappHref,
      external: true,
      aria: "Message Krain Studio on WhatsApp",
    });
  }

  if (config.linkedinUrl) {
    list.push({
      key: "linkedin",
      label: "LinkedIn",
      value: config.linkedinUrl,
      href: config.linkedinUrl,
      external: true,
      aria: "Connect with Krain Studio on LinkedIn",
    });
  }

  return list;
}
