// Imported by scripts/check-live-paths.mjs through Node's type stripping, so
// only erasable TypeScript and explicit `.ts` specifiers here.
import { projects } from "./projects.ts";

/** Simulators served by romania-reforms under its own base path. */
const romaniaReformsSimulators = ["public-pay", "administrative-reform"];

/**
 * The source folder names of those simulators. romania-reforms answers them with permanent
 * redirect stubs, so they are checked for their target rather than for a 200.
 */
const romaniaReformsRedirects: Record<string, string> = {
  salarizare: "public-pay",
  administrativ: "administrative-reform",
};

/** Every path on this host that should answer 200 in production. */
export function livePaths(): string[] {
  return [
    "/",
    "/ro/",
    "/privacy/",
    "/ro/confidentialitate/",
    "/about/",
    "/ro/despre/",
    ...projects
      .filter((project) => project.kind !== "external")
      .map((project) => `/${project.slug}/`),
    ...romaniaReformsSimulators.map((slug) => `/romania-reforms/${slug}/`),
  ];
}

/** Every path on this host that should answer a permanent redirect, with the path it lands on. */
export function liveRedirects(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(romaniaReformsRedirects).map(([from, to]) => [
      `/romania-reforms/${from}/`,
      `/romania-reforms/${to}/`,
    ]),
  );
}
