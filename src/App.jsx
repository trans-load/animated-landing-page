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
  const heroRef = useRefApp(null);

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
            style={{
              position: 'absolute',
              inset: 0,
              willChange: 'opacity',
            }}
          >
            {/* Original photo as a DOM image — no WebGL filtering or resampling. */}
            <img
              src="assets/warehouse.png?v=5"
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
              <span style={{ opacity: 0.6 }}>{progress < 0.5 ? 'CAMERA FEED' : '3D RECONSTRUCTION'}</span>
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
                  <span style={{ color: '#6b6b6b', fontWeight: 400 }}>Backed by</span>
                  <img
                    src="assets/partners/yc.png"
                    alt="Y Combinator"
                    style={{ height: 15, width: 15, display: 'block', borderRadius: 2 }}
                  />
                  <span style={{ color: '#6b6b6b', fontWeight: 500 }}>Combinator</span>
                </div>
                <div>Turn your security cameras</div>
                <div style={{ marginTop: 6 }}>
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
            <span>Scroll</span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1" />
              <circle cx="7" cy="6" r="1.5" fill="currentColor">
                <animate attributeName="cy" values="6;12;6" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>

        {/* Shipment dimension readout — sits just above the CAMERA FEED / 3D RECONSTRUCTION label */}
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 'calc(72px + 15vh)',
            zIndex: 40,
            opacity: progress >= 0.15 && progress < 0.98 ? 1 : 0,
            transform: progress >= 0.15 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 400ms ease, transform 400ms ease',
            pointerEvents: 'none',
            padding: '14px 18px',
            borderRadius: 14,
            background: 'rgba(10, 10, 12, 0.72)',
            backdropFilter: 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            border: `1px solid ${tweaks.accent}55`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.45)',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: 'rgba(255,255,255,0.92)',
            minWidth: 260,
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
            color: tweaks.accent, marginBottom: 10,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: tweaks.accent,
              boxShadow: `0 0 8px ${tweaks.accent}`,
            }} />
            Live dimensions
          </div>
          {[1,2,3].map((i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', gap: 16,
              padding: '4px 0',
              borderTop: i === 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>ShipmentID{i}</span>
              <span>41″ × 55″ × 77″</span>
            </div>
          ))}
        </div>
      </section>
      <section
        style={{
          padding: '48px 40px 56px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          background: '#f3f3f1',
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
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            Trusted by
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
                background: 'linear-gradient(90deg, #f3f3f1 0%, rgba(243,243,241,0) 100%)',
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
                background: 'linear-gradient(270deg, #f3f3f1 0%, rgba(243,243,241,0) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
            <div
              className="trust-track"
              style={{
                display: 'flex',
                gap: 72,
                alignItems: 'center',
                width: 'max-content',
                animation: 'trustMarquee 45s linear infinite',
              }}
            >
              {[...Array(2)].flatMap((_, dup) => (
                [
                  { f: 'yc.png', url: 'https://www.ycombinator.com' },
                  { f: 'wahl-co.png', url: 'https://www.wahl-co.de' },
                  { f: 'wolf.png', url: 'https://www.wolf-spedition.de' },
                  { f: 'koch.png', url: 'https://www.koch-international.de' },
                  { f: 'hofmann.png', url: 'https://www.hofmann-unternehmensgruppe.de' },
                  { f: 'eberl.png', url: 'https://www.eberl-logistik.de' },
                  { f: 'droeder.png', url: 'https://www.droeder-logistik.de' },
                  { f: 'ctl.png', url: 'https://www.ctl-logistics.com' },
                  { f: 'emc.png', url: 'https://www.emc.tum.de' },
                  { f: 'xplore.png', url: 'https://www.xplore.network' },
                  { f: 'utum.png', url: 'https://www.unternehmertum.de' },
                  { f: 'tumvl.svg', url: 'https://www.tum.de' },
                ].map(({ f, url }, i) => (
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
                      className="trust-logo"
                      style={{
                        height: 44,
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
            .trust-track {
              will-change: transform;
              transform: translateZ(0);
              backface-visibility: hidden;
            }
            .trust-logo {
              opacity: 0.45;
              transition: opacity 220ms ease, transform 220ms ease;
            }
            .trust-logo:hover {
              opacity: 1;
              transform: scale(1.06);
            }
          `}</style>
        </div>
      </section>

      {/* Install story — runs on your existing cameras */}
      <section
        id="install"
        style={{
          padding: '120px 40px 140px',
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: '#8a8a85',
              marginBottom: 28,
              textAlign: 'center',
            }}
          >
            How it installs
          </div>

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
            No new hardware.<br />
            No new workflows.<br />
            <span style={{ color: '#8a8a85' }}>Just your existing cameras.</span>
          </h2>

          <div
            style={{
              marginTop: 96,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 48,
              alignItems: 'start',
            }}
          >
            {[
              {
                n: '01',
                title: 'Works with your existing cameras',
                body: 'We use what you have. Axis, Hikvision, Bosch, Dahua, Hanwha, or any IP camera.',
              },
              {
                n: '02',
                title: 'Zero process changes',
                body: 'No workflow changes for your team. No new hardware. Optimize around speed.',
              },
              {
                n: '03',
                title: 'From sampling to full coverage',
                body: 'Software\u2011only rollout. We connect to your WMS/TMS, calibrate and are ready to go.',
              },
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
        </div>
      </section>

      {/* What changes with Transload — past vs. now comparison */}
      <Comparison accent={tweaks.accent} />

      {/* Book a demo — Cal.com embed */}
      <BookDemo />

      {tweaksOpen && (
        <Tweaks values={tweaks} onChange={updateTweaks} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
