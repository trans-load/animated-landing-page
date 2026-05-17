// Book-a-demo section with Cal.com embed (jago-wahl/meet)
const { useEffect: useEffectBD, useRef: useRefBD, useState: useStateBD } = React;

function BookDemo() {
  const mounted = useRefBD(false);
  const sectionRef = useRefBD(null);
  const [shouldMount, setShouldMount] = useStateBD(false);
  const { t } = window.useT();

  // Defer the Cal.com bundle + iframe until the section approaches the
  // viewport. Saves a heavy network + JS cost on initial page load and
  // keeps scrolling smooth above this section.
  useEffectBD(() => {
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

  useEffectBD(() => {
    if (!shouldMount || mounted.current) return;
    mounted.current = true;

    // Official Cal.com embed init — pasted verbatim from their docs, then customized
    (function (C, A, L) {
      let p = function (a, ar) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal; let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    Cal("init", "meet", { origin: "https://transload.cal.com" });

    Cal.ns.meet("inline", {
      elementOrSelector: "#cal-inline-meet",
      config: { layout: "month_view", theme: "light" },
      calLink: "julius.scheel/20-min-intro",
    });

    Cal.ns.meet("ui", {
      cssVarsPerTheme: {
        light: { "cal-brand": "#f97315" },
        dark: { "cal-brand": "#f97315" },
      },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }, [shouldMount]);

  return (
    <section
      ref={sectionRef}
      id="book-demo"
      className="bookdemo-section"
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
          {t('book.headline')}
        </h2>

        <div
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.06)',
          }}
        >
          <div
            id="cal-inline-meet"
            style={{
              width: '100%',
              minHeight: 680,
              overflow: 'auto',
            }}
          />
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .bookdemo-section { padding: 48px 16px 56px !important; }
        }
      `}</style>
    </section>
  );
}

window.BookDemo = BookDemo;
