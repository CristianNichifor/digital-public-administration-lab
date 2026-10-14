import { readFile, writeFile, mkdir } from "node:fs/promises";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { pages, origin, alternatePath, privacyMeta, aboutMeta } from "./catalogue";
import { catalogueHeaderRules } from "./security-headers";
const template = await readFile("dist/index.html", "utf8");
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const image = `${origin}/og-image.png`;
for (const page of pages) {
  const imageAlt =
    page.locale === "ro"
      ? "Cristian Nichifor: instrumente deschise pentru a înțelege statul român."
      : "Cristian Nichifor: open tools for understanding the Romanian state.";
  const privacy =
    "privacy" in page
      ? privacyMeta[page.locale]
      : "about" in page
        ? aboutMeta[page.locale]
        : undefined;
  const title = `${page.entry?.[page.locale].title ?? privacy?.title ?? page.collection?.[page.locale].title ?? (page.locale === "en" ? "Open civic tools about the Romanian state" : "Instrumente civice deschise despre statul român")} — Cristian Nichifor`;
  const description =
    page.entry?.[page.locale].summary ??
    privacy?.description ??
    (page.locale === "en"
      ? "Independent, open-source civic tools that explain Romanian public data. Not affiliated with the Romanian state or any public institution."
      : "Instrumente civice independente și open source care explică date publice din România. Nu sunt afiliate statului român sau vreunei instituții publice.");
  const enPath = page.locale === "en" ? page.path : alternatePath(page.path)!;
  const roPath = page.locale === "ro" ? page.path : alternatePath(page.path)!;
  const metadata = `<meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin}${page.path}"><link rel="alternate" hreflang="en" href="${origin}${enPath}"><link rel="alternate" hreflang="ro" href="${origin}${roPath}"><link rel="alternate" hreflang="x-default" href="${origin}${enPath}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin}${page.path}"><meta property="og:type" content="website"><meta property="og:site_name" content="Cristian Nichifor"><meta property="og:locale" content="${page.locale === "ro" ? "ro_RO" : "en_US"}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(imageAlt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${image}">`;
  const html = template
    .replace('<html lang="en">', `<html lang="${page.locale}">`)
    .replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
    .replace("</head>", metadata + "</head>")
    .replace(
      '<div id="root"></div>',
      `<div id="root">${renderToString(<App pathname={page.path} />)}</div>`,
    );
  await mkdir(`dist${page.path}`, { recursive: true });
  await writeFile(`dist${page.path}index.html`, html);
}
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((p) => `<url><loc>${origin}${p.path}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "dist/_headers",
  (await readFile("dist/_headers", "utf8")) +
    catalogueHeaderRules(pages.map((p) => p.path)),
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(`Prerendered ${pages.length} bilingual catalogue pages.`);
