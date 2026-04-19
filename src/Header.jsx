// Glassy floating header for transload
const { useState: useStateHd, useEffect: useEffectHd } = React;

function Header({ accent = '#f97315', scrolled = false }) {
  const [hovered, setHovered] = useStateHd(null);
  const [vw, setVw] = useStateHd(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffectHd(() => {
    const onR = () => setVw(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  const isCompact = vw < 1100;
  const isMobile = vw < 720;
  const navItems = [
    { label: 'Installation', href: '#install' },
    { label: 'Comparison', href: '#comparison' },
    { label: 'Demo', href: '#book-demo' },
    { label: 'Phone', href: 'tel:+4916095343013' },
    { label: 'Contact', href: 'mailto:hello@transload.ai' },
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

        {/* Nav */}
        {!isMobile && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map((item) => {
            const isCTA = item.label === 'Contact';
            if (isCTA) {
              return (
                <a
                  key={item.label}
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
                key={item.label}
                href={item.href}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  textDecoration: 'none',
                  appearance: 'none',
                  background:
                    hovered === item.label ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.92)',
                  fontFamily:
                    '"Inter", system-ui, -apple-system, sans-serif',
                  fontSize: 13.5,
                  fontWeight: 500,
                  letterSpacing: 0.1,
                  padding: isCompact ? '8px 8px' : '8px 12px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 120ms ease',
                }}
              >
                {item.label}
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
