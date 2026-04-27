export const palette = {
  bg: "#ece7dd",
  bgRaise: "#f4f0e6",
  ink: "#1a1d33",
  inkSoft: "rgba(26, 29, 51, 0.62)",
  rule: "rgba(26, 29, 51, 0.16)",
  plate: "#dfd9ca",
  accent: "#ff4d6e",
  accentSoft: "rgba(255, 77, 110, 0.18)",
} as const;

export type PaletteKey = keyof typeof palette;
