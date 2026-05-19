// Customer testimonial section: lazy-mounted YouTube embed. The iframe
// is heavy (~400 KB of player JS + thumbnail), so we defer it until the
// section approaches the viewport — same pattern the BookDemo + News
// sections use. Until then the wrapper holds the aspect ratio so there
// is zero layout shift when the iframe pops in.
const { useState: useStateTest, useEffect: useEffectTest, useRef: useRefTest } = React;

const VIDEO_ID = 'ntF3HpOKy1k';

function Testimonial({ accent = '#f97315' }) {
  const sectionRef = useRefTest(null);
  const [shouldMount, setShouldMount] = useStateTest(false);
  const { lang } = window.useT();
  const role = lang === 'de'
    ? 'Leiter Verkauf / IT · Eberl International Forwarding, Germany'
    : 'Head of Sales and IT · Eberl International Forwarding, Germany';

  useEffectTest(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldMount(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldMount(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: '300px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonial"
      className="testimonial-section"
      style={{
        padding: '112px 40px 96px',
        background: '#ffffff',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(34px, 4.2vw, 56px)',
            lineHeight: 1.08,
            letterSpacing: -1.2,
            margin: '0 0 64px',
            color: '#0a0a0a',
          }}
        >
          What our{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #ffb070 0%, #f97315 55%, #c95808 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            customers
          </span>{' '}
          say.
        </h2>

        {/* Speaker attribution — name + role + company + Eberl logo */}
        <div
          className="testimonial-attrib"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '14px 18px',
            marginBottom: 18,
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 17,
                fontWeight: 600,
                color: '#0a0a0a',
                letterSpacing: -0.2,
                lineHeight: 1.25,
              }}
            >
              Tobias Ramstötter
            </div>
            <div
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 14,
                color: 'rgba(0,0,0,0.6)',
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {role}
            </div>
          </div>
          <a
            href="https://spedition-eberl.de/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Eberl International Forwarding"
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <img
              src="assets/partners/eberl.png"
              alt="Eberl International Forwarding"
              loading="lazy"
              style={{
                height: 38,
                width: 'auto',
                objectFit: 'contain',
                opacity: 0.95,
              }}
            />
          </a>
        </div>

        <div
          className="testimonial-frame"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.10)',
            background: '#000',
            boxShadow: '0 20px 60px rgba(0,0,0,0.20)',
          }}
        >
          {shouldMount ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
              title="Customer testimonial"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          ) : (
            <a
              href={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open testimonial on YouTube"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `url(https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg) center/cover no-repeat`,
                textDecoration: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  background: `${accent}f0`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 12px 36px rgba(0,0,0,0.5), 0 0 0 6px ${accent}33`,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#0a0a0a" aria-hidden="true">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </span>
            </a>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .testimonial-section { padding: 64px 20px 64px !important; }
        }
      `}</style>
    </section>
  );
}

window.Testimonial = Testimonial;
