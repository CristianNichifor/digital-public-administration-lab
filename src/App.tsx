import { ArrowRight, BadgeCheck, Boxes, ExternalLink, ShieldCheck } from "lucide-react";

const modules = [
  {
    title: "Bureaucracy as Code",
    status: "Released v0.1.0",
    href: "/bureaucracy-as-code/",
    description:
      "Law 544/2001 requests as signed, trackable, tamper-evident browser state transitions.",
  },
  {
    title: "Digital Romania Atlas",
    status: "Next intake",
    href: "https://github.com/CristianNichifor/digital-romania-atlas",
    description:
      "The existing atlas work remains a sibling module in the lab instead of absorbing unrelated demos.",
  },
  {
    title: "Identity Playground",
    status: "Planned",
    href: "#planned-modules",
    description:
      "DID-like identities, verifiable credential presentation, and local privacy-preserving role proofs.",
  },
  {
    title: "Audit Log Explorer",
    status: "Planned",
    href: "#planned-modules",
    description:
      "A generic signed event-chain viewer extracted from the bureaucracy demo after the parent host is live.",
  },
];

export function App() {
  return (
    <main className="appShell">
      <header className="hero">
        <div>
          <p className="eyebrow">digital.cristian-nichifor.com</p>
          <h1>Digital Public Administration Lab</h1>
          <p>
            Browser-first Romanian civic demos for identity, signed administrative workflows,
            transparent audit trails, and public-service state machines.
          </p>
        </div>
        <a className="primaryLink" href="/bureaucracy-as-code/">
          Open Bureaucracy as Code
          <ArrowRight aria-hidden="true" size={18} />
        </a>
      </header>

      <section className="statusBand" aria-label="Release status">
        <article>
          <BadgeCheck aria-hidden="true" />
          <span>Current release</span>
          <strong>bureaucracy-as-code v0.1.0</strong>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" />
          <span>Runtime boundary</span>
          <strong>Static browser demos, no required backend</strong>
        </article>
        <article>
          <Boxes aria-hidden="true" />
          <span>Mount strategy</span>
          <strong>Sibling modules under one digital host</strong>
        </article>
      </section>

      <section className="moduleSection" aria-labelledby="modules-title">
        <div className="sectionHeader">
          <p className="eyebrow">Modules</p>
          <h2 id="modules-title">Lab index</h2>
        </div>
        <div className="moduleGrid">
          {modules.map((module) => (
            <a className="moduleCard" href={module.href} key={module.title}>
              <span>{module.status}</span>
              <strong>{module.title}</strong>
              <p>{module.description}</p>
              <small>
                Open
                <ExternalLink aria-hidden="true" size={14} />
              </small>
            </a>
          ))}
        </div>
      </section>

      <section className="notes" id="planned-modules" aria-labelledby="planned-title">
        <div>
          <p className="eyebrow">Scope</p>
          <h2 id="planned-title">Mount, do not rebuild</h2>
        </div>
        <p>
          The Bureaucracy as Code app remains authoritative in its standalone repository. This host
          builds that repo and mounts its static output at <code>/bureaucracy-as-code/</code>.
          Future identity and audit-log modules should be extracted as sibling routes, not copied
          into the Law 544 workflow internals.
        </p>
      </section>
    </main>
  );
}
