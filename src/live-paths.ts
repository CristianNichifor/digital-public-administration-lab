// Imported by scripts/check-live-paths.mjs through Node's type stripping, so
// only erasable TypeScript and explicit `.ts` specifiers here.
import { projects } from "./projects.ts";

/**
 * Simulators served by romania-reforms under its own base path. `salarizare` and `administrativ`
 * are the source folder names; romania-reforms is to answer them with redirect stubs.
 */
const romaniaReformsSimulators = [
  "salarizare",
  "administrativ",
  "public-pay",
  "administrative-reform",
];

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
