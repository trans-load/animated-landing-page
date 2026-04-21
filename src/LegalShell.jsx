// LegalShell — wraps a legal page (Imprint, Privacy Policy, Data Act) with
// the site Header, Footer and shared dark-theme container.
function LegalShell({ children }) {
  const { lang } = window.useT();
  return (
    <div className="legal-page">
      <Header accent="#f97315" scrolled={true} />
      <div className="legal-container">
        <a href="/" className="legal-back" aria-label={lang === 'de' ? 'Zur Startseite' : 'Back to home'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {lang === 'de' ? 'Zur\u00fcck zur Startseite' : 'Back to home'}
        </a>
        <div className="legal-block">{children}</div>
      </div>
      <Footer accent="#f97315" />
    </div>
  );
}

window.LegalShell = LegalShell;
