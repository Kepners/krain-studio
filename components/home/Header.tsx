"use client";

import Image from "next/image";
import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";
import { MagneticBtn } from "@/components/ui/MagneticBtn";

const NAV = [
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Services", href: "#services" },
  { label: "Journal", href: "#journal" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(236,231,221,0.78)",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 24,
        borderBottom: `1px solid ${palette.rule}`,
      }}
    >
      <a href="#" aria-label="Krain Studio home" style={{ display: "flex", alignItems: "center" }}>
        <Image
          src="/krain/logo.png"
          alt="Krain Studio"
          width={140}
          height={34}
          priority
          style={{ height: 34, width: "auto", display: "block" }}
        />
      </a>
      <nav
        aria-label="Primary"
        style={{ display: "flex", gap: 32, fontSize: 13 }}
        className="krain-nav"
      >
        {NAV.map((item) => (
          <AnimLink
            key={item.label}
            href={item.href}
            style={{ color: palette.ink, opacity: 0.85 }}
          >
            {item.label}
          </AnimLink>
        ))}
      </nav>
      <MagneticBtn primary href="#contact" ariaLabel="Start a brief">
        Start a brief →
      </MagneticBtn>
      <style>{`
        @media (max-width: 900px) {
          .krain-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
}
