import metadata from "./catalogue-content.json";
import { projects } from "./projects";
export type Locale = "en" | "ro";
export const origin = "https://projects.cristian-nichifor.com";
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
];
export const home = (locale: Locale) => (locale === "ro" ? "/ro/" : "/");
export const catalogue = projects.map((runtime) => {
  const content = metadata[runtime.slug as keyof typeof metadata];
  if (!content) throw new Error(`Missing catalogue content: ${runtime.slug}`);
  return {
    ...content,
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
  return page.entry
    ? entryPath(page.entry, locale)
    : page.collection
      ? collectionPath(page.collection.id, locale)
      : home(locale);
}
export function runtimeHref(entry: Entry) {
  return entry.runtime.kind === "external"
    ? entry.runtime.href
    : `/${entry.runtime.slug}/`;
}
