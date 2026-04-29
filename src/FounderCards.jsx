// Founder contact cards, adapted from transload's team section for the dark landing page.
function FounderCards({ accent = '#f97315' }) {
  const { t } = window.useT();
  const founders = [
    {
      name: 'Nils Börner',
      role: t('founders.role'),
      image: 'assets/founders/nils.jpeg',
      linkedin: 'https://www.linkedin.com/in/boenils/',
      email: 'mailto:nils@transload.io',
    },
    {
      name: 'Jago Wahl-Schwentker',
      role: t('founders.role'),
      image: 'assets/founders/jago.jpeg',
      linkedin: 'https://www.linkedin.com/in/jagowahl/',
      email: 'mailto:jago@transload.io',
    },
    {
      name: 'Julius Scheel',
      role: t('founders.role'),
      image: 'assets/founders/julius.png',
      linkedin: 'https://www.linkedin.com/in/juliusscheel/',
      email: 'mailto:julius@transload.io',
    },
  ];

  return (
    <section
      id="founders"
      className="founders-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '96px 40px 112px',
        background:
          'radial-gradient(circle at 50% 0%, rgba(249,115,21,0.12), rgba(10,10,10,0) 34%), #0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(640px, 58vw)',
          height: 1,
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))',
        }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 999,
              background: 'rgba(249,115,21,0.10)',
              border: '1px solid rgba(249,115,21,0.28)',
              color: accent,
              marginBottom: 18,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" stroke="currentColor" strokeWidth="1.7" />
              <path d="M4.5 20a7.5 7.5 0 0115 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M19 8.5a2.5 2.5 0 010 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M21 19a4.9 4.9 0 00-2.2-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(34px, 4vw, 58px)',
              lineHeight: 1.08,
              letterSpacing: -1.1,
              margin: 0,
              color: '#fff',
            }}
          >
            {t('founders.title')}
          </h2>
        </div>

        <div
          className="founders-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 24,
          }}
        >
          {founders.map((founder) => (
            <article
              key={founder.email}
              className="founder-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                borderRadius: 24,
                padding: '30px 24px 24px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))',
                border: '1px solid rgba(255,255,255,0.11)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                transition: 'transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at 50% 0%, ${accent}1f, rgba(255,255,255,0) 42%)`,
                  pointerEvents: 'none',
                }}
              />
              <img
                src={founder.image}
                alt={founder.name}
                style={{
                  position: 'relative',
                  width: 152,
                  height: 152,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  margin: '0 auto 22px',
                  border: '4px solid rgba(255,255,255,0.08)',
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 18px 50px rgba(0,0,0,0.45), 0 0 42px ${accent}20`,
                }}
              />
              <h3
                style={{
                  position: 'relative',
                  margin: '0 0 9px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 22,
                  lineHeight: 1.15,
                  letterSpacing: -0.25,
                  color: '#fff',
                }}
              >
                {founder.name}
              </h3>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  padding: '5px 11px',
                  marginBottom: 22,
                  background: 'rgba(249,115,21,0.10)',
                  border: '1px solid rgba(249,115,21,0.24)',
                  color: accent,
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {founder.role}
              </div>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <a className="founder-link" href={founder.linkedin} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 7v7.46h-4.56v-6.62c0-1.58-.03-3.62-2.21-3.62-2.21 0-2.55 1.73-2.55 3.51V22H7.72V8z" />
                  </svg>
                  LinkedIn
                  <span aria-hidden>→</span>
                </a>
                <a className="founder-link founder-link--email" href={founder.email}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 6.75A2.75 2.75 0 015.75 4h12.5A2.75 2.75 0 0121 6.75v10.5A2.75 2.75 0 0118.25 20H5.75A2.75 2.75 0 013 17.25V6.75z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t('founders.email')}
                  <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .founder-card:hover {
          transform: translateY(-5px);
          border-color: rgba(249,115,21,0.30) !important;
          box-shadow: 0 26px 78px rgba(0,0,0,0.46) !important;
        }
        .founder-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border-radius: 11px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          font-family: "Inter", system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
        }
        .founder-link span {
          opacity: 0;
          transform: translateX(-3px);
          transition: opacity 160ms ease, transform 160ms ease;
        }
        .founder-link:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(249,115,21,0.35);
          color: #fff;
          transform: translateY(-1px);
        }
        .founder-link:hover span {
          opacity: 1;
          transform: translateX(0);
        }
        .founder-link--email svg {
          color: ${accent};
        }
        @media (max-width: 920px) {
          .founders-grid { grid-template-columns: 1fr !important; max-width: 430px; margin: 0 auto; }
        }
        @media (max-width: 720px) {
          .founders-section { padding: 56px 16px 64px !important; }
          .founder-card { padding: 24px 18px 20px !important; }
          .founder-card img { width: 128px !important; height: 128px !important; }
        }
      `}</style>
    </section>
  );
}

window.FounderCards = FounderCards;
