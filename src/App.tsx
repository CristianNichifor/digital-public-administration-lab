import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Database,
  ExternalLink,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { categories, projects, type Project } from "./projects";

const STATUS_LABEL: Record<Project["kind"], string> = {
  proxied: "Live",
  mounted: "Live",
  external: "Source only",
};

function hrefFor(project: Project): string {
  return project.kind === "external" ? (project.href ?? "#") : `/${project.slug}/`;
}

const flow = [
  {
    title: "Citizen action",
    copy: "The mounted demo starts with a local identity, credential, signed request payload, and no personal data on the public trail.",
    icon: UserRoundCheck,
  },
  {
    title: "State transition",
    copy: "Each Law 544 step moves through deterministic rules: registry, routing, processing, evidence, response, or exception.",
    icon: GitBranch,
  },
  {
    title: "Public ledger proof",
    copy: "The browser records action type, hashes, signer role, timestamp, and chain links so the audit history stays inspectable.",
    icon: Database,
  },
  {
    title: "Verification surface",
    copy: "Citizens can open the mounted app, inspect the trail, export receipts, and compare received documents with recorded hashes.",
    icon: FileCheck2,
  },
];

export function App() {
  return (
    <main className="appShell">
      <header className="hero">
        <div>
          <p className="eyebrow">Civic projects</p>
          <h1>Romanian civic tech, in one place</h1>
          <p>
            Deterministic, explainable, browser-first instruments for public debate: reform
            simulators, open procurement and budget data, draft-legislation linting, and digital
            public administration demos.
          </p>
        </div>
        <a className="primaryLink" href="/bureaucracy-as-code/">
          Open Bureaucracy as Code
          <ArrowRight aria-hidden="true" size={18} />
        </a>
      </header>

      <section className="statusBand" aria-label="How this host works">
        <article>
          <BadgeCheck aria-hidden="true" />
          <span>One host</span>
          <strong>Every project is a path, not a subdomain</strong>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" />
          <span>Runtime boundary</span>
          <strong>Static browser demos, no required backend</strong>
        </article>
        <article>
          <Boxes aria-hidden="true" />
          <span>Independence</span>
          <strong>Each project builds and deploys from its own repo</strong>
        </article>
      </section>

      {categories.map((category) => {
        const inCategory = projects.filter((project) => project.category === category);

        if (inCategory.length === 0) {
          return null;
        }

        return (
          <section className="moduleSection" aria-labelledby={`category-${category}`} key={category}>
            <div className="sectionHeader">
              <p className="eyebrow">Projects</p>
              <h2 id={`category-${category}`}>{category}</h2>
            </div>
            <div className="moduleGrid">
              {inCategory.map((project) => (
                <a className="moduleCard" href={hrefFor(project)} key={project.slug}>
                  <span>{STATUS_LABEL[project.kind]}</span>
                  <strong>{project.title}</strong>
                  <p>{project.description}</p>
                  <small>
                    {project.kind === "external" ? "View source" : `/${project.slug}`}
                    <ExternalLink aria-hidden="true" size={14} />
                  </small>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <section className="flowSection" aria-labelledby="flow-title">
        <div className="sectionHeader">
          <p className="eyebrow">Data flow</p>
          <h2 id="flow-title">What happens in Bureaucracy as Code</h2>
        </div>
        <div className="flowRail" aria-label="Bureaucracy as Code data flow">
          {flow.map((step, index) => {
            const Icon = step.icon;

            return (
              <article className="flowCard" key={step.title}>
                <span className="flowIndex">{String(index + 1).padStart(2, "0")}</span>
                <Icon aria-hidden="true" size={20} />
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="notes" id="host-model" aria-labelledby="host-model-title">
        <div>
          <p className="eyebrow">Scope</p>
          <h2 id="host-model-title">Route, do not rebuild</h2>
        </div>
        <p>
          Each project stays authoritative in its own repository and deploys on its own cadence.
          This host owns the public URL and nothing else: <code>/bureaucracy-as-code/</code> is
          built into it, and every other path is proxied to the origin that already serves that
          project. Moving a project to a different origin therefore changes one line in{" "}
          <code>src/projects.ts</code> and no public URL.
        </p>
        <p>
          One consequence worth naming: everything served here shares a single browser origin, so
          the storage isolation that separate subdomains gave the signed-identity demo no longer
          applies. Treat the demo keys in <code>/bureaucracy-as-code/</code> as demo keys.
        </p>
      </section>
    </main>
  );
}
