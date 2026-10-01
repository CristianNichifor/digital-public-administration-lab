import { readFile, writeFile, mkdir } from "node:fs/promises";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { pages, origin, alternatePath } from "./catalogue";
const template = await readFile("dist/index.html", "utf8");
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const page of pages) {
  const title = `${page.entry?.[page.locale].title ?? page.collection?.[page.locale].title ?? (page.locale === "en" ? "Projects & ideas in practice" : "Proiecte și idei în practică")} — Cristian Nichifor`;
  const description =
    page.entry?.[page.locale].summary ??
    (page.locale === "en"
      ? "Coda Packs, developer tools and civic projects by Cristian Nichifor."
      : "Pachete Coda, instrumente pentru dezvoltatori și proiecte civice create de Cristian Nichifor.");
  const enPath = page.locale === "en" ? page.path : alternatePath(page.path)!;
  const roPath = page.locale === "ro" ? page.path : alternatePath(page.path)!;
  const metadata = `<meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin}${page.path}"><link rel="alternate" hreflang="en" href="${origin}${enPath}"><link rel="alternate" hreflang="ro" href="${origin}${roPath}"><link rel="alternate" hreflang="x-default" href="${origin}${enPath}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin}${page.path}"><meta property="og:type" content="website">`;
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
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(`Prerendered ${pages.length} bilingual catalogue pages.`);
