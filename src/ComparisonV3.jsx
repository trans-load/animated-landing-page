// Comparison V3 — interactive toggle/stage variant.
// Single cinematic stage, tabs swap past <-> now with a smooth crossfade.
// Auto-advances every 6s (pauses on hover). Opt-in via ?comparison=v3.
const { useRef: useRefCv3, useEffect: useEffectCv3, useState: useStateCv3 } = React;

function ComparisonV3({ accent = '#f97315' }) {
  const mono = '"JetBrains Mono", monospace';
  const sans = '"Inter", system-ui, -apple-system, sans-serif';
  const { t } = window.useT();

  const sectionRef = useRefCv3(null);
  const [inView, setInView] = useStateCv3(false);
  const [side, setSide] = useStateCv3('past'); // 'past' | 'now'
  const [paused, setPaused] = useStateCv3(false);

  useEffectCv3(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffectCv3(() => {
    if (!inView || paused) return;
    const id = setTimeout(() => setSide((s) => (s === 'past' ? 'now' : 'past')), 6000);
    return () => clearTimeout(id);
  }, [inView, paused, side]);

  const SIDES = {
    past: {
      label: t('comparison.past.label'),
      sublabel: t('comparison.past.sublabel'),
      img: 'assets/past-dimensioner.png',
      rows: [t('comparison.past.row1'), t('comparison.past.row2'), t('comparison.past.row3')],
      tag: '01 / BEFORE',
      corner: 'MANUAL',
    },
    now: {
      label: t('comparison.now.label'),
      sublabel: t('comparison.now.sublabel'),
      img: 'assets/now-highlighted.png',
      rows: [t('comparison.now.row1'), t('comparison.now.row2'), t('comparison.now.row3')],
      tag: '02 / NOW',
      corner: 'LIVE',
    },
  };
  const s = SIDES[side];
  const isNow = side === 'now';

  return (
    <section
      id="comparison"
      ref={sectionRef}
      style={{
        padding: '140px 40px 160px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient accent glow, intensifies on "now" */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '35%',
          width: 900,
          height: 900,
          transform: 'translate(-50%, -30%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}${isNow ? '1A' : '08'} 0%, rgba(0,0,0,0) 60%)`,
          pointerEvents: 'none',
          filter: 'blur(30px)',
          transition: 'background 600ms ease',
        }}
      />

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative' }}>
        {/* Eyebrow + heading */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
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

        {/* Tabs */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          {['past', 'now'].map((k) => {
            const active = side === k;
            const isNowTab = k === 'now';
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => setSide(k)}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  padding: '10px 18px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  background: active ? (isNowTab ? `${accent}22` : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.02)',
                  border: active
                    ? (isNowTab ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.22)')
                    : '1px solid rgba(255,255,255,0.08)',
                  color: active ? (isNowTab ? accent : '#fff') : 'rgba(255,255,255,0.5)',
                  fontWeight: 700,
                  transition: 'all 200ms ease',
                }}
              >
                {SIDES[k].tag} — {SIDES[k].label}
              </button>
            );
          })}
        </div>

        {/* Progress bar showing auto-advance */}
        <div
          style={{
            position: 'relative',
            height: 2,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 2,
            marginBottom: 32,
            overflow: 'hidden',
            maxWidth: 600,
            margin: '0 auto 32px',
          }}
        >
          <div
            key={side + String(paused)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: '100%',
              background: accent,
              transformOrigin: 'left',
              animation: paused ? 'none' : `cmpv3-progress 6000ms linear forwards`,
            }}
          />
          <style>{`
            @keyframes cmpv3-progress {
              from { transform: scaleX(0); }
              to   { transform: scaleX(1); }
            }
          `}</style>
        </div>

        {/* Stage */}
        <div
          className="cmpv3-stage"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 32,
            alignItems: 'stretch',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 700ms ease, transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1)',
          }}
        >
          {/* Image area */}
          <div
            style={{
              position: 'relative',
              borderRadius: 22,
              overflow: 'hidden',
              aspectRatio: '4 / 3',
              border: isNow ? `1.5px solid ${accent}` : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isNow
                ? `0 0 0 1px ${accent}18, 0 40px 100px rgba(249, 115, 21, 0.28), 0 0 80px rgba(249, 115, 21, 0.12)`
                : '0 20px 60px rgba(0,0,0,0.5)',
              background: '#0a0a0a',
              transition: 'border-color 400ms ease, box-shadow 600ms ease',
            }}
          >
            {/* Crossfading layers */}
            {['past', 'now'].map((k) => (
              <img
                key={k}
                src={SIDES[k].img}
                alt={SIDES[k].label}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: side === k ? 1 : 0,
                  filter: k === 'now'
                    ? 'saturate(1.08) contrast(1.03)'
                    : 'grayscale(85%) brightness(0.85) contrast(0.95)',
                  transition: 'opacity 700ms ease',
                }}
              />
            ))}

            {/* Corner "LIVE"/"MANUAL" */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: isNow ? '#fff' : 'rgba(255,255,255,0.85)',
                padding: '5px 10px',
                borderRadius: 4,
                background: isNow ? `${accent}cc` : 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                transition: 'background 400ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isNow && (
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 0 8px #fff',
                    animation: 'cmpv3-pulse 1.4s ease-in-out infinite',
                  }}
                />
              )}
              <style>{`@keyframes cmpv3-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
              {s.corner}
            </div>
          </div>

          {/* Content panel */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 4px 4px 0' }}>
            <div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 38,
                  fontWeight: 600,
                  color: isNow ? '#fff' : 'rgba(255,255,255,0.88)',
                  letterSpacing: -0.8,
                  marginBottom: 6,
                  transition: 'color 300ms ease',
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 16,
                  color: isNow ? accent : 'rgba(255,255,255,0.45)',
                  marginBottom: 28,
                  transition: 'color 300ms ease',
                }}
              >
                {s.sublabel}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {s.rows.map((row, i) => (
                  <div
                    key={`${side}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      borderRadius: 14,
                      background: isNow ? `${accent}0A` : 'rgba(255,255,255,0.025)',
                      border: isNow ? `1px solid ${accent}33` : '1px solid rgba(255,255,255,0.06)',
                      opacity: 0,
                      animation: `cmpv3-row-in 500ms cubic-bezier(0.2, 0.7, 0.2, 1) ${100 + i * 100}ms forwards`,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
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
                      {isNow ? <CheckIcon3 /> : <CrossIcon3 />}
                    </div>
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 16,
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
                <style>{`
                  @keyframes cmpv3-row-in {
                    from { opacity: 0; transform: translateX(14px); }
                    to   { opacity: 1; transform: translateX(0); }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .cmpv3-stage { grid-template-columns: 1fr !important; gap: 20px !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

function CheckIcon3() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2 L5 8.5 L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon3() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

window.ComparisonV3 = ComparisonV3;
