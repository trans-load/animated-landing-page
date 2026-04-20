// Main app: scroll-driven hero with photo -> point cloud transition.
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#f97315",
    "pointSize": 1.6,
    "bg": "dark",
    "transition": "crossfade",
    "autoRotate": false,
    "headlineMode": "static"
  }/*EDITMODE-END*/;

  const [tweaks, setTweaks] = useStateApp(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useStateApp(false);
  const [progress, setProgress] = useStateApp(0); // 0..1 over the transition window
  const [scrolled, setScrolled] = useStateApp(false);
  const [heroInView, setHeroInView] = useStateApp(true); // hero section still touching viewport
  const [chipAnchors, setChipAnchors] = useStateApp({}); // {front,mid,back -> {x,y,onScreen}}
  const heroRef = useRefApp(null);
  const { lang, t } = window.useT();

  // Tweak host integration
  useEffectApp(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setTweaksOpen(true);
      if (d.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateTweaks = (partial) => {
    setTweaks((prev) => {
      const next = { ...prev, ...partial };
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: partial }, '*');
      return next;
    });
  };

  // Scroll progress: hero is sticky, drives 0..1 over its scroll range
  useEffectApp(() => {
    const onScroll = () => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolledPx = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolledPx / total : 0;
      setProgress(p);
      setScrolled(window.scrollY > 20);
      // Hero is "in view" until its bottom edge scrolls past the top of
      // the viewport. Used to fade the mobile position:fixed indicator
      // once the user has scrolled past the hero section entirely.
      setHeroInView(rect.bottom > 80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Computed visibility / opacities
  // Crossfade happens in the first 30% of scroll: photo fades out, cloud fades in.
  // After that, the cloud is fully visible and the camera continues dollying back.
  const fadeWindow = 0.3;
  const fadeT = Math.min(1, progress / fadeWindow);
  const photoOpacity = Math.max(0, 1 - fadeT);
  const cloudOpacity = fadeT;
  // Subtle photo zoom on push-in mode
  const photoScale = tweaks.transition === 'zoom' ? 1 + progress * 0.5 : 1 + progress * 0.08;

  const bgColor =
    tweaks.bg === 'light' ? '#e9e7e2' : tweaks.bg === 'mid' ? '#1a1a1d' : '#0a0a0a';

  return (
    <div style={{ background: bgColor, color: '#fff', minHeight: '100vh' }}>
      <Header accent={tweaks.accent} scrolled={scrolled} />

      {/* Hero: tall sticky section, drives the scroll transition */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          height: '160vh', // scroll length for the transition
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Hero scene: WebGL point cloud + photo plane that dissolves into it */}
          <div
            className="hero-scene"
            style={{
              position: 'absolute',
              inset: 0,
              willChange: 'opacity, transform',
            }}
          >
            {/* Original photo as a DOM image — no WebGL filtering or resampling. */}
            <img
              src="assets/warehouse.png?v=6"
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: Math.max(0, 1 - Math.max(0, progress - 0.05) / 0.35),
                transition: 'opacity 60ms linear',
                pointerEvents: 'none',
              }}
            />
            <PointCloud
              progress={progress}
              visible={true}
              pointSize={tweaks.pointSize}
              accent={tweaks.accent}
              autoRotate={false}
              onAnchorProject={setChipAnchors}
            />
            {/* Bottom gradient for hero copy legibility */}
            <div
              style={{
                position: 'absolute', inset: 0,
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Hero copy */}
          <div
            className="hero-bottombar"
            style={{
              position: 'absolute',
              left: 40,
              bottom: 56,
              right: 40,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 40,
              pointerEvents: 'none',
              // Fade out once the hero has scrolled past the viewport so
              // the indicator (position:fixed on mobile) doesn't linger
              // into the Install / Comparison sections.
              opacity: heroInView ? 1 : 0,
              transition: 'opacity 250ms ease',
            }}
          >
            <div style={{ maxWidth: 720 }}>
              {false && (
                <h1
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(40px, 5.6vw, 84px)',
                    lineHeight: 1.02,
                    letterSpacing: -1.5,
                    margin: 0,
                    color: '#fff',
                    textShadow: '0 2px 30px rgba(0,0,0,0.5)',
                    opacity: 1 - progress * 0.7,
                  }}
                >
                  Turn your existing<br />
                  security cameras<br />
                  into{' '}
                  <span
                    style={{
                      background: 'linear-gradient(90deg, #ffb070 0%, #f97315 55%, #c95808 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent',
                    }}
                  >
                    dimensioners
                  </span>
                </h1>
              )}
            </div>

            {/* Right corner: tiny progress indicator */}
            <div
              className="hero-progress"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                letterSpacing: 2,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                pointerEvents: 'none',
                minWidth: 220,
                justifyContent: 'flex-end',
              }}
            >
              <span style={{ opacity: 0.6 }}>{progress < 0.5 ? t('hero.progress.feed') : t('hero.progress.recon')}</span>
              <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${progress * 100}%`, height: '100%', background: tweaks.accent, transition: 'width 60ms linear' }} />
              </div>
            </div>
          </div>

          {/* Scroll-reveal headline — appears as point cloud settles, positioned centered below the cloud */}
          {true && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '4vh',
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
                opacity: Math.max(0, Math.min(1, (progress - 0.5) / 0.25)),
                transform: `translateY(${Math.max(0, 30 - progress * 60)}px)`,
                transition: 'opacity 200ms linear',
              }}
            >
              <div
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(28px, 3.8vw, 56px)',
                  lineHeight: 1.1,
                  letterSpacing: -1,
                  color: '#fff',
                  textAlign: 'center',
                  textShadow: '0 2px 30px rgba(0,0,0,0.6)',
                  maxWidth: '92vw',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 12px 5px 9px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.92)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                    fontSize: 12.5,
                    letterSpacing: -0.1,
                    marginBottom: 20,
                    textShadow: 'none',
                  }}
                >
                  <span style={{ color: '#6b6b6b', fontWeight: 400 }}>{t('hero.yc.backed_by')}</span>
                  <img
                    src="assets/partners/yc.png"
                    alt="Y"
                    style={{ height: 16, width: 16, display: 'block', borderRadius: 3 }}
                  />
                  <span style={{ color: '#6b6b6b', fontWeight: 500 }}>Combinator</span>
                </div>
                <div>{t('hero.headline.line1')}</div>
                <div style={{ marginTop: 6 }}>
                  {t('hero.headline.into')}{' '}
                  <span
                    style={{
                      background: 'linear-gradient(90deg, #ffb070 0%, #f97315 55%, #c95808 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent',
                    }}
                  >
                    {t('hero.headline.dimensioners')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll hint - fades on first scroll */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 16,
              transform: 'translateX(-50%)',
              opacity: Math.max(0, 1 - progress * 4),
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              pointerEvents: 'none',
            }}
          >
            <span>{t('hero.scroll')}</span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1" />
              <circle cx="7" cy="6" r="1.5" fill="currentColor">
                <animate attributeName="cy" values="6;12;6" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* Second scroll cue — appears during the reveal/rotate phase
              so the user knows the animation is still driven by scroll
              and keeps going. Opacity peaks at progress ~0.7 and fades
              out as we approach the end of the hero scroll. */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 28,
              transform: 'translateX(-50%)',
              opacity: Math.max(0, Math.min(1, (progress - 0.5) / 0.15) - Math.max(0, (progress - 0.85) / 0.1)),
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              pointerEvents: 'none',
              transition: 'opacity 120ms linear',
            }}
          >
            <span>{t('hero.scroll')}</span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
              <path d="M7 3 L7 15 M2 10 L7 15 L12 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>
        </div>

        {/* Per-item dimension chips — 3D-anchored in the point cloud so they
            follow the boxes across camera rotation and viewport changes. */}
        {(() => { const BBOX_COLOR = '#22a7f0'; return [
          { key: 'front', dims: t('hero.chip.front') },
          { key: 'mid',   dims: t('hero.chip.mid')   },
          { key: 'back',  dims: t('hero.chip.back')  },
        ].map((chip) => {
          const anchor = chipAnchors[chip.key];
          const visible = progress >= 0.5 && progress <= 0.88 && anchor && anchor.onScreen;
          const x = anchor ? anchor.x : 0;
          const y = anchor ? anchor.y : 0;
          return (
            <div
              key={chip.key}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 40,
                opacity: visible ? 1 : 0,
                // Center chip horizontally on anchor, sit it ~22px above the box.
                transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, calc(-100% - 22px))${visible ? '' : ' translateY(8px)'}`,
                transition: 'opacity 400ms ease',
                pointerEvents: 'none',
                padding: '8px 12px',
                borderRadius: 10,
                background: 'rgba(10, 10, 12, 0.72)',
                backdropFilter: 'blur(14px) saturate(140%)',
                WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                border: `1px solid ${BBOX_COLOR}`,
                boxShadow: `0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px ${BBOX_COLOR}22`,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                color: 'rgba(255,255,255,0.92)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                willChange: 'transform, opacity',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: tweaks.accent,
                boxShadow: `0 0 8px ${tweaks.accent}`, flexShrink: 0,
              }} />
              <span>{chip.dims}</span>
            </div>
          );
        }); })()}
      </section>
      <section
        className="trust-section"
        style={{
          padding: '56px 40px 64px',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: '#8a8a85',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            {t('trust.trusted_by')}
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {/* edge fade overlays — gradients over the track, cheap to composite */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0, bottom: 0, left: 0,
                width: 80,
                background: 'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0, bottom: 0, right: 0,
                width: 80,
                background: 'linear-gradient(270deg, #0a0a0a 0%, rgba(10,10,10,0) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
            <div
              className="trust-track trust-track-anim"
              style={{
                display: 'flex',
                gap: 72,
                alignItems: 'center',
                width: 'max-content',
              }}
            >
              {[...Array(2)].flatMap((_, dup) => (
                [
                  { f: 'yc.png', url: 'https://www.ycombinator.com', scale: 0.85 },
                  { f: 'wahl-co.png', url: 'https://www.wahl.co/en', scale: 1.0 },
                  { f: 'wolf.png', url: 'https://www.wolf-straubing.de/', scale: 1.0 },
                  { f: 'koch.png', url: 'https://www.koch-international.de', scale: 1.0 },
                  { f: 'hofmann.png', url: 'https://www.hofmann-spedition.de/', scale: 1.1 },
                  { f: 'eberl.png', url: 'https://spedition-eberl.de/', scale: 1.0 },
                  { f: 'droeder.png', url: 'https://www.droeder-logistik.de', scale: 1.4 },
                  { f: 'ctl.png', url: 'https://ctl-ag.de/', scale: 1.0 },
                  { f: 'emc.png', url: 'https://www.ei.tum.de/emc/home/', scale: 1.0, keepFilter: true },
                  { f: 'xplore.png', url: 'https://www.unternehmertum.de/en/services/xplore', scale: 1.15 },
                  { f: 'utum.png', url: 'https://www.unternehmertum.de', scale: 1.0 },
                  { f: 'tumvl.svg', url: 'https://www.tum.de', scale: 1.1, tone: 'light' },
                ].map(({ f, url, scale, tone, keepFilter }, i) => (
                  <a
                    key={`${dup}-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={f.replace(/\.(png|svg)$/, '')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      flexShrink: 0,
                      textDecoration: 'none',
                    }}
                  >
                    <img
                      src={`assets/partners/${f}`}
                      alt=""
                      className={`trust-logo${tone === 'light' ? ' trust-logo--light' : ''}${keepFilter ? ' trust-logo--keep' : ''}`}
                      style={{
                        height: 44 * scale,
                        width: 'auto',
                        objectFit: 'contain',
                        flexShrink: 0,
                      }}
                    />
                  </a>
                ))
              ))}
            </div>
          </div>
          <style>{`
            @keyframes trustMarquee {
              from { transform: translate3d(0,0,0); }
              to   { transform: translate3d(-50%,0,0); }
            }
            .trust-track-anim {
              animation: trustMarquee 45s linear infinite;
            }
            .trust-track {
              will-change: transform;
              transform: translateZ(0);
              backface-visibility: hidden;
            }
            .trust-logo {
              filter: invert(1) grayscale(1);
              opacity: 0.95;
              transition: opacity 220ms ease, transform 220ms ease, filter 220ms ease;
            }
            @media (max-width: 720px) {
              .trust-section { padding: 24px 16px 28px !important; }
              .trust-track { gap: 44px !important; }
              .trust-track-anim { animation-duration: 30s; }
              .trust-logo { height: 28px !important; max-height: 28px; }
            }
            .trust-logo--light {
              filter: grayscale(1);
            }
            .trust-logo:hover {
              filter: none;
              opacity: 1;
              transform: scale(1.06);
            }
            .trust-logo--keep:hover {
              filter: invert(1) grayscale(1);
            }
          `}</style>
        </div>
      </section>

      {/* Install story — runs on your existing cameras */}
      <section
        id="install"
        className="install-section"
        style={{
          padding: '112px 40px 80px',
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(34px, 4.2vw, 64px)',
              lineHeight: 1.08,
              letterSpacing: -1.2,
              margin: '0 auto',
              maxWidth: 980,
              textAlign: 'center',
              color: '#ffffff',
            }}
          >
            {t('install.headline.line1')}<br />
            {t('install.headline.line2')}<br />
            <span style={{ color: '#8a8a85' }}>{t('install.headline.line3')}</span>
          </h2>

          <div
            className="install-grid"
            style={{
              marginTop: 96,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 56,
              alignItems: 'start',
            }}
          >
            {[
              { n: '01', title: t('install.step1.title'), body: t('install.step1.body') },
              { n: '02', title: t('install.step2.title'), body: t('install.step2.body') },
              { n: '03', title: t('install.step3.title'), body: t('install.step3.body') },
            ].map((p) => (
              <div
                key={p.n}
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.14)',
                  paddingTop: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: 14,
                    letterSpacing: 0.5,
                  }}
                >
                  {p.n}
                </div>
                <div
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 20,
                    fontWeight: 500,
                    letterSpacing: -0.3,
                    color: '#ffffff',
                    lineHeight: 1.25,
                    marginBottom: 12,
                  }}
                >
                  {p.title}
                </div>
                <div
                  className="install-body"
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 16,
                    lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.68)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.body}
                </div>
              </div>
            ))}
          </div>
          {/* Responsive: stack to 1 column on phones and drop the line-clamp
              so body copy is fully visible. Keep the 3-column grid at tablet+. */}
          <style>{`
            @media (max-width: 860px) {
              .install-section { padding: 56px 20px 32px !important; }
              .install-grid {
                grid-template-columns: 1fr !important;
                gap: 28px !important;
                margin-top: 44px !important;
              }
              .install-body {
                -webkit-line-clamp: unset !important;
                display: block !important;
                overflow: visible !important;
              }
            }
          `}</style>

        </div>
      </section>

      {/* What changes with transload — past vs. now comparison.
          ?comparison=v3 switches to the interactive tab/stage variant. */}
      {(() => {
        const variant = (new URLSearchParams(window.location.search).get('comparison') || 'v2').toLowerCase();
        if (variant === 'v3' && window.ComparisonV3) return <ComparisonV3 accent={tweaks.accent} />;
        return <Comparison accent={tweaks.accent} />;
      })()}

      {/* Book a demo — Cal.com embed */}
      <BookDemo />

      {tweaksOpen && (
        <Tweaks values={tweaks} onChange={updateTweaks} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
