// Glassy floating header for transload
const { useState: useStateHd, useEffect: useEffectHd } = React;

function Header({ accent = '#f97315', scrolled = false }) {
  const [hovered, setHovered] = useStateHd(null);
  const [vw, setVw] = useStateHd(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const { lang, t, setLang } = window.useT();
  useEffectHd(() => {
    const onR = () => setVw(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  const isCompact = vw < 1100;
  const isMobile = vw < 720;
  const navItems = [
    { key: 'installation', label: t('nav.installation'), href: '#install' },
    { key: 'comparison',   label: t('nav.comparison'),   href: '#comparison' },
    { key: 'demo',         label: t('nav.demo'),         href: '#book-demo' },
    { key: 'phone',        label: t('nav.phone'),        href: 'tel:+4916095343013', icon: 'phone' },
    { key: 'contact',      label: t('nav.contact'),      href: '#book-demo' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Centered YC backing pill — stacked below the nav */}
      {false && !isMobile && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 68,
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px 5px 9px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 12.5,
            letterSpacing: -0.1,
            zIndex: 1,
          }}
        >
          <span style={{ color: '#6b6b6b', fontWeight: 400 }}>Backed by</span>
          <img
            src="assets/partners/yc.png"
            alt="Y Combinator"
            style={{ height: 15, width: 15, display: 'block', borderRadius: 2 }}
          />
          <span style={{ color: '#6b6b6b', fontWeight: 500 }}>Combinator</span>
        </div>
      )}
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 8px 8px 20px',
          borderRadius: 999,
          background: scrolled
            ? 'rgba(28, 28, 30, 0.55)'
            : 'rgba(40, 40, 44, 0.42)',
          backdropFilter: 'blur(22px) saturate(160%)',
          WebkitBackdropFilter: 'blur(22px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.08) inset, 0 10px 40px rgba(0,0,0,0.25)',
          transition: 'background 200ms ease',
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            paddingRight: 14,
            marginRight: 4,
          }}
        >
          <img
            src="assets/logo-default.png?v=2"
            alt="transload"
            style={{ height: 22, display: 'block' }}
          />
        </a>

        {/* Language toggle — always visible, incl. mobile */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: 2,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            marginRight: isMobile ? 0 : 4,
          }}
        >
          {['en', 'de'].map((code) => {
            const active = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={active}
                aria-label={code === 'en' ? 'English' : 'Deutsch'}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: '6px 10px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'background 120ms ease, color 120ms ease',
                }}
              >
                {code.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Nav */}
        {!isMobile && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map((item) => {
            const isCTA = item.key === 'contact';
            if (isCTA) {
              return (
                <a
                  key={item.key}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    background: accent,
                    color: '#0a0a0a',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 1.2,
                    padding: '11px 18px',
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    marginLeft: 8,
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'box-shadow 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 24px ${accent}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 0 ${accent}00`;
                  }}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <a
                key={item.key}
                href={item.href}
                aria-label={item.icon ? item.label : undefined}
                onMouseEnter={() => setHovered(item.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  textDecoration: 'none',
                  appearance: 'none',
                  background:
                    hovered === item.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.92)',
                  fontFamily:
                    '"Inter", system-ui, -apple-system, sans-serif',
                  fontSize: 13.5,
                  fontWeight: 500,
                  letterSpacing: 0.1,
                  padding: item.icon ? '8px 10px' : (isCompact ? '8px 8px' : '8px 12px'),
                  borderRadius: 999,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 120ms ease',
                }}
              >
                {item.icon === 'phone' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.24 1.01l-2.21 2.2z"
                      fill="currentColor"
                    />
                  </svg>
                ) : item.label}
              </a>
            );
          })}
        </nav>
        )}
      </div>
    </header>
  );
}

window.Header = Header;
