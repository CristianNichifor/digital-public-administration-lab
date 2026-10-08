import type { Locale } from "./catalogue";

/**
 * The budget dashboard's pages and public API, folded in from the retired
 * `tablou` repository. Paths follow the dashboard's route table: English at
 * the root, Romanian under `/ro/` with translated segments.
 */
export const budgetOrigin = "https://budget.cristian-nichifor.com";

interface Text {
  title: string;
  body: string;
}

export interface BudgetLink {
  path: Record<Locale, string>;
  en: Text;
  ro: Text;
  sources: string;
}

export const budgetPages: BudgetLink[] = [
  {
    path: { en: "/", ro: "/ro/" },
    en: {
      title: "Romania's budget",
      body: "Revenue, spending and deficit by year (2020 to date); the flow of public money, destinations, state-owned companies and economic indicators.",
    },
    ro: {
      title: "Bugetul României",
      body: "Venituri, cheltuieli și deficit pe ani (2020–prezent); fluxul banilor publici, destinații, companii de stat și indicatori economici.",
    },
    sources: "transparenta.eu · companiidestat.ro · Eurostat · ECB · BNR",
  },
  {
    path: { en: "/state-owned-companies/", ro: "/ro/companii-de-stat/" },
    en: {
      title: "State-owned companies",
      body: "1,500+ state-owned companies: revenue, profit, employees, sectors, county distribution, subsidies and companies listed on the BVB.",
    },
    ro: {
      title: "Companii de stat",
      body: "1.500+ companii de stat: venituri, profit, salariați, sectoare, distribuție pe județe, subvenții și companii listate la BVB.",
    },
    sources: "companiidestat.ro (CC BY 4.0)",
  },
  {
    path: { en: "/national-balance/", ro: "/ro/bilantul-national/" },
    en: {
      title: "National balance",
      body: "Adopted budget against execution (MFP, data.gov.ro), the flow of public money, destinations, investment by county and INS context.",
    },
    ro: {
      title: "Bilanțul național",
      body: "Buget adoptat vs. execuție (MFP, data.gov.ro), fluxul banilor publici, destinații, investiții pe județe și context INS.",
    },
    sources: "MFP via data.gov.ro · transparenta.eu · INS",
  },
  {
    path: { en: "/economy/", ro: "/ro/economie/" },
    en: {
      title: "Romania's economy",
      body: "Inflation, unemployment, the EUR/RON rate, growth, GDP per capita against the EU, debt, quarterly deficit, current account and the ECB rate.",
    },
    ro: {
      title: "Economia României",
      body: "Inflație, șomaj, curs EUR/RON, creștere economică, PIB pe locuitor față de UE, datorie, deficit trimestrial, cont curent și dobânda BCE.",
    },
    sources: "Eurostat · ECB · BNR",
  },
  {
    path: { en: "/society/", ro: "/ro/societate/" },
    en: {
      title: "Society in numbers",
      body: "Population, public spending on health and education (% of GDP), education, the health system and demography.",
    },
    ro: {
      title: "Societatea în cifre",
      body: "Populația, cheltuielile publice cu sănătatea și educația (% PIB), educația, sistemul medical și demografia.",
    },
    sources: "Eurostat",
  },
  {
    path: { en: "/energy/", ro: "/ro/energie/" },
    en: {
      title: "Energy in data",
      body: "Household electricity prices, the share of renewable energy and import dependency.",
    },
    ro: {
      title: "Energia în date",
      body: "Prețul energiei electrice pentru gospodării, ponderea energiei regenerabile și dependența de importuri.",
    },
    sources: "Eurostat",
  },
  {
    path: { en: "/labor-market/", ro: "/ro/piata-muncii/" },
    en: {
      title: "Labour market",
      body: "Young people not in employment, education or training (NEET), youth unemployment and the job vacancy rate.",
    },
    ro: {
      title: "Piața muncii",
      body: "Tinerii NEET, șomajul în rândul tinerilor și rata locurilor de muncă vacante.",
    },
    sources: "Eurostat",
  },
  {
    path: { en: "/justice/", ro: "/ro/justitie/" },
    en: {
      title: "Justice in numbers",
      body: "Intentional homicides, the prison population and police headcount.",
    },
    ro: {
      title: "Justiția în cifre",
      body: "Omuciderile intenționate, populația carcerală și efectivul de polițiști.",
    },
    sources: "Eurostat",
  },
  {
    path: { en: "/your-share/", ro: "/ro/felia-ta/" },
    en: {
      title: "Your share",
      body: "How much of the cost of your work goes to the state and how much you keep: a salary simulation, real wages and wage context (LCI, SES, estimated average wage).",
    },
    ro: {
      title: "Feliuța ta",
      body: "Câți bani din costul muncii tale ajung la stat și câți îți rămân — simulare de salariu, salariul real și contextul salarial (LCI, SES, salariul mediu estimat).",
    },
    sources: "Eurostat · budget",
  },
];

/** Same origin as the dashboard; language-neutral, so never prefixed. */
export const budgetApi = {
  href: `${budgetOrigin}/api/budget/comparison`,
  en: {
    title: "Public API",
    body: "Free JSON API: adopted budget against execution, destinations, institutions, state-owned companies, macro, wages, society, energy and the labour market.",
  },
  ro: {
    title: "API public",
    body: "JSON API gratuit: buget adoptat vs. execuție, destinații, instituții, companii de stat, macro, salarii, societate, energie și piața muncii.",
  },
  endpoints:
    "/api/budget · /api/soe · /api/macro · /api/wages · /api/society · /api/energy · /api/labour · /api/justice",
};

export function budgetHref(link: BudgetLink, locale: Locale) {
  return `${budgetOrigin}${link.path[locale]}`;
}
