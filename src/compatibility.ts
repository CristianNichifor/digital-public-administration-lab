import { alternatePath, origin, resolvePage } from "./catalogue";
import { projects } from "./projects";
/** Enable only after canonical-host and browser-storage recovery acceptance. */
export function compatibilityRedirect(
  url: URL,
  enabled: boolean,
): string | null {
  if (
    !enabled ||
    ![
      "digital.cristian-nichifor.com",
      "proiecte.cristian-nichifor.com",
    ].includes(url.hostname)
  )
    return null;
  const normalized = url.pathname.endsWith("/")
    ? url.pathname
    : `${url.pathname}/`;
  const page = resolvePage(normalized);
  let target: string | undefined;
  if (page)
    target =
      url.hostname.startsWith("proiecte.") && page.locale === "en"
        ? alternatePath(page.path)!
        : page.path;
  else if (
    projects.some(
      (p) =>
        p.kind !== "external" &&
        (url.pathname === `/${p.slug}` ||
          url.pathname.startsWith(`/${p.slug}/`)),
    )
  )
    target = url.pathname;
  else {
    for (const [alias, runtime] of [
      ["salarizare", "salarizare"],
      ["administrativ", "administrativ"],
    ]) {
      if (url.pathname === `/${alias}` || url.pathname.startsWith(`/${alias}/`))
        target = `/romania-reforms/${runtime}${url.pathname.slice(alias.length + 1) || "/"}`;
    }
  }
  return target ? `${origin}${target}${url.search}${url.hash}` : null;
}
