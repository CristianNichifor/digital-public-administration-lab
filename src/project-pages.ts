/**
 * DPAL-12/13: the extra sections of a project page. Every line restates a fact already published in
 * the catalogue, the project's README or its description; an entry without such a fact has no
 * section rather than invented text. "How it works" is carried over from civic-tech-hub's
 * `index.html` (commit f0184cd), written there in both languages.
 */
type Bilingual<T> = { en: T; ro: T };
export interface Source {
  name: string;
  href?: string;
  licence?: string;
}
export interface ProjectPage {
  answers?: Bilingual<string[]>;
  howItWorks?: Bilingual<string>;
  sources?: Source[];
  /** The project's own methodology document, for the provenance line (DS-2). */
  methodHref?: string;
}

export const projectPages: Record<string, ProjectPage> = {
  "romania-reforms": {
    methodHref: "https://github.com/CristianNichifor/romania-reforms/tree/main/simulators",
    answers: {
      en: [
        "Which trade-offs a proposed public-policy reform makes, with its assumptions visible.",
        "How the public pay (salarizare) proposal behaves under different scenarios.",
        "What administrative consolidation implies under different scenarios.",
      ],
      ro: [
        "Ce compromisuri face o propunere de politică publică, cu ipotezele la vedere.",
        "Cum se comportă propunerea de salarizare în sectorul public în scenarii diferite.",
        "Ce implică consolidarea administrativă în scenarii diferite.",
      ],
    },
    howItWorks: {
      en: "Simulators for Romanian public-policy reforms — deterministic, explainable, browser-only. Includes the pay (salarizare) and administrative-consolidation (administrativ) simulators.",
      ro: "Simulatoare pentru reformele de politici publice din România — deterministe, explicabile, rulează integral în browser. Include simulatoarele de salarizare și de consolidare administrativă.",
    },
    sources: [
      { name: "Budget execution" },
      { name: "INS Tempo" },
      { name: "Eurostat" },
      { name: "Danmarks Statistik" },
      { name: "SIRUTA" },
    ],
  },
  "open-procurement": {
    methodHref: "https://github.com/CristianNichifor/open-procurement/blob/main/METHODOLOGY.md",
    answers: {
      en: [
        "What comparable unit prices Romanian public buyers paid.",
        "What the published procurement snapshots contain, queried in the browser.",
        "Where each record comes from, and which period it covers.",
      ],
      ro: [
        "Ce prețuri unitare comparabile au plătit autoritățile contractante din România.",
        "Ce conțin seturile de date publicate despre achiziții, interogate direct în browser.",
        "De unde provine fiecare înregistrare și ce perioadă acoperă.",
      ],
    },
    howItWorks: {
      en: "Open data on Romanian public procurement — comparable unit prices, OCDS format. 26.6M direct-acquisition records, queryable in-browser via DuckDB-Wasm.",
      ro: "Date deschise despre achizițiile publice din România — prețuri unitare comparabile, format OCDS. 26,6 milioane de achiziții directe, interogabile direct în browser prin DuckDB-Wasm.",
    },
    sources: [
      {
        name: "SEAP / e-licitatie.ro api-pub",
        href: "https://e-licitatie.ro/",
        licence: "Open Government Licence v1.0",
      },
      {
        name: "data.gov.ro quarterly procurement exports",
        href: "https://data.gov.ro/",
        licence: "Open Government Licence v1.0",
      },
    ],
  },
  "legislation-linter": {
    answers: {
      en: [
        "Which statutory deadlines in an act went unfulfilled.",
        "Where terminology drifts across a draft.",
        "Which provisions may contradict each other, with the source article for each finding.",
      ],
      ro: [
        "Ce termene legale dintr-un act nu au fost îndeplinite.",
        "Unde terminologia unui proiect nu este consecventă.",
        "Ce prevederi se pot contrazice, cu articolul sursă pentru fiecare rezultat.",
      ],
    },
    howItWorks: {
      en: "Linter for draft Romanian legislation: unfulfilled statutory deadlines, terminology drift, candidate contradictions — every finding carries its source article.",
      ro: "Verificator pentru proiectele de legislație din România: termene legale neîndeplinite, derive terminologice, contradicții candidate — fiecare rezultat indică articolul sursă.",
    },
  },
  "bureaucracy-as-code": {
    answers: {
      en: [
        "How a Law 544/2001 public-information request moves from start to finish.",
        "How each step can be signed, tracked and made tamper-evident in the browser.",
      ],
      ro: [
        "Cum parcurge o cerere de informații publice (Legea 544/2001) drumul de la început la sfârșit.",
        "Cum poate fi fiecare pas semnat, urmărit și protejat împotriva modificărilor, în browser.",
      ],
    },
  },
  "digital-romania-atlas": {
    methodHref: "https://github.com/CristianNichifor/digital-romania-atlas/blob/main/docs/METHODOLOGY.md",
    answers: {
      en: [
        "How Romania's digital-identity ecosystem (EUDI Wallet) is organised: institutions, data flows and timeline.",
        "How it compares with a proposed digital-backbone design.",
      ],
      ro: [
        "Cum este organizat ecosistemul de identitate digitală al României (EUDI Wallet): instituții, fluxuri de date și cronologie.",
        "Cum se compară cu un design propus de „backbone digital”.",
      ],
    },
    howItWorks: {
      en: "Maps Romania's digital-identity ecosystem against a proposed EUDI Wallet \"digital backbone\" — institutions, data flows, feature comparison, timeline.",
      ro: "Cartografiază ecosistemul de identitate digitală al României comparativ cu un „backbone digital” propus pe baza EUDI Wallet — instituții, fluxuri de date, comparație de funcționalități, cronologie.",
    },
    sources: [
      {
        name: "Ministerul-Afacerilor-Interne/rowallet-documentation",
        href: "https://github.com/Ministerul-Afacerilor-Interne/rowallet-documentation",
        licence: "CC BY 4.0",
      },
      {
        name: "MAI presentation „Portofelul European de Identitate Digitală — Rolul MAI în ecosistemul național” (July 2026)",
      },
    ],
  },
  "romania-intelligence-reform-dataflows": {
    answers: {
      en: [
        "How information flows today between intelligence, oversight, judicial and civilian institutions.",
        "How those flows would look in the proposed target state.",
      ],
      ro: [
        "Cum circulă astăzi informațiile între instituțiile de informații, control, justiție și cele civile.",
        "Cum ar arăta aceste fluxuri în starea-țintă propusă.",
      ],
    },
    howItWorks: {
      en: "Interactive demo of current vs. target-state information flows between Romania's intelligence, oversight, judicial and civilian institutions.",
      ro: "Demonstrație interactivă a fluxurilor de informații actuale față de starea-țintă propusă, între instituțiile de informații, control, justiție și cele civile din România.",
    },
  },
  "romania-budget-dashboard": {
    answers: {
      en: [
        "How Romania's consolidated budget is spent.",
        "How spending looks with its source and year in view.",
      ],
      ro: [
        "Cum este cheltuit bugetul consolidat al României.",
        "Cum arată cheltuielile, cu sursa și anul la vedere.",
      ],
    },
    sources: [{ name: "transparenta.eu" }],
  },
  "civic-ui": {
    howItWorks: {
      en: "MIT-licensed React component library with opt-in themes, shared across these civic projects.",
      ro: "Bibliotecă de componente React licențiată MIT, cu teme opționale, folosită în comun de aceste proiecte civice.",
    },
  },
  "usr-digital-platform-wireframe": {
    howItWorks: {
      en: "Unofficial prototype for a rebuilt public site and member area — not an approved or connected service.",
      ro: "Prototip neoficial pentru un site public și o zonă de membri regândite — nu este un serviciu aprobat sau conectat.",
    },
  },
};
