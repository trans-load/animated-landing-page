// Imprint / Legal Notice page. Bilingual EN/DE via useT().
function Imprint() {
  const { lang } = window.useT();
  const en = lang !== 'de';

  return (
    <LegalShell>
      <h1>{en ? 'Legal Notice' : 'Impressum'}</h1>
      <p className="legal-meta">
        {en ? 'Information pursuant to \u00a7 5 TMG' : 'Angaben gem\u00e4\u00df \u00a7 5 TMG'}
      </p>

      <h2>{en ? 'Address' : 'Adresse'}</h2>
      <p>
        transload GmbH<br />
        Hohenzollernstr. 105<br />
        80796 M&uuml;nchen<br />
        {en ? 'Germany' : 'Deutschland'}
      </p>

      <h2>{en ? 'Contact' : 'Kontakt'}</h2>
      <p>
        {en ? 'Phone' : 'Telefon'}: +49 152 5854 9146<br />
        E-Mail: <a href="mailto:contact@transload.io">contact@transload.io</a>
      </p>

      <h2>{en ? 'Editorial Responsibility' : 'Redaktionell verantwortlich'}</h2>
      <p>
        Jago Wahl-Schwentker, Nils B&ouml;rner {en ? 'and' : 'und'} Julius Scheel
      </p>
    </LegalShell>
  );
}

window.Imprint = Imprint;
ReactDOM.createRoot(document.getElementById('root')).render(<Imprint />);
