// Footer for transload — dark themed, used on both the landing page and legal sub-pages.
function Footer({ accent = '#f97315' }) {
  const { lang } = window.useT();

  const linkBase = {
    color: 'rgba(255,255,255,0.62)',
    textDecoration: 'none',
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 14,
    padding: '8px 10px',
    borderRadius: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
  };

  return (
    <footer
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 24px 48px',
        marginTop: 0,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <p
          style={{
            margin: 0,
            color: 'rgba(255,255,255,0.45)',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 13,
            letterSpacing: 0.1,
          }}
        >
          &copy; 2026 transload. {lang === 'de' ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <a
            href="mailto:contact@transload.io"
            style={linkBase}
            aria-label="Email contact@transload.io"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6.75A2.75 2.75 0 015.75 4h12.5A2.75 2.75 0 0121 6.75v10.5A2.75 2.75 0 0118.25 20H5.75A2.75 2.75 0 013 17.25V6.75z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ display: 'inline' }}>contact@transload.io</span>
          </a>

          <a
            href="https://www.linkedin.com/company/trans-load/"
            target="_blank"
            rel="noopener noreferrer"
            style={linkBase}
            aria-label="LinkedIn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 7v7.46h-4.56v-6.62c0-1.58-.03-3.62-2.21-3.62-2.21 0-2.55 1.73-2.55 3.51V22H7.72V8z"/>
            </svg>
          </a>

          <a href="/imprint/" style={linkBase}>
            {lang === 'de' ? 'Impressum' : 'Legal Notice'}
          </a>

          <a href="/privacy-policy/" style={linkBase}>
            {lang === 'de' ? 'Datenschutz' : 'Privacy Policy'}
          </a>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
