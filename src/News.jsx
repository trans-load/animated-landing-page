// News section: three LinkedIn embed iframes side-by-side. LinkedIn's
// embed renders the full post (author, text, image/video, "...see more"
// toggle, reactions) and is the only way to get video playback to work
// without us re-hosting the source. Iframes are lazy-mounted via an
// IntersectionObserver so we don't pay the ~500 KB-each cost until the
// section actually approaches the viewport.
const { useState: useStateNews, useEffect: useEffectNews, useRef: useRefNews } = React;

const NEWS_POSTS = [
  {
    urn: 'urn:li:activity:7462155204210229248',
    label: 'Julius Scheel',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7462155204210229248/',
  },
  {
    urn: 'urn:li:share:7452200442576412672',
    label: 'Jago Wahl-Schwentker',
    href: 'https://www.linkedin.com/posts/jagowahl_big-news-we-are-joining-y-combinator-and-share-7452200442576412672-iDNn',
  },
  {
    urn: 'urn:li:activity:7423653402854965248',
    label: 'TUM Entrepreneurial Masterclass',
    href: 'https://www.linkedin.com/posts/tum-entrepreneurial-masterclass_entrepreneurship-ai-computervision-activity-7423653402854965248-6-0Q',
  },
];

function News({ accent = '#f97315' }) {
  const sectionRef = useRefNews(null);
  const [shouldMount, setShouldMount] = useStateNews(false);

  useEffectNews(() => {
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
      { rootMargin: '400px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="news"
      className="news-section"
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
          From{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #ffb070 0%, #f97315 55%, #c95808 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            LinkedIn
          </span>
          .
        </h2>

        <div
          className="news-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          {NEWS_POSTS.map((p) => (
            <div
              key={p.urn}
              className="news-card"
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#ffffff',
                minHeight: 560,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {shouldMount ? (
                <iframe
                  src={`https://www.linkedin.com/embed/feed/update/${p.urn}`}
                  width="100%"
                  height="560"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  loading="lazy"
                  title={`LinkedIn post · ${p.label}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 560,
                    border: 'none',
                    flex: 1,
                  }}
                />
              ) : (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    background: '#ffffff',
                    color: 'rgba(0,0,0,0.55)',
                    textDecoration: 'none',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 13,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#0a66c2" aria-hidden="true">
                    <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM8 19H5V8h3v11zM6.5 6.73c-.97 0-1.75-.79-1.75-1.76S5.53 3.21 6.5 3.21s1.75.79 1.75 1.76S7.47 6.73 6.5 6.73zM20 19h-3v-5.6c0-3.37-4-3.11-4 0V19h-3V8h3v1.77c1.4-2.59 7-2.78 7 2.48V19z" />
                  </svg>
                  <span>{p.label}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .news-section { padding: 64px 0 64px !important; }
          .news-section > div { padding-left: 20px; padding-right: 20px; }
          /* Swap the grid for a horizontally-scrollable rail. Cards take
             ~84% of the viewport so the next one peeks in, hinting at the
             swipe affordance. scroll-snap keeps each card centred when
             the user lets go. The rail extends past the section's 20px
             text padding so swipes feel edge-to-edge. */
          .news-grid {
            display: flex !important;
            grid-template-columns: none !important;
            gap: 14px !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 4px 20px 14px;
            margin: 0 -20px;
          }
          .news-grid::-webkit-scrollbar { display: none; }
          .news-card {
            flex: 0 0 84vw;
            scroll-snap-align: start;
            min-height: 520px !important;
          }
          .news-card iframe { height: 520px !important; }
        }
      `}</style>
    </section>
  );
}

window.News = News;
