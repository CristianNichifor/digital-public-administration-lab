import { ArrowUpRight, ArrowLeft } from "lucide-react";
import {
  alternatePath,
  catalogue,
  collections,
  collectionPath,
  entryPath,
  home,
  resolvePage,
  runtimeHref,
  type Entry,
  type Locale,
} from "./catalogue";
const contact = "mailto:cristian@cristian-nichifor.com";
const status = {
  en: { beta: "Beta", prototype: "Prototype", maintained: "Maintained" },
  ro: { beta: "Beta", prototype: "Prototip", maintained: "Întreținut" },
};
function Card({ entry, locale }: { entry: Entry; locale: Locale }) {
  return (
    <article className="project">
      <span className="tag">
        {status[locale][entry.lifecycle as keyof typeof status.en]}
      </span>
      <h3>
        <a href={entryPath(entry, locale)}>
          {entry[locale].title}
          <ArrowUpRight aria-hidden="true" size={20} />
        </a>
      </h3>
      <p>{entry[locale].summary}</p>
      <span className="project-action">
        {locale === "en" ? "Explore the project" : "Descoperă proiectul"} ↗
      </span>
    </article>
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
    ? catalogue.filter((item) => item.collection === collection.id)
    : catalogue;
  return (
    <>
      <a className="skip" href="#main">
        {ro ? "Sari la conținut" : "Skip to content"}
      </a>
      <header className="site-header wrap">
        <a className="brand" href={home(locale)}>
          Cristian Nichifor
          <span>
            {ro
              ? "Proiecte și idei în practică"
              : "Projects & ideas in practice"}
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
        {entry ? (
          <>
            <a className="back" href={collectionPath(entry.collection, locale)}>
              <ArrowLeft size={16} aria-hidden="true" />
              {collection?.[locale].title}
            </a>
            <section className="hero detail">
              <p className="eyebrow">
                {status[locale][entry.lifecycle as keyof typeof status.en]}
              </p>
              <h1>{entry[locale].title}</h1>
              <p className="lead">{entry[locale].summary}</p>
              <p>{entry[locale].body}</p>
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
                    <ArrowUpRight aria-hidden="true" size={18} />
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
                        ? "Versiune beta. Sincronizarea și operațiunile de scriere necesită validare cu furnizorul înainte de utilizarea în producție. Nu este disponibil aici un link de instalare verificat."
                        : "Beta. Sync and write operations need provider acceptance testing before production use. No verified public installation link is available here."}
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
                    Idei care devin
                    <br />
                    <em>instrumente utile.</em>
                  </>
                ) : (
                  <>
                    Ideas turned into
                    <br />
                    <em>useful tools.</em>
                  </>
                )}
              </h1>
              <p className="lead">
                {ro
                  ? "Integrări pentru munca de zi cu zi, componente reutilizabile și instrumente pentru întrebări publice mai bune. Explorează ce construiesc și cum gândesc."
                  : "Integrations for everyday work, reusable components, and tools for better public questions. Explore what I build and how I think."}
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
              {collections.map((item) => (
                <a
                  key={item.id}
                  href={collectionPath(item.id, locale)}
                  aria-current={collection?.id === item.id ? "page" : undefined}
                >
                  {item[locale].title}
                </a>
              ))}
            </nav>
            <section
              className="project-grid"
              aria-label={ro ? "Proiecte" : "Projects"}
            >
              {items.map((item) => (
                <Card entry={item} locale={locale} key={item.id} />
              ))}
            </section>
          </>
        )}
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
      </main>
      <footer className="wrap">
        <span>© {new Date().getFullYear()} Cristian Nichifor</span>
        <a href="https://github.com/CristianNichifor">GitHub ↗</a>
        <a href={contact}>{ro ? "Contact" : "Get in touch"}</a>
      </footer>
    </>
  );
}
