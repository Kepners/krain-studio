import { palette } from "@/lib/tokens";
import { channels } from "@/lib/contact";

export function Footer() {
  return (
    <footer
      style={{
        padding: "24px 32px",
        borderTop: `1px solid ${palette.rule}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        opacity: 0.55,
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      }}
    >
      <span>© Krain Studio · MMXXVI</span>
      <nav
        aria-label="Site links and contact channels"
        style={{ display: "flex", gap: 20, flexWrap: "wrap" }}
      >
        <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
          Privacy
        </a>
        {channels().map((c) => (
          <a
            key={c.key}
            href={c.href}
            aria-label={c.aria}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noopener noreferrer" : undefined}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {c.key === "email" ? "Email" : c.label}
          </a>
        ))}
      </nav>
      <span>Biggleswade · Bedfordshire</span>
    </footer>
  );
}
