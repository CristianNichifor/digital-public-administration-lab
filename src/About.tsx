import { aboutSections } from "./about-sections";
import { aboutMeta, privacyPath, type Locale } from "./catalogue";

/**
 * UX-9: the About & method page. Every statement below is taken from a document that
 * already exists in the projects' repositories; the links point at those documents.
 * Draft: needs owner review (see docs/specs/production-readiness.md).
 */
const gh = "https://github.com/CristianNichifor";
const hubIssues = `${gh}/digital-public-administration-lab/issues`;
const procurementMethod = `${gh}/open-procurement/blob/main/METHODOLOGY.md`;
const procurementCorrections = `${gh}/open-procurement/blob/main/CORRECTIONS.md`;
const atlasMethod = `${gh}/digital-romania-atlas/blob/main/docs/METHODOLOGY.md`;
const atlasErrata = `${gh}/digital-romania-atlas/blob/main/ERRATA.md`;
const reformsMethods = `${gh}/romania-reforms/tree/main/simulators`;
const bureaucracyPrivacy = `${gh}/bureaucracy-as-code/blob/main/docs/privacy-model.md`;
const licence = `${gh}/digital-public-administration-lab/blob/main/LICENSE`;

function Toc({ locale }: { locale: Locale }) {
  return (
    <nav aria-label={locale === "ro" ? "Pe această pagină" : "On this page"}>
      <ul className="toc">
        {aboutSections.map((section) => (
          <li key={section.id[locale]}>
            <a href={`#${section.id[locale]}`}>{section[locale]}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function About({ locale }: { locale: Locale }) {
  return locale === "ro" ? <Romanian /> : <English />;
}

function English() {
  return (
    <section className="hero detail legal about">
      <p className="eyebrow">Last updated October 2026</p>
      <h1>{aboutMeta.en.title}</h1>
      <p className="lead">
        Independent, open-source tools that explain Romanian public data, with
        their sources shown. This page says who makes them, how the numbers are
        produced, how to get an error corrected and what a visit involves.
      </p>
      <Toc locale="en" />
      <h2 id="independence">Independence</h2>
      <p>
        The projects are built by Cristian Nichifor and are not affiliated with
        the Romanian state or any public institution. Every project is published
        under the <a href={licence}>MIT licence</a> with its source code on
        GitHub, so anyone can read how a figure was produced and run the code
        themselves.
      </p>
      <h2 id="sources">Sources shown</h2>
      <p>
        Each project page on this site lists the sources it uses and their
        licence, and shows the month its data is as of. The projects follow a few
        shared rules, written down in their own methodology documents:
      </p>
      <ul>
        <li>
          <strong>Observation, not accusation.</strong> The{" "}
          <a href={procurementMethod}>Open Procurement methodology</a> reports
          prices and statistical position; it does not allege wrongdoing, and
          every aggregate is published with its sample size. Every row keeps its
          record identifier, source file and processing version, so a figure is
          one click from the original record.
        </li>
        <li>
          <strong>Facts and proposals kept apart.</strong> The{" "}
          <a href={atlasMethod}>Digital Romania Atlas methodology</a> separates
          claims about the current architecture, each traced to a public source
          pinned to a specific version, from the author&apos;s own design
          proposals, which carry no factual weight. Cost figures are ranges with
          named precedents, not budgets.
        </li>
        <li>
          <strong>Deterministic simulators.</strong> The reform simulators run
          entirely in the browser from documented source files, and{" "}
          <a href={reformsMethods}>each one has a methodology</a> that records
          what is counted, what is excluded and why. Their results explore
          scenarios; they do not establish legal entitlements.
        </li>
      </ul>
      <h2 id="corrections">Corrections</h2>
      <p>
        Two projects publish a formal corrections policy today, and the others
        take reports through their GitHub issues.
      </p>
      <ul>
        <li>
          <a href={procurementCorrections}>Open Procurement</a>: anyone may
          request a correction, and authorities or suppliers named in the data
          have a right of reply. A report is acknowledged, checked against the
          official source and resolved in one of three ways: an error in the
          pipeline is fixed at its root and logged, an error in the official
          source is flagged and raised with the publisher, and a disputed
          interpretation is published next to the record. Accurate public data is
          not removed. Initial response within 5 working days, resolution within
          30 days.
        </li>
        <li>
          <a href={atlasErrata}>Digital Romania Atlas</a>: anyone may file a
          correction, every accepted correction is logged with its date and what
          changed, and nothing is silently folded into the data. Factual
          corrections are made within days; disagreements with the proposals are
          design opinions and belong in a discussion.
        </li>
        <li>
          For this site itself, <a href={hubIssues}>open an issue on GitHub</a>.
        </li>
      </ul>
      <h2 id="tracking">No tracking</h2>
      <p>
        The catalogue pages set no cookies, run no analytics and store nothing in
        your browser. The projects publish no personal data: Open Procurement
        strips contact names, e-mail addresses and phone numbers before
        publication, and the Bureaucracy as Code ledger{" "}
        <a href={bureaucracyPrivacy}>holds hashes, never names or identifiers</a>.
        The <a href={privacyPath("en")}>privacy page</a> lists the one hosting
        provider that processes request data and what each project loads from
        third parties.
      </p>
    </section>
  );
}

function Romanian() {
  return (
    <section className="hero detail legal about">
      <p className="eyebrow">Actualizat în octombrie 2026</p>
      <h1>{aboutMeta.ro.title}</h1>
      <p className="lead">
        Instrumente independente și open source care explică date publice din
        România, cu sursele la vedere. Această pagină spune cine le face, cum sunt
        produse cifrele, cum se corectează o eroare și ce implică o vizită.
      </p>
      <Toc locale="ro" />
      <h2 id="independenta">Independență</h2>
      <p>
        Proiectele sunt construite de Cristian Nichifor și nu sunt afiliate
        statului român sau vreunei instituții publice. Fiecare proiect este
        publicat sub <a href={licence}>licența MIT</a>, cu codul sursă pe GitHub,
        astfel încât oricine poate citi cum a fost produsă o cifră și poate rula
        codul.
      </p>
      <h2 id="surse">Surse la vedere</h2>
      <p>
        Fiecare pagină de proiect de pe acest site enumeră sursele folosite și
        licența lor și arată luna la care sunt actualizate datele. Proiectele
        urmează câteva reguli comune, scrise în propriile documente de
        metodologie:
      </p>
      <ul>
        <li>
          <strong>Observație, nu acuzație.</strong>{" "}
          <a href={procurementMethod}>Metodologia Achizițiilor publice</a>{" "}
          raportează prețuri și poziție statistică; nu afirmă nereguli, iar
          fiecare agregat este publicat împreună cu numărul de înregistrări.
          Fiecare rând păstrează identificatorul înregistrării, fișierul-sursă și
          versiunea de procesare, deci o cifră este la un clic de înregistrarea
          originală.
        </li>
        <li>
          <strong>Fapte și propuneri ținute separat.</strong>{" "}
          <a href={atlasMethod}>Metodologia Atlasului României digitale</a>{" "}
          separă afirmațiile despre arhitectura actuală, fiecare urmărită până la
          o sursă publică fixată la o versiune anume, de propunerile de design
          ale autorului, care nu au valoare factuală. Cifrele de cost sunt
          intervale cu precedente numite, nu bugete.
        </li>
        <li>
          <strong>Simulatoare deterministe.</strong> Simulatoarele de reformă
          rulează integral în browser din fișiere-sursă documentate, iar{" "}
          <a href={reformsMethods}>fiecare are o metodologie</a> care
          consemnează ce se numără, ce se exclude și de ce. Rezultatele lor
          explorează scenarii; nu stabilesc drepturi legale.
        </li>
      </ul>
      <h2 id="corectari">Corectări</h2>
      <p>
        Două proiecte publică astăzi o politică formală de corectări, iar
        celelalte primesc sesizări prin paginile lor de issue pe GitHub.
      </p>
      <ul>
        <li>
          <a href={procurementCorrections}>Achiziții publice din România</a>:
          oricine poate cere o corectare, iar autoritățile sau furnizorii numiți
          în date au drept la replică. O sesizare este confirmată, verificată
          față de sursa oficială și soluționată într-unul din trei moduri: o
          eroare de procesare este corectată la origine și consemnată, o eroare
          din sursa oficială este marcată și semnalată publicatorului, iar o
          interpretare contestată este publicată alături de înregistrare. Datele
          publice corecte nu se șterg. Răspuns inițial în 5 zile lucrătoare,
          soluționare în 30 de zile.
        </li>
        <li>
          <a href={atlasErrata}>Atlasul României digitale</a>: oricine poate
          semnala o corectare, fiecare corectare acceptată este consemnată cu
          data și cu ce s-a schimbat, iar nimic nu este modificat în tăcere.
          Corectările factuale se fac în câteva zile; dezacordurile cu
          propunerile sunt opinii de design și au loc într-o discuție.
        </li>
        <li>
          Pentru acest site, <a href={hubIssues}>deschide un issue pe GitHub</a>.
        </li>
      </ul>
      <h2 id="urmarire">Fără urmărire</h2>
      <p>
        Paginile catalogului nu setează cookie-uri, nu folosesc instrumente de
        analiză a traficului și nu salvează nimic în browserul tău. Proiectele nu
        publică date cu caracter personal: Achiziții publice elimină numele
        persoanelor de contact, adresele de e-mail și telefoanele înainte de
        publicare, iar registrul din Birocrație ca program{" "}
        <a href={bureaucracyPrivacy}>conține hash-uri, niciodată nume sau identificatori</a>.
        <a href={privacyPath("ro")}>Pagina de confidențialitate</a> enumeră
        singurul furnizor de găzduire care prelucrează datele cererilor și ce
        încarcă fiecare proiect de la terți.
      </p>
    </section>
  );
}
