import type { Locale } from "./catalogue";
const nouns = {
  tool: { en: ["tool", "tools"], ro: ["instrument", "instrumente"] },
  project: { en: ["project", "projects"], ro: ["proiect", "proiecte"] },
};
/** "3 instrumente" / "1 tool"; the catalogue never reaches Romanian's "de" plural (20+). */
export function countLabel(n: number, locale: Locale, noun: keyof typeof nouns) {
  return `${n} ${nouns[noun][locale][n === 1 ? 0 : 1]}`;
}
