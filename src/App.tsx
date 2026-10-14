import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  alternatePath,
  catalogue,
  collections,
  collectionPath,
  entryPath,
  filterOf,
  filters,
  home,
  inCollection,
  languageNames,
  privacyPath,
  resolvePage,
  runtimeHref,
  statusLabels,
  themes,
  type Entry,
  type Locale,
} from "./catalogue";
import { Privacy } from "./Privacy";
import { projectPages } from "./project-pages";
import { budgetApi, budgetHref, budgetPages } from "./budget-links";
const contact = "mailto:cristian@cristian-nichifor.com";
const month = (value: string, locale: Locale) =>
  new Date(`${value}-01T00:00:00Z`).toLocaleDateString(
    locale === "ro" ? "ro-RO" : "en-GB",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
function Status({ entry, locale }: { entry: Entry; locale: Locale }) {
  const ro = locale === "ro";
  return (
    <p className="status">
      <span className="tag">{statusLabels[entry.status][locale]}</span>
      <span>
        {ro ? "Actualizat în" : "Updated"} {month(entry.updated, locale)}
      </span>
      {entry.dataAsOf && (
        <span>
          {ro ? "Date la" : "Data as of"} {month(entry.dataAsOf.slice(0, 7), locale)}
        </span>
      )}
    </p>
  );
}
function Card({ entry, locale }: { entry: Entry; locale: Locale }) {
  const languages = entry.languages.map(
    (code) => languageNames[locale][code as Locale],
  );
  const label =
    locale === "ro"
      ? "Limba"
      : languages.length > 1
        ? "Languages"
        : "Language";
  return (
    <article className="project">
      <Status entry={entry} locale={locale} />
      <h3>
        <a className="card-link" href={entryPath(entry, locale)}>
          {entry[locale].title}
          <ArrowRight aria-hidden="true" size={20} />
        </a>
      </h3>
      <p>{entry[locale].summary}</p>
      <p className="caveat">{entry[locale].body}</p>
      <p className="meta">{`${label}: ${languages.join(", ")}`}</p>
    </article>
  );
}
function Grid({
  items,
  locale,
  label,
}: {
  items: Entry[];
  locale: Locale;
  label: string;
}) {
  return (
    <section className="project-grid" aria-label={label}>
      {items.map((item) => (
        <Card entry={item} locale={locale} key={item.id} />
      ))}
    </section>
  );
}
/** DPAL-12: the project page sections; a section without curated content is left out. */
function ProjectDetails({ entry, locale }: { entry: Entry; locale: Locale }) {
  const ro = locale === "ro";
  const page = projectPages[entry.id] ?? {};
  const related = catalogue.filter(
    (item) =>
      item.id !== entry.id &&
      (entry.collection === "civic"
        ? item.theme === entry.theme
        : filterOf(item) === filterOf(entry)),
  );
  return (
    <section className="practical project-details">
      {page.answers && (
        <>
          <h2>{ro ? "Ce răspunde" : "What it answers"}</h2>
          <ul className="answers">
            {page.answers[locale].map((answer) => (
              <li key={answer}>{answer}</li>
            ))}
          </ul>
        </>
      )}
      <aside className="callout" aria-labelledby="not">
        <h2 id="not">{ro ? "Ce nu este" : "What it is not"}</h2>
        <p>{entry[locale].body}</p>
      </aside>
      {page.howItWorks && (
        <>
          <h2>{ro ? "Cum funcționează" : "How it works"}</h2>
          <p>{page.howItWorks[locale]}</p>
        </>
      )}
      {page.sources && (
        <>
          <h2>{ro ? "Surse" : "Sources"}</h2>
          <ul>
            {page.sources.map((source) => (
              <li key={source.name}>
                {source.href ? (
                  <a href={source.href}>{source.name} ↗</a>
                ) : (
                  source.name
                )}
                {source.licence &&
                  ` (${ro ? "licență" : "licence"}: ${source.licence})`}
              </li>
            ))}
          </ul>
        </>
      )}
      {related.length > 0 && (
        <>
          <h2>{ro ? "Instrumente înrudite" : "Related tools"}</h2>
          <ul className="related">
            {related.map((item) => (
              <li key={item.id}>
                <a href={entryPath(item, locale)}>
                  {item[locale].title}
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
export function App({
  pathname = typeof window === "undefined" ? "/" : window.location.pathname,
}: {
  pathname?: string;
}) {
  const page = resolvePage(pathname);
  if (!page)
    return (
      <main>
        <h1>Page not found</h1>
        <a href="/">Explore projects</a>
      </main>
    );
  const { locale, entry, collection } = page;
  const ro = locale === "ro";
  const other = alternatePath(pathname)!;
  const items = collection
    ? catalogue.filter((item) => inCollection(item, collection.id))
    : catalogue;
  const civic = items.filter((item) => item.collection === "civic");
  const rest = items.filter((item) => item.collection !== "civic");
  const otherTitle = collections.find((c) => c.id === "other")![locale].title;
  return (
    <>
      <a className="skip" href="#main">
        {ro ? "Sari la conținut" : "Skip to content"}
      </a>
      <header className="site-header wrap">
        <a className="brand" href={home(locale)}>
          Cristian Nichifor
          <span>
            {ro ? "Instrumente civice deschise" : "Open civic tools"}
          </span>
        </a>
        <nav aria-label={ro ? "Navigare principală" : "Main navigation"}>
          <a href={`https://cristian-nichifor.com${home(locale)}`}>
            {ro ? "Lucrează cu mine" : "Work with me"}
          </a>
          <a href={other} lang={ro ? "en" : "ro"} hrefLang={ro ? "en" : "ro"}>
            {ro ? "English" : "Română"}
          </a>
        </nav>
      </header>
      <main id="main" className="wrap">
        {"privacy" in page ? (
          <Privacy locale={locale} />
        ) : entry ? (
          <>
            <a className="back" href={collectionPath(filterOf(entry), locale)}>
              <ArrowLeft size={16} aria-hidden="true" />
              {collections.find((c) => c.id === filterOf(entry))?.[locale].title}
            </a>
            <section className="hero detail">
              <Status entry={entry} locale={locale} />
              <h1>{entry[locale].title}</h1>
              <p className="lead">{entry[locale].summary}</p>
              <div className="actions">
                {entry.id !== "google-contacts" && (
                  <a className="button" href={runtimeHref(entry)}>
                    {entry.id === "civic-ui"
                      ? ro
                        ? "Vezi componentele"
                        : "Explore components"
                      : ro
                        ? "Deschide proiectul"
                        : "Open project"}{" "}
                    {entry.runtime.kind === "external" ? (
                      <ArrowUpRight aria-hidden="true" size={18} />
                    ) : (
                      <ArrowRight aria-hidden="true" size={18} />
                    )}
                  </a>
                )}
                <a
                  className={
                    entry.id === "google-contacts" ? "button" : "text-link"
                  }
                  href={entry.source}
                >
                  {ro ? "Vezi codul sursă" : "View source"} ↗
                </a>
              </div>
              {entry.collection === "civic" && (
                <p className="note">
                  {ro
                    ? "Instrumentele vizează România. Limba aplicației și disponibilitatea datelor pot diferi de această pagină de prezentare."
                    : "These tools focus on Romania. Application language and data availability may differ from this presentation page."}
                </p>
              )}
            </section>
            <ProjectDetails entry={entry} locale={locale} />
            {entry.id === "romania-budget-dashboard" && (
              <section className="practical" aria-labelledby="dashboards">
                <h2 id="dashboards">
                  {ro ? "Dashboard-uri" : "Dashboards"}
                </h2>
                <div className="project-grid">
                  {budgetPages.map((link) => (
                    <article className="project" key={link.path.en}>
                      <h3>
                        <a href={budgetHref(link, locale)}>
                          {link[locale].title}
                          <ArrowUpRight aria-hidden="true" size={20} />
                        </a>
                      </h3>
                      <p>{link[locale].body}</p>
                      <span className="project-action">
                        {ro ? "Surse" : "Sources"}: {link.sources}
                      </span>
                    </article>
                  ))}
                </div>
                <h2>{ro ? "Pentru dezvoltatori" : "For developers"}</h2>
                <div className="project-grid">
                  <article className="project">
                    <h3>
                      <a href={budgetApi.href}>
                        {budgetApi[locale].title}
                        <ArrowUpRight aria-hidden="true" size={20} />
                      </a>
                    </h3>
                    <p>{budgetApi[locale].body}</p>
                    <span className="project-action">
                      {budgetApi.endpoints}
                    </span>
                  </article>
                </div>
              </section>
            )}
            {entry.id === "google-contacts" && (
              <section className="pack-story" aria-labelledby="workflow">
                <div>
                  <p className="eyebrow">
                    {ro ? "Exemplu de utilizare" : "An example workflow"}
                  </p>
                  <h2 id="workflow">
                    {ro
                      ? "Un loc pentru contacte și context."
                      : "One place for contacts and context."}
                  </h2>
                  <p>
                    {ro
                      ? "O echipă poate organiza contactele lângă proiectele și relațiile gestionate în Coda. Exemplul de mai jos este ilustrativ, nu o demonstrație conectată."
                      : "A team can organize contacts alongside the projects and relationships it manages in Coda. The example below is illustrative, not a connected demo."}
                  </p>
                  <ol>
                    <li>
                      {ro
                        ? "Conectează un cont de test Google."
                        : "Connect a Google test account."}
                    </li>
                    <li>
                      {ro
                        ? "Adu contactele și grupurile într-un document Coda."
                        : "Bring contacts and groups into a Coda document."}
                    </li>
                    <li>
                      {ro
                        ? "Testează actualizările pe date demonstrative înainte de utilizarea reală."
                        : "Test updates with sample data before using real contacts."}
                    </li>
                  </ol>
                </div>
                <aside className="example">
                  <span className="tag">
                    {ro ? "Date fictive" : "Sample data"}
                  </span>
                  <h3>Alex Morgan</h3>
                  <p>alex@example.com</p>
                  <div className="example-row">
                    <span>{ro ? "Grup" : "Group"}</span>
                    <strong>{ro ? "Colaboratori" : "Collaborators"}</strong>
                  </div>
                  <div className="example-row">
                    <span>{ro ? "Următorul pas" : "Next step"}</span>
                    <strong>
                      {ro ? "Discută proiectul" : "Discuss the project"}
                    </strong>
                  </div>
                </aside>
              </section>
            )}
            {entry.id === "google-contacts" && (
              <section className="practical">
                <h2>{ro ? "Înainte de utilizare" : "Before you use it"}</h2>
                <dl>
                  <div>
                    <dt>{ro ? "Configurare" : "Setup"}</dt>
                    <dd>
                      {ro
                        ? "Implementarea documentează un proiect Google Cloud cu People API, credențiale OAuth și configurare în Coda Pack Studio. Consultă instrucțiunile din sursă."
                        : "The implementation documents a Google Cloud project with People API, OAuth credentials and Coda Pack Studio setup. Follow the source instructions."}
                    </dd>
                  </div>
                  <div>
                    <dt>{ro ? "Acces la date" : "Data access"}</dt>
                    <dd>
                      {ro
                        ? "Conectarea solicită acces la contacte și profil. Acțiunile de actualizare pot modifica Google Contacts. Verifică permisiunile și folosește un cont de test."
                        : "Connecting requests contacts and profile access. Update actions can change Google Contacts. Review permissions and use a test account."}
                    </dd>
                  </div>
                  <div>
                    <dt>{ro ? "Stadiu și limite" : "Status & limitations"}</dt>
                    <dd>
                      {ro
                        ? "Prototip. Sincronizarea și operațiunile de scriere necesită validare cu furnizorul înainte de utilizarea în producție. Nu este disponibil aici un link de instalare verificat."
                        : "Prototype. Sync and write operations need provider acceptance testing before production use. No verified public installation link is available here."}
                    </dd>
                  </div>
                </dl>
              </section>
            )}
          </>
        ) : (
          <>
            <section className="hero">
              <p className="eyebrow">
                {ro
                  ? "Construit de Cristian Nichifor"
                  : "Built by Cristian Nichifor"}
              </p>
              <h1>
                {collection ? (
                  collection[locale].title
                ) : ro ? (
                  <>
                    Instrumente deschise pentru a înțelege
                    <br />
                    <em>statul român.</em>
                  </>
                ) : (
                  <>
                    Open tools for understanding
                    <br />
                    <em>the Romanian state.</em>
                  </>
                )}
              </h1>
              <p className="lead">
                {ro
                  ? "Instrumente civice independente și open source care explică date publice din România: buget, achiziții, legislație și propuneri de reformă, cu sursele la vedere. Nu sunt afiliate statului român sau vreunei instituții publice."
                  : "Independent, open-source civic tools that explain Romanian public data: budgets, procurement, legislation and reform proposals, with their sources shown. Not affiliated with the Romanian state or any public institution."}
              </p>
            </section>
            <nav
              className="collections"
              aria-label={ro ? "Colecții de proiecte" : "Project collections"}
            >
              <a
                href={home(locale)}
                aria-current={!collection ? "page" : undefined}
              >
                {ro ? "Toate proiectele" : "All projects"}
              </a>
              {filters.map((id) => (
                <a
                  key={id}
                  href={collectionPath(id, locale)}
                  aria-current={collection?.id === id ? "page" : undefined}
                >
                  {collections.find((c) => c.id === id)![locale].title}
                </a>
              ))}
            </nav>
            {themes.map((theme) => {
              const group = civic.filter((item) => item.theme === theme.id);
              return (
                group.length > 0 && (
                  <section className="theme" key={theme.id}>
                    <h2>{theme[locale]}</h2>
                    <Grid items={group} locale={locale} label={theme[locale]} />
                  </section>
                )
              );
            })}
            {rest.length > 0 &&
              (civic.length > 0 ? (
                <section className="theme">
                  <h2>{otherTitle}</h2>
                  <Grid items={rest} locale={locale} label={otherTitle} />
                </section>
              ) : (
                <Grid
                  items={rest}
                  locale={locale}
                  label={ro ? "Proiecte" : "Projects"}
                />
              ))}
          </>
        )}
        {!("privacy" in page) && entry?.collection !== "civic" && (
          <section className="invitation">
            <p className="eyebrow">
              {ro
                ? "De la exemplu la nevoia ta"
                : "From an example to your own challenge"}
            </p>
            <h2>
              {ro
                ? "Ai o problemă pe care merită să o rezolvăm?"
                : "Have a problem worth working through?"}
            </h2>
            <p>
              {ro
                ? "Spune-mi ce încerci să îmbunătățești. Putem discuta un flux Coda, o integrare sau o experiență web mai bună."
                : "Tell me what you are trying to improve. We can discuss a Coda workflow, an integration, or a better web experience."}
            </p>
            <a className="button" href={contact}>
              {ro ? "Hai să discutăm" : "Let’s talk"}
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          </section>
        )}
      </main>
      <footer className="wrap">
        <span>© {new Date().getFullYear()} Cristian Nichifor</span>
        <a href="https://github.com/CristianNichifor">GitHub ↗</a>
        <a href={contact}>{ro ? "Contact" : "Get in touch"}</a>
        <a href={privacyPath(locale)}>
          {ro ? "Confidențialitate" : "Privacy"}
        </a>
      </footer>
    </>
  );
}
