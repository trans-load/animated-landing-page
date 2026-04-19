// "What changes with transload" — past vs. now comparison section.
// Cinematic side-by-side with a center bridge arrow, scroll-reveal entrance,
// and a stronger visual delta between past (desaturated) and now (accent glow).
const { useRef: useRefCmp, useEffect: useEffectCmp, useState: useStateCmp } = React;

function Comparison({ accent = '#f97315' }) {
  const mono = '"JetBrains Mono", monospace';
  const sans = '"Inter", system-ui, -apple-system, sans-serif';
  const { t } = window.useT();

  const sectionRef = useRefCmp(null);
  const [inView, setInView] = useStateCmp(false);

  useEffectCmp(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pastRows = [
    t('comparison.past.row1'),
    t('comparison.past.row2'),
    t('comparison.past.row3'),
  ];
  const nowRows = [
    t('comparison.now.row1'),
    t('comparison.now.row2'),
    t('comparison.now.row3'),
  ];

  return (
    <section
      id="comparison"
      className="comparison-section"
      ref={sectionRef}
      style={{
        padding: '72px 40px 40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient accent glow behind the "now" column */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-10%',
          top: '30%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}14 0%, rgba(0,0,0,0) 60%)`,
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative' }}>
        {/* Eyebrow + heading */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: accent,
              marginBottom: 20,
            }}
          >
            <span style={{ width: 24, height: 1, background: accent, opacity: 0.6 }} />
            {t('comparison.eyebrow')}
            <span style={{ width: 24, height: 1, background: accent, opacity: 0.6 }} />
          </div>
          <h2
            style={{
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 'clamp(34px, 4.4vw, 60px)',
              lineHeight: 1.02,
              letterSpacing: -1.2,
              margin: 0,
              color: '#fff',
              maxWidth: 900,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {t('comparison.headline')}
          </h2>
        </div>

        {/* Cards + bridge */}
        <div
          className="cmp-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 1fr',
            alignItems: 'stretch',
            gap: 0,
            position: 'relative',
          }}
        >
          <Card
            side="past"
            label={t('comparison.past.label')}
            sublabel={t('comparison.past.sublabel')}
            img="assets/past-dimensioner.png"
            rows={pastRows}
            accent={accent}
            inView={inView}
            delay={0}
          />

          <Bridge accent={accent} inView={inView} />

          <Card
            side="now"
            label={t('comparison.now.label')}
            sublabel={t('comparison.now.sublabel')}
            img="assets/now-highlighted.png"
            rows={nowRows}
            accent={accent}
            inView={inView}
            delay={140}
          />
        </div>

        {/* Responsive tweaks */}
        <style>{`
          @media (max-width: 860px) {
            .cmp-grid { grid-template-columns: 1fr !important; }
            .cmp-bridge { height: 80px !important; width: 100% !important; }
            .cmp-bridge-line { width: 1px !important; height: 100% !important; left: 50% !important; top: 0 !important; transform: translateX(-50%) !important; }
            .cmp-bridge-arrow { transform: translate(-50%, -50%) rotate(90deg) !important; }
          }
          @media (max-width: 720px) {
            .comparison-section { padding: 56px 16px 32px !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

function Card({ side, label, sublabel, img, rows, accent, inView, delay }) {
  const mono = '"JetBrains Mono", monospace';
  const sans = '"Inter", system-ui, -apple-system, sans-serif';
  const isNow = side === 'now';

  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 700ms ease ${delay}ms, transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tag strip on top */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
          paddingLeft: 2,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: isNow ? accent : 'rgba(255,255,255,0.4)',
            padding: '6px 10px',
            borderRadius: 4,
            border: isNow ? `1px solid ${accent}66` : '1px solid rgba(255,255,255,0.12)',
            background: isNow ? `${accent}12` : 'rgba(255,255,255,0.02)',
          }}
        >
          {isNow ? '02 / NOW' : '01 / BEFORE'}
        </div>
        <div style={{ flex: 1, height: 1, background: isNow ? `${accent}33` : 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Label + sublabel */}
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 600,
            color: isNow ? '#fff' : 'rgba(255,255,255,0.92)',
            letterSpacing: -0.6,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 15,
            fontWeight: 400,
            color: isNow ? accent : 'rgba(255,255,255,0.42)',
            letterSpacing: -0.1,
          }}
        >
          {sublabel}
        </div>
      </div>

      {/* Image block */}
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          border: isNow ? `1.5px solid ${accent}` : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isNow
            ? `0 0 0 1px ${accent}18, 0 30px 80px rgba(249, 115, 21, 0.22), 0 0 60px rgba(249, 115, 21, 0.10)`
            : '0 20px 60px rgba(0,0,0,0.5)',
          aspectRatio: '4 / 3',
          background: '#0a0a0a',
        }}
      >
        <img
          src={img}
          alt={label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: isNow ? 'saturate(1.05) contrast(1.02)' : 'saturate(0.8) brightness(0.94) contrast(0.98)',
            transition: 'filter 400ms ease',
          }}
        />
        {/* Top gradient for label legibility */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: isNow
              ? `linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 40%)`
              : 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Corner micro-mark */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: isNow ? '#fff' : 'rgba(255,255,255,0.7)',
            padding: '4px 8px',
            borderRadius: 4,
            background: isNow ? `${accent}cc` : 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          {isNow && (
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%', background: '#fff',
                boxShadow: '0 0 6px #fff',
                animation: 'cmp-pulse 1.4s ease-in-out infinite',
              }}
            />
          )}
          {isNow ? 'LIVE' : 'MANUAL'}
          <style>{`@keyframes cmp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      </div>

      {/* Row list */}
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              borderRadius: 14,
              background: isNow ? `${accent}0A` : 'rgba(255,255,255,0.025)',
              border: isNow
                ? `1px solid ${accent}33`
                : '1px solid rgba(255,255,255,0.06)',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 500ms ease ${delay + 200 + i * 80}ms, transform 500ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay + 200 + i * 80}ms`,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: isNow ? `${accent}22` : 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: isNow ? accent : 'rgba(255,255,255,0.4)',
                boxShadow: isNow ? `0 0 12px ${accent}33` : 'none',
              }}
            >
              {isNow ? <CheckIcon /> : <CrossIcon />}
            </div>
            <span
              style={{
                fontFamily: sans,
                fontSize: 15.5,
                fontWeight: 450,
                color: isNow ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
                letterSpacing: -0.1,
                lineHeight: 1.4,
              }}
            >
              {row}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bridge({ accent, inView }) {
  // Center column — on desktop: horizontal arrow line. Collapses on mobile via CSS.
  return (
    <div
      className="cmp-bridge"
      style={{
        position: 'relative',
        width: 80,
        minHeight: '100%',
        alignSelf: 'stretch',
      }}
    >
      {/* Connecting line */}
      <div
        className="cmp-bridge-line"
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: 1,
          transform: 'translateY(-50%)',
          background: `linear-gradient(90deg, rgba(255,255,255,0.15) 0%, ${accent}55 50%, ${accent} 100%)`,
          opacity: inView ? 1 : 0,
          transition: 'opacity 800ms ease 200ms',
        }}
      />
      {/* Arrow head, centered */}
      <div
        className="cmp-bridge-arrow"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(10,10,10,0.9)',
          border: `1px solid ${accent}66`,
          boxShadow: `0 0 20px ${accent}44, inset 0 0 0 1px ${accent}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          opacity: inView ? 1 : 0,
          transition: 'opacity 500ms ease 500ms, transform 500ms ease 500ms',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2 L5 8.5 L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

window.Comparison = Comparison;
