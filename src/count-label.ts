import type { Locale } from "./catalogue";

/** DS-1: "2 tools" / "2 instrumente" after a theme heading. */
export function countLabel(n: number, locale: Locale, kind: "tool" | "project") {
  const ro = locale === "ro";
  const word =
    kind === "tool"
      ? ro
        ? n === 1
          ? "instrument"
          : "instrumente"
        : n === 1
          ? "tool"
          : "tools"
      : ro
        ? n === 1
          ? "proiect"
          : "proiecte"
        : n === 1
          ? "project"
          : "projects";
  return `${n} ${word}`;
}
