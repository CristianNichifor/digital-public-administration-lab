import metadata from "./catalogue-content.json";
import freshness from "./freshness.json";
import { projects, siteOrigin } from "./projects";
export type Locale = "en" | "ro";
export const origin = siteOrigin;
export const collections = [
  {
    id: "coda-packs",
    en: { slug: "coda-packs", title: "Coda Packs" },
    ro: { slug: "pachete-coda", title: "Pachete Coda" },
  },
  {
    id: "tools",
    en: { slug: "tools", title: "Tools & libraries" },
    ro: { slug: "instrumente", title: "Instrumente și biblioteci" },
  },
  {
    id: "civic",
    en: { slug: "civic", title: "Civic projects" },
    ro: { slug: "proiecte-civice", title: "Proiecte civice" },
  },
  {
    id: "experiments",
    en: { slug: "experiments", title: "Experiments & prototypes" },
    ro: { slug: "experimente", title: "Experimente și prototipuri" },
  },
  {
    id: "other",
    en: { slug: "other", title: "Other" },
    ro: { slug: "altele", title: "Altele" },
  },
];
/**
 * The filters offered in the navigation. Coda Packs, tools and experiments hold one entry each,
 * so they share "Other"; their own collection pages stay reachable at their old URLs.
 */
export const filters = ["civic", "other"];
/** Whether an entry belongs on a collection's page; "other" gathers everything that is not civic. */
export function inCollection(entry: { collection: string }, id: string) {
  return id === "other" ? entry.collection !== "civic" : entry.collection === id;
}
/** The listing an entry's back link returns to: its filter, not its one-entry collection. */
export function filterOf(entry: { collection: string }) {
  return entry.collection === "civic" ? "civic" : "other";
}
export const statusLabels = {
  "live-data": { en: "Live data", ro: "Date reale" },
  "demo-data": { en: "Demo data", ro: "Date demonstrative" },
  prototype: { en: "Prototype", ro: "Prototip" },
  archived: { en: "Archived", ro: "Arhivat" },
};
export type Status = keyof typeof statusLabels;
export const themes = [
  { id: "money", en: "Money", ro: "Bani publici" },
  { id: "law-reform", en: "Law & reform", ro: "Legi și reforme" },
  { id: "state-digital", en: "State & digital", ro: "Stat și digital" },
];
export const languageNames = {
  en: { en: "English", ro: "Romanian" },
  ro: { en: "engleză", ro: "română" },
};
export const home = (locale: Locale) => (locale === "ro" ? "/ro/" : "/");
export const privacyMeta = {
  en: {
    title: "Privacy",
    description:
      "Who runs projects.cristian-nichifor.com, what data a visit involves, and which services process it.",
  },
  ro: {
    title: "Confidențialitate",
    description:
      "Cine administrează projects.cristian-nichifor.com, ce date implică o vizită și ce servicii le prelucrează.",
  },
};
export const privacyPath = (locale: Locale) =>
  locale === "ro" ? "/ro/confidentialitate/" : "/privacy/";
function lastCommitMonth(repository: string) {
  const date = (freshness as Record<string, string>)[repository];
  if (!date) throw new Error(`Missing freshness for ${repository}; run scripts/refresh-freshness.mjs`);
  return date.slice(0, 7);
}
export const catalogue = projects.map((runtime) => {
  const content = metadata[runtime.slug as keyof typeof metadata];
  if (!content) throw new Error(`Missing catalogue content: ${runtime.slug}`);
  return {
    ...content,
    status: content.status as Status,
    updated: lastCommitMonth(content.repository),
    theme: "theme" in content ? content.theme : undefined,
    dataAsOf: "dataAsOf" in content ? (content.dataAsOf as string) : undefined,
    id: runtime.slug,
    runtime,
    source: `https://github.com/CristianNichifor/${content.repository}`,
  };
});
export type Entry = (typeof catalogue)[number];
export function collectionPath(id: string, locale: Locale) {
  const collection = collections.find((item) => item.id === id);
  if (!collection) throw new Error(`Unknown collection: ${id}`);
  return `${home(locale)}${collection[locale].slug}/`;
}
export function entryPath(entry: Entry, locale: Locale) {
  return `${collectionPath(entry.collection, locale)}${entry[locale].slug}/`;
}
export const pages = (["en", "ro"] as const).flatMap((locale) => [
  { path: home(locale), locale, collection: undefined, entry: undefined },
  {
    path: privacyPath(locale),
    locale,
    collection: undefined,
    entry: undefined,
    privacy: true,
  },
  ...collections.map((collection) => ({
    path: collectionPath(collection.id, locale),
    locale,
    collection,
    entry: undefined,
  })),
  ...catalogue.map((entry) => ({
    path: entryPath(entry, locale),
    locale,
    collection: collections.find((c) => c.id === entry.collection),
    entry,
  })),
]);
export function resolvePage(path: string) {
  return pages.find((page) => page.path === path);
}
export function alternatePath(path: string) {
  const page = resolvePage(path);
  if (!page) return null;
  const locale = page.locale === "en" ? "ro" : "en";
  if (page.entry) return entryPath(page.entry, locale);
  if ("privacy" in page) return privacyPath(locale);
  if (page.collection) return collectionPath(page.collection.id, locale);
  return home(locale);
}
export function runtimeHref(entry: Entry) {
  return entry.runtime.kind === "external"
    ? entry.runtime.href
    : `/${entry.runtime.slug}/`;
}
