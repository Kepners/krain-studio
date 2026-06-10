"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";
import { MagneticBtn } from "@/components/ui/MagneticBtn";

const LOGO_HEIGHT = 52;

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

const NAV = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // Lock body scroll + Escape-to-close while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Rendered in a portal to <body> so the header's backdrop-filter doesn't trap
  // the fixed-position overlay inside the header box.
  const drawer = (
    <AnimatePresence>
      {open && (
        <motion.div
          id="krain-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: palette.bg,
            display: "flex",
            flexDirection: "column",
            padding:
              "max(14px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/" aria-label="Krain Studio home" onClick={() => setOpen(false)} style={{ display: "flex" }}>
              <Image src="/krain/logo-wordmark.png" alt="Krain Studio" width={113} height={42} style={{ height: 42, width: "auto", display: "block" }} />
            </a>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{
                width: 44,
                height: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 22,
                color: palette.ink,
              }}
            >
              ✕
            </button>
          </div>

          <nav aria-label="Mobile" style={{ display: "flex", flexDirection: "column", marginTop: 28, flex: 1 }}>
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: SANS,
                  fontWeight: 300,
                  fontSize: "clamp(30px, 9vw, 44px)",
                  letterSpacing: "-0.03em",
                  color: palette.ink,
                  textDecoration: "none",
                  padding: "16px 0",
                  borderTop: `1px solid ${palette.rule}`,
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="/contact"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              marginTop: 24,
              borderRadius: 999,
              background: palette.accent,
              color: palette.bg,
              textDecoration: "none",
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: "0.02em",
            }}
          >
            Start a brief →
          </a>

          <div
            style={{
              marginTop: 22,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: palette.inkSoft,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <a href="mailto:matt@krain.studio" onClick={() => setOpen(false)} style={{ color: palette.inkSoft, textDecoration: "none" }}>
              matt@krain.studio
            </a>
            <span>Biggleswade · Bedfordshire</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        className="krain-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(236,231,221,0.78)",
          padding: "14px max(32px, env(safe-area-inset-right)) 14px max(32px, env(safe-area-inset-left))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          borderBottom: `1px solid ${palette.rule}`,
        }}
      >
        <a href="/" aria-label="Krain Studio home" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/krain/logo-wordmark.png"
            alt="Krain Studio"
            width={137}
            height={52}
            priority
            className="krain-logo"
            style={{ height: LOGO_HEIGHT, width: "auto", display: "block" }}
          />
        </a>

        <nav aria-label="Primary" style={{ display: "flex", gap: 32, fontSize: 13 }} className="krain-nav">
          {NAV.map((item) => (
            <AnimLink key={item.label} href={item.href} style={{ color: palette.ink, opacity: 0.85 }}>
              {item.label}
            </AnimLink>
          ))}
        </nav>

        <span className="krain-cta-desktop" style={{ display: "inline-flex" }}>
          <MagneticBtn primary href="/contact" ariaLabel="Start a brief">
            Start a brief →
          </MagneticBtn>
        </span>

        <button
          type="button"
          className="krain-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="krain-mobile-menu"
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "none",
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: palette.ink,
            padding: 0,
          }}
        >
          <span aria-hidden style={{ position: "relative", display: "block", width: 24, height: 14 }}>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: open ? 6 : 0,
                width: 24,
                height: 2,
                background: palette.ink,
                borderRadius: 2,
                transition: reduce ? "none" : "transform .3s, top .3s",
                transform: open ? "rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: open ? 6 : 0,
                width: 24,
                height: 2,
                background: palette.ink,
                borderRadius: 2,
                transition: reduce ? "none" : "transform .3s, bottom .3s",
                transform: open ? "rotate(-45deg)" : "none",
              }}
            />
          </span>
        </button>

        <style>{`
          .krain-burger { display: none; }
          @media (max-width: 900px) {
            .krain-header { padding: 14px max(20px, env(safe-area-inset-right)) 14px max(20px, env(safe-area-inset-left)) !important; }
            .krain-nav { display: none !important; }
            .krain-cta-desktop { display: none !important; }
            .krain-burger { display: inline-flex !important; }
            .krain-logo { height: 48px !important; }
          }
          @media (max-width: 520px) {
            .krain-header { gap: 16px !important; padding: 12px max(16px, env(safe-area-inset-right)) 12px max(16px, env(safe-area-inset-left)) !important; }
            .krain-logo { height: 42px !important; }
          }
        `}</style>
      </header>

      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
