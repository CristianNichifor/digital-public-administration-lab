import { privacyMeta, type Locale } from "./catalogue";

const repository =
  "https://github.com/CristianNichifor/digital-public-administration-lab";
const issues = `${repository}/issues`;
const cloudflarePrivacy = "https://www.cloudflare.com/privacypolicy/";

export function Privacy({ locale }: { locale: Locale }) {
  return locale === "ro" ? <Romanian /> : <English />;
}

function English() {
  return (
    <section className="hero detail legal">
      <p className="eyebrow">Last updated October 2026</p>
      <h1>{privacyMeta.en.title}</h1>
      <p className="lead">
        No cookies, no analytics. This page explains what a visit to
        projects.cristian-nichifor.com involves.
      </p>
      <h2>Who runs this site</h2>
      <p>
        Operator: Cristian Nichifor. For questions or requests about this site
        or your data, <a href={issues}>open an issue on GitHub</a>. The{" "}
        <a href={repository}>source code</a> of this site is public.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        The catalogue pages set no cookies, run no analytics or advertising
        trackers and store nothing in your browser. Their fonts and scripts are
        served from this domain. When this site serves a project, it does not
        pass your cookies or credentials on to that project&apos;s build, and it
        removes any cookie the build tries to set.
      </p>
      <h2>Hosting and the services that process your data</h2>
      <p>
        One provider processes data for this site: Cloudflare, Inc. (
        <a href={cloudflarePrivacy}>Cloudflare privacy policy</a>).
      </p>
      <ul>
        <li>
          <strong>Hosting.</strong> Cloudflare Pages serves every page. Like any
          web host, Cloudflare processes the technical data of each request,
          such as your IP address, browser user agent and the address requested,
          to deliver it and protect the service.
        </li>
        <li>
          <strong>Network Error Logging.</strong> Responses ask your browser to
          report failed connections to Cloudflare (a.nel.cloudflare.com) so that
          delivery problems can be detected. Successful visits are not reported.
        </li>
        <li>
          <strong>Email address obfuscation.</strong> Cloudflare hides email
          addresses on these pages from scrapers and loads a small script from
          this domain (email-decode.min.js) to display them.
        </li>
      </ul>
      <h2>Projects served at this address</h2>
      <p>
        Projects such as /open-procurement/ or /legislation-linter/ are separate
        applications. Some keep their working state in your browser&apos;s local
        storage, where it stays on your device. Some load libraries, models or
        fonts from third parties such as cdn.jsdelivr.net, Google Fonts or
        Hugging Face; your browser then contacts those services directly. Each
        project&apos;s source code shows what it uses.
      </p>
      <h2>Links to other sites</h2>
      <p>
        Links to GitHub, cristian-nichifor.com, budget.cristian-nichifor.com and
        other sites take you off this site; their own privacy terms apply there.
      </p>
    </section>
  );
}

function Romanian() {
  return (
    <section className="hero detail legal">
      <p className="eyebrow">Actualizat în octombrie 2026</p>
      <h1>{privacyMeta.ro.title}</h1>
      <p className="lead">
        Fără cookie-uri, fără analiză de trafic. Această pagină explică ce
        implică o vizită pe projects.cristian-nichifor.com.
      </p>
      <h2>Cine administrează acest site</h2>
      <p>
        Operator: Cristian Nichifor. Pentru întrebări sau solicitări despre acest
        site ori despre datele tale, <a href={issues}>deschide un issue pe GitHub</a>.{" "}
        <a href={repository}>Codul sursă</a> al site-ului este public.
      </p>
      <h2>Cookie-uri și analiză de trafic</h2>
      <p>
        Paginile catalogului nu setează cookie-uri, nu folosesc instrumente de
        analiză sau de publicitate și nu salvează nimic în browserul tău.
        Fonturile și scripturile lor sunt servite de pe acest domeniu. Când
        acest site servește un proiect, nu transmite cookie-urile sau
        credențialele tale către acel proiect și elimină orice cookie pe care
        proiectul încearcă să îl seteze.
      </p>
      <h2>Găzduirea și serviciile care îți prelucrează datele</h2>
      <p>
        Un singur furnizor prelucrează date pentru acest site: Cloudflare, Inc. (
        <a href={cloudflarePrivacy}>politica de confidențialitate Cloudflare</a>).
      </p>
      <ul>
        <li>
          <strong>Găzduire.</strong> Cloudflare Pages servește fiecare pagină. Ca
          orice furnizor de găzduire, Cloudflare prelucrează datele tehnice ale
          fiecărei cereri, cum ar fi adresa IP, agentul browserului și adresa
          solicitată, pentru a o livra și a proteja serviciul.
        </li>
        <li>
          <strong>Network Error Logging.</strong> Răspunsurile îi cer browserului
          tău să raporteze conexiunile eșuate către Cloudflare
          (a.nel.cloudflare.com), pentru a detecta problemele de livrare.
          Vizitele reușite nu sunt raportate.
        </li>
        <li>
          <strong>Ascunderea adreselor de email.</strong> Cloudflare ascunde
          adresele de email din aceste pagini de roboții care le colectează și
          încarcă un mic script de pe acest domeniu (email-decode.min.js) pentru
          a le afișa.
        </li>
      </ul>
      <h2>Proiectele servite la această adresă</h2>
      <p>
        Proiecte precum /open-procurement/ sau /legislation-linter/ sunt
        aplicații separate. Unele își păstrează starea de lucru în spațiul de
        stocare local al browserului, unde rămâne pe dispozitivul tău. Unele
        încarcă biblioteci, modele sau fonturi de la terți precum
        cdn.jsdelivr.net, Google Fonts sau Hugging Face; în acest caz browserul
        tău contactează direct acele servicii. Codul sursă al fiecărui proiect
        arată ce folosește.
      </p>
      <h2>Linkuri către alte site-uri</h2>
      <p>
        Linkurile către GitHub, cristian-nichifor.com,
        budget.cristian-nichifor.com și alte site-uri te duc în afara acestui
        site; acolo se aplică propriile lor condiții de confidențialitate.
      </p>
    </section>
  );
}
