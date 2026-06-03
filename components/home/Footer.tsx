import { palette } from "@/lib/tokens";

export function Footer() {
  return (
    <footer
      style={{
        padding: "24px 32px",
        borderTop: `1px solid ${palette.rule}`,
        display: "flex",
        justifyContent: "space-between",
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
      <span>Biggleswade · Bedfordshire</span>
    </footer>
  );
}
