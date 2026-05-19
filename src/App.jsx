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
  // CCTV-style boot overlay: blocks scroll for 8s on first load while
  // the system "comes online", then fades out. The bar is a pure CSS
  // animation — no React state — so it always paints smoothly on any
  // device. JS only handles the timer that flips the overlay off.
  const [booting, setBooting] = useStateApp(true);
  const [bootFading, setBootFading] = useStateApp(false);
  // Live clock for the CCTV timestamp overlay during the intro phase.
  const [now, setNow] = useStateApp(() => new Date());
  useEffectApp(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  // Single hero video source — same 1080p file on desktop and mobile.
  const heroVideoSrc = 'assets/hero.mp4?v=4';
  const heroRef = useRefApp(null);
  const videoRef = useRefApp(null);
  // Ref on the hero text container so the scroll rAF can mutate the
  // `--p` CSS variable directly. CSS clamp()s drive every per-char
  // opacity/translate off that single variable — no React reconciliation
  // of the 30+ char spans on every scroll event.
  const heroTextRef = useRefApp(null);
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

  // Scroll progress: hero is sticky, drives 0..1 over its scroll range.
  //
  // Mouse wheels emit large chunky deltas (typically 100px/tick) while
  // trackpads emit small smooth deltas (~5-20px). If we read the raw
  // scroll position every wheel event, the video scrubs in jerky
  // multi-frame jumps on a mouse. Fix: maintain a smoothed
  // `currentP` that lerps toward the raw `targetP` on every rAF tick.
  // Mouse wheels still snap the scrollbar to the new position, but
  // the rendered video + CSS var catch up smoothly over ~150ms.
  useEffectApp(() => {
    let rafId = 0;
    let running = true;
    let targetP = 0;
    let currentP = 0;
    let lastSetP = -1;
    const LERP = 0.18; // ~0.85 catch-up in 150ms at 60fps

    const computeTarget = () => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolledPx = Math.min(Math.max(-rect.top, 0), total);
      targetP = total > 0 ? scrolledPx / total : 0;
      setScrolled(window.scrollY > 20);
      setHeroInView(rect.bottom > 80);
    };

    const tick = () => {
      if (!running) return;
      const delta = targetP - currentP;
      if (Math.abs(delta) < 0.0003) {
        currentP = targetP; // snap when essentially there
      } else {
        currentP += delta * LERP;
      }

      // Only push to React state when the smoothed value has moved
      // meaningfully — avoids re-rendering the whole tree at 60fps
      // for sub-pixel changes.
      if (Math.abs(currentP - lastSetP) > 0.002 || currentP === targetP) {
        setProgress(currentP);
        lastSetP = currentP;
      }

      // Drive the hero video frame from the SMOOTHED progress. The
      // first 15% of the scroll is the intro (monitor scaling up) —
      // during that, the video stays paused at frame 0. After
      // progress 0.15, the remaining 85% maps to the full duration.
      // Clamp the seek to the buffered range so slow connections
      // pause at the last loaded frame instead of trying to jump
      // past unloaded data (which freezes the element).
      const v = videoRef.current;
      if (v && v.duration && isFinite(v.duration)) {
        const INTRO_END = 0.15;
        const videoP = currentP < INTRO_END ? 0 : (currentP - INTRO_END) / (1 - INTRO_END);
        let target = videoP * v.duration;
        const b = v.buffered;
        const bufferedEnd = b && b.length > 0 ? b.end(b.length - 1) : 0;
        if (bufferedEnd > 0 && target > bufferedEnd - 0.05) {
          // Leave a 50ms safety margin behind the buffer head.
          target = Math.max(0, bufferedEnd - 0.05);
        }
        if (Math.abs(v.currentTime - target) > 1 / 48) {
          v.currentTime = target;
        }
      }

      // CSS variable for per-char headline reveal (clamp/calc on --p
      // computes opacity/translate without React reconciling chars).
      const tx = heroTextRef.current;
      if (tx) tx.style.setProperty('--p', String(currentP));

      rafId = requestAnimationFrame(tick);
    };

    computeTarget();
    currentP = targetP; // start without an initial catch-up animation
    window.addEventListener('scroll', computeTarget, { passive: true });
    window.addEventListener('resize', computeTarget, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener('scroll', computeTarget);
      window.removeEventListener('resize', computeTarget);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // iOS Safari won't render a frame from currentTime updates until the
  // video has been played at least once. Prime it by calling play() then
  // immediately pause()-ing on the first metadata load. muted + playsInline
  // makes this allowed without a user gesture.
  useEffectApp(() => {
    const v = videoRef.current;
    if (!v) return;
    const prime = () => {
      const promise = v.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(() => v.pause()).catch(() => {});
      } else {
        try { v.pause(); } catch (e) {}
      }
    };
    if (v.readyState >= 1) prime();
    else v.addEventListener('loadedmetadata', prime, { once: true });
    // Explicitly call .load() to encourage browsers (Safari especially)
    // to start fetching the full file immediately rather than waiting
    // for the first interaction.
    try { v.load(); } catch (e) {}
  }, []);

  // (Buffered-progress tracking was removed; the seek clamp in the
  // rAF loop below reads v.buffered directly each frame, so we don't
  // need a separate listener + React state for it.)


  // Boot sequence: lock scroll for 8s, then fade and unlock. Bar
  // animation lives in CSS keyframes (see .boot-bar in index.html);
  // this effect is just two timers.
  useEffectApp(() => {
    if (typeof window === 'undefined') return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    const fadeAt = setTimeout(() => setBootFading(true), 8000);
    const unlockAt = setTimeout(() => {
      setBooting(false);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    }, 8500);
    return () => {
      clearTimeout(fadeAt);
      clearTimeout(unlockAt);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const bgColor =
    tweaks.bg === 'light' ? '#e9e7e2' : tweaks.bg === 'mid' ? '#1a1a1d' : '#ffffff';

  return (
    <div style={{ background: bgColor, color: '#0a0a0a', minHeight: '100vh' }}>
      {booting && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            zIndex: 99999,
            opacity: bootFading ? 0 : 1,
            transition: 'opacity 500ms ease',
            pointerEvents: bootFading ? 'none' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            overflow: 'hidden',
            // touch-action: none stops mobile Safari from swallowing the
            // pull-to-refresh gesture under the overlay.
            touchAction: 'none',
          }}
        >
          {/* Center stack: brand logo + linear progress bar */}
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
            <img
              src="assets/logo-default.png?v=2"
              alt="transload"
              style={{
                height: 44,
                width: 'auto',
                display: 'block',
                margin: '0 auto 32px',
              }}
            />
            <div
              style={{
                width: 280,
                height: 2,
                margin: '0 auto',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Bar fill is a pure CSS keyframe animation — see
                  .boot-bar-fill in index.html. No JS state. */}
              <div className="boot-bar-fill" />
            </div>
          </div>

          {/* Scanlines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 3px)',
              mixBlendMode: 'screen',
            }}
          />
        </div>
      )}
      <Header accent={tweaks.accent} scrolled={scrolled} />

      {/* Hero: tall sticky section, drives the scroll transition.
          Longer scroll range = each scroll inch advances fewer video
          frames, which makes the scrub feel slower and smoother (the
          user's "half-speed" request) without re-encoding the file. */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          // Stack above the register-tab wrapper so the 1px marginBottom
          // overlap below paints section-black on top of wrapper-white.
          zIndex: 1,
          height: '220vh', // 120vh of scroll range = video advances ~5x slower per pixel
          background: '#000',
          // Overlap the next sibling (register-tab wrapper, white bg) by
          // 1px. Combined with z-index above, this guarantees the section's
          // black mask covers any sub-pixel rendering gap or white sliver
          // at the wrapper's top edge — mobile Safari was exposing the
          // wrapper white between the section bottom and the SVG fill.
          marginBottom: -1,
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            background: '#000', // shutter-closed backdrop while the clip-path circle opens
          }}
        >
          {/* Intro phase: at scroll 0 the hero video sits as a small
              "CCTV monitor" in the center of the dark stage; as the
              user scrolls through the first 15% of the hero, it scales
              up to fill the viewport. Once full-size, the existing
              scroll-bound playback takes over.
                progress 0    → monitor at scale 0.32, rounded corners
                progress 0.15 → fullscreen, square corners */}
          {(() => {
            const INTRO_END = 0.15;
            const introT = Math.max(0, Math.min(1, progress / INTRO_END));
            const scale = 0.58 + introT * 0.42;
            const radius = (1 - introT) * 16;
            const monitorOpacity = 1 - introT;
            return (
              <>
                {/* SCROLL prompt below the monitor — the only scroll
                    animation now. Fades out as the monitor reaches
                    full size. */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '5vh',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    opacity: monitorOpacity,
                    pointerEvents: 'none',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'opacity 160ms linear',
                    zIndex: 5,
                  }}
                >
                  <span>Scroll</span>
                  <svg width="24" height="36" viewBox="0 0 24 36" fill="none" aria-hidden="true">
                    <rect x="1" y="1" width="22" height="34" rx="11" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="10" r="2.5" fill="currentColor">
                      <animate attributeName="cy" values="10;22;10" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>

                {/* Hero scene — scaled during intro, scroll-bound after. */}
                <div
                  className="hero-scene"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    borderRadius: `${radius}px`,
                    overflow: 'hidden',
                    // Pure dark drop shadow — no white outline (it was
                    // showing through as a subtle bright sliver at the
                    // rounded bottom corners on mobile).
                    boxShadow: introT < 1
                      ? `0 36px 90px rgba(0,0,0,${0.55 * (1 - introT)})`
                      : 'none',
                    transition: 'transform 60ms linear, border-radius 60ms linear, box-shadow 120ms linear',
                  }}
                >
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              poster="assets/warehouse.png?v=6"
              src={heroVideoSrc}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />
            {/* CCTV overlay set — visible during the intro phase, fades
                out once the monitor reaches full size:
                  • REC badge   (top-left)
                  • Timestamp   (top-right, ticking live)
                  • CAM label   (bottom-left)
                  • Scanlines   (subtle horizontal interlace pattern) */}
            <div
              className="cctv-rec"
              style={{
                position: 'absolute',
                top: 36,
                left: 40,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 18,
                padding: '18px 30px 18px 26px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 3.2,
                color: '#ffffff',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                opacity: monitorOpacity,
                transition: 'opacity 160ms linear',
                zIndex: 6,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#ff3b30',
                  boxShadow: '0 0 18px rgba(255,59,48,0.95)',
                  animation: 'cctvPulse 1.4s ease-in-out infinite',
                }}
              />
              REC
            </div>

            {/* Live timestamp — top-right */}
            <div
              className="cctv-timestamp"
              style={{
                position: 'absolute',
                top: 36,
                right: 40,
                padding: '18px 26px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 3.2,
                color: '#ffffff',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                opacity: monitorOpacity,
                transition: 'opacity 160ms linear',
                zIndex: 6,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {(() => {
                const pad = (n) => String(n).padStart(2, '0');
                const Y = now.getFullYear();
                const M = pad(now.getMonth() + 1);
                const D = pad(now.getDate());
                const h = pad(now.getHours());
                const m = pad(now.getMinutes());
                const s = pad(now.getSeconds());
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.15, gap: 4 }}>
                    <span>{`${Y}-${M}-${D}`}</span>
                    <span>{`${h}:${m}:${s}`}</span>
                  </div>
                );
              })()}
            </div>

            {/* CAM identifier — bottom-left */}
            <div
              className="cctv-cam"
              style={{
                position: 'absolute',
                bottom: 36,
                left: 40,
                padding: '18px 26px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 3.2,
                color: '#ffffff',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                opacity: monitorOpacity,
                transition: 'opacity 160ms linear',
                zIndex: 6,
              }}
            >
              CAM-01 · DOCK-A
            </div>

            {/* CRT scanlines — subtle horizontal interlace pattern that
                fades out with the rest of the CCTV chrome. */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity: monitorOpacity * 0.55,
                background:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
                mixBlendMode: 'multiply',
                transition: 'opacity 160ms linear',
                zIndex: 5,
              }}
            />
            {/* Legibility scrim: radial vignette anchored low (where the
                headline sits) + a bottom gradient so the text reads
                cleanly against any video frame. */}
            <div
              style={{
                position: 'absolute', inset: 0,
                background:
                  `radial-gradient(ellipse 85% 55% at 50% 75%, rgba(0,0,0,${0.7 - progress * 0.3}) 0%, rgba(0,0,0,${0.35 - progress * 0.2}) 55%, rgba(0,0,0,0) 85%), ` +
                  'linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.65) 100%)',
                pointerEvents: 'none',
                transition: 'background 100ms linear',
              }}
            />
                </div>
              </>
            );
          })()}

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
            <div style={{ maxWidth: 720 }} />

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

          {/* Hero text — sits in front of the scroll-bound video, vertically
              centered. YC pill fades in cleanly, then the headline reveals
              letter-by-letter via `splitChars`. Each glyph carries its own
              `animation-delay` so the stagger is computed in render. */}
          {(() => {
            // Two-phase scroll-tied letter reveal. Line 1 reveals during
            // the first burst of scroll; the user pauses (video continues
            // playing through), then a second scroll reveals line 2.
            //   Phase 1: progress 0.00 → 0.30 → line 1 chars fade in
            //   Gap:     progress 0.30 → 0.50 → nothing reveals, video plays
            //   Phase 2: progress 0.50 → 0.85 → line 2 chars fade in
            // Letter reveals start after the intro phase (progress 0.15)
            // so no text bleeds onto the small CCTV monitor.
            const PHASE1_START = 0.18;
            const PHASE1_END = 0.42;
            const PHASE2_START = 0.55;
            const PHASE2_END = 0.85;
            const CHAR_WINDOW = 0.05;
            const line1Pre = t('hero.headline.line1') || '';
            const intoPre = t('hero.headline.into') || '';
            const dimPre = t('hero.headline.dimensioners') || '';
            // Each char carries its trigger `--t` (the progress point at
            // which it should start fading in) and the reveal window `--w`
            // as CSS custom properties. CSS clamp() in index.html turns
            // those plus the parent's `--p` (set by the scroll rAF) into
            // opacity + translateY. No React re-render of the chars when
            // progress changes — only the parent's `--p` is mutated, in
            // place, via heroTextRef. That's the smoothness fix.
            // Linear color interpolation between gradient stops. Each
            // char gets a solid rgb() — adjacent chars sample neighboring
            // points along the ramp, which reads as a smooth color fade
            // across the word. Robust across browsers (no background-clip
            // text gymnastics; no inline-block clip-propagation issues).
            const lerpColor = (p, stops) => {
              for (let k = 0; k < stops.length - 1; k++) {
                const a = stops[k], b = stops[k + 1];
                if (p <= b.p) {
                  const tt = (p - a.p) / Math.max(1e-6, b.p - a.p);
                  const r = Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * tt);
                  const g = Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * tt);
                  const bv = Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * tt);
                  return `rgb(${r}, ${g}, ${bv})`;
                }
              }
              const last = stops[stops.length - 1];
              return `rgb(${last.rgb.join(', ')})`;
            };
            // Wrap each WORD in inline-block + nowrap so chars within a
            // word can't break across lines; let the wrapper wrap at the
            // regular spaces between words. The phase trigger spans
            // `totalChars` slots even when the call only renders a slice
            // (starting at `charOffset`), so two adjacent splitChars
            // calls — e.g., "into " + "warehouse intelligence" — share
            // one continuous reveal timeline across phase 2.
            const splitChars = (text, startProg, endProg, totalChars, charOffset, gradient = null, keyPrefix = '') => {
              if (!text) return null;
              const N = [...text].length;
              const spread = Math.max(1e-6, endProg - startProg - CHAR_WINDOW);
              const perCharProg = totalChars > 1 ? spread / (totalChars - 1) : 0;
              let phasePos = charOffset;
              let localPos = 0;
              const tokens = text.split(/(\s+)/);
              return tokens.map((token, wi) => {
                if (!token) return null;
                if (/^\s+$/.test(token)) {
                  phasePos += token.length;
                  localPos += token.length;
                  return ' ';
                }
                return (
                  <span
                    key={`w-${keyPrefix}-${wi}`}
                    style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                  >
                    {[...token].map((ch, i) => {
                      const charColor = gradient
                        ? lerpColor(N > 1 ? localPos / (N - 1) : 0, gradient)
                        : undefined;
                      const trigger = startProg + phasePos * perCharProg;
                      phasePos += 1;
                      localPos += 1;
                      return (
                        <span
                          key={i}
                          className="hero-char"
                          style={{
                            '--t': trigger,
                            '--w': CHAR_WINDOW,
                            color: charColor,
                          }}
                        >
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                );
              });
            };
            const line1 = line1Pre;
            const intoText = intoPre;
            const dimText = dimPre;
            // Line 2 is treated as one continuous string for trigger
            // spacing so the chars in "into " and "warehouse intelligence"
            // form one smooth reveal across phase 2. The gradient is then
            // applied only to the dimText portion via separate render.
            const line2Full = (intoText ? intoText + ' ' : '') + dimText;
            return (
              <div
                ref={heroTextRef}
                className="hero-text"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '8vh',
                  pointerEvents: 'none',
                }}
              >
                {/* YC backing now lives in the trust strip below and (next)
                    as a small chip in the header — keeps the hero focused
                    on the product value prop. */}
                <div
                  className="hero-headline-wrap"
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontWeight: 700,
                    // Smaller min so the text doesn't blow out the viewport
                    // on narrow phones. em-based letter-spacing scales
                    // with the font size so per-char tightness reads the
                    // same on mobile and desktop.
                    fontSize: 'clamp(30px, 4.5vw, 60px)',
                    lineHeight: 0.98,
                    letterSpacing: '-0.032em',
                    color: '#fff',
                    textAlign: 'center',
                    textWrap: 'balance',
                    maxWidth: '92vw',
                    fontVariantLigatures: 'none',
                  }}
                >
                <h1 className="hero-headline" style={{ margin: 0, font: 'inherit', color: 'inherit', letterSpacing: 'inherit' }}>
                  {/* Phase 1: line 1 reveals across progress 0.00 → 0.30 */}
                  <span style={{ display: 'block' }}>
                    {splitChars(line1, PHASE1_START, PHASE1_END, [...line1].length, 0, null, 'l1')}
                  </span>
                  {/* Phase 2: line 2 reveals across progress 0.50 → 0.85.
                      "into " (no gradient) and "warehouse intelligence"
                      (gradient) share one continuous reveal timeline
                      by passing the same totalChars + offsetting the
                      second call by intoSpaced.length. */}
                  <span style={{ display: 'block', marginTop: 6 }}>
                    {intoText && splitChars(
                      intoText + ' ',
                      PHASE2_START, PHASE2_END,
                      [...line2Full].length, 0,
                      null, 'l2-into',
                    )}
                    {splitChars(
                      dimText,
                      PHASE2_START, PHASE2_END,
                      [...line2Full].length,
                      intoText ? [...intoText + ' '].length : 0,
                      [
                        { p: 0,    rgb: [255, 176, 112] },
                        { p: 0.55, rgb: [249, 115, 21]  },
                        { p: 1,    rgb: [201, 88, 8]    },
                      ],
                      'l2-dim',
                    )}
                  </span>
                </h1>
              </div>
            </div>
            );
          })()}

          {/* Scroll cues moved into the intro phase above — only one
              scroll animation now, instead of three. */}
        </div>
      </section>
      {/* BACKED BY — black band on the sides. The white YC tile is
          centered and straddles the boundary between this black band
          and the white trust strip below: chamfered top corners cut
          into the black, flat bottom merges seamlessly into the white.
          Same white as the rest of the page (#ffffff), no shadow or
          border, so it reads as a single continuous white surface
          rising into the black band like a podium. */}
      {/* BACKED BY — slim section divider with a YC tab cutout. The
          band itself is just tall enough to contain the original
          brief-spec notch (32px deep) plus a thin dark margin above.
          Wrapper background is white so it shows through the notch. */}
      <div style={{ position: 'relative', background: '#ffffff' }}>
        {/* Desktop register-tab path — notch is ~26% of viewBox width
            so on wide viewports it sits comfortably under the YC badge. */}
        <svg
          className="register-tab register-tab--desktop"
          width="100%"
          height="100"
          viewBox="0 0 680 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          <path
            d="M 0 0
               L 680 0
               L 680 80
               L 430 80
               Q 420 80 416 74
               L 396 38
               Q 392 32 382 32
               L 298 32
               Q 288 32 284 38
               L 264 74
               Q 260 80 250 80
               L 0 80 Z"
            fill="#040404"
          />
        </svg>
        {/* Mobile register-tab path — proportionally wider notch
            (~52% of viewBox) so the badge still fits inside it on
            narrow viewports. */}
        <svg
          className="register-tab register-tab--mobile"
          width="100%"
          height="92"
          viewBox="0 0 420 92"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          <path
            d="M 0 0
               L 420 0
               L 420 72
               L 340 72
               Q 330 72 326 66
               L 304 46
               Q 300 40 290 40
               L 130 40
               Q 120 40 116 46
               L 94 66
               Q 90 72 80 72
               L 0 72 Z"
            fill="#040404"
          />
        </svg>
        <a
          href="https://www.ycombinator.com/companies/transload"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Backed by Y Combinator"
          className="yc-badge"
          style={{
            position: 'absolute',
            left: '50%',
            // Anchor the badge near the upper portion of the notch
            // interior (slightly above its geometric center) so it
            // reads as "a bit up" inside the tab.
            top: 56,
            transform: 'translate(-50%, -50%)',
            // Notch interior on desktop: y=32 (ceiling) to y=80 (opening),
            // center y=56 in CSS px (SVG height 100). On mobile the
            // SVG is 92 tall so we override top via media query.
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: -0.1,
              color: '#6b6b6b',
              lineHeight: 1,
            }}
          >
            Backed by
          </span>
          <img
            src="assets/yc-logo.svg"
            alt=""
            aria-hidden="true"
            style={{ height: 20, width: 20, display: 'block', borderRadius: 3 }}
          />
          <span
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: -0.3,
              color: '#0a0a0a',
              lineHeight: 1,
            }}
          >
            Combinator
          </span>
        </a>
      </div>

      <section
        className="trust-section"
        style={{
          padding: '56px 40px 64px',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: '#6b6b6b',
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
                background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 100%)',
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
                background: 'linear-gradient(270deg, #ffffff 0%, rgba(255,255,255,0) 100%)',
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
                  // YC moved to its own dedicated "BACKED BY" row above
                  { f: 'wahl-co.png', url: 'https://www.wahl.co/en', scale: 1.0 },
                  { f: 'wolf.png', url: 'https://www.wolf-straubing.de/', scale: 1.0 },
                  { f: 'koch.png', url: 'https://www.koch-international.de', scale: 1.0 },
                  { f: 'hofmann.png', url: 'https://www.hofmann-spedition.de/', scale: 1.1 },
                  { f: 'droeder.png', url: 'https://www.droeder-logistik.de', scale: 1.4 },
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
                      loading="lazy"
                      decoding="async"
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
            /* On white background, drop the invert. Grayscale only,
               so logos read as dark monochrome on white. Originals
               that need to stay light (tone='light') invert + grayscale. */
            .trust-logo {
              filter: grayscale(1);
              opacity: 0.7;
              transition: opacity 220ms ease, transform 220ms ease, filter 220ms ease;
            }
            @media (max-width: 720px) {
              .trust-section { padding: 24px 16px 28px !important; }
              .trust-track { gap: 44px !important; }
              .trust-track-anim { animation-duration: 30s; }
              .trust-logo { height: 28px !important; max-height: 28px; }
            }
            .trust-logo--light {
              filter: invert(1) grayscale(1);
            }
            .trust-logo:hover {
              filter: none;
              opacity: 1;
              transform: scale(1.06);
            }
            .trust-logo--keep:hover {
              filter: grayscale(1);
            }
          `}</style>
        </div>
      </section>

      {/* Install story — runs on your existing cameras */}
      <section
        id="install"
        className="install-section"
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
              margin: 0,
              color: '#0a0a0a',
            }}
          >
            {t('install.headline.line1')}
            {t('install.headline.line2') && <><br />{t('install.headline.line2')}</>}
            {t('install.headline.line3') && <><br /><span style={{ color: '#8a8a85' }}>{t('install.headline.line3')}</span></>}
          </h2>

          <div
            className="install-grid"
            style={{
              marginTop: 64,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 28,
              alignItems: 'stretch',
            }}
          >
            {[
              {
                n: '01',
                title: t('install.step1.title'),
                desc: t('install.step1.desc'),
                cta: t('install.step1.cta'),
                anchor: t('install.step1.anchor'),
              },
              {
                n: '02',
                title: t('install.step2.title'),
                desc: t('install.step2.desc'),
                cta: t('install.step2.cta'),
                anchor: t('install.step2.anchor'),
              },
              {
                n: '03',
                title: t('install.step3.title'),
                desc: t('install.step3.desc'),
                cta: t('install.step3.cta'),
                anchor: t('install.step3.anchor'),
              },
            ].map((p) => {
              const isLink = lang === 'en' && p.anchor;
              const Tag = isLink ? 'a' : 'div';
              return (
                <Tag
                  key={p.n}
                  {...(isLink ? { href: p.anchor } : {})}
                  className="install-card"
                >
                  <span className="install-card-num">{p.n}</span>
                  <div className="install-card-title">{p.title}</div>
                  {p.desc && <div className="install-card-desc">{p.desc}</div>}
                  {isLink && p.cta && (
                    <span className="install-card-cta" style={{ color: tweaks.accent }}>
                      {p.cta}
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  )}
                </Tag>
              );
            })}
          </div>
          {/* Card styling + responsive: stack to 1 column on phones. */}
          <style>{`
            /* Light-theme install cards: soft white surface with a hint
               of orange tint, low-key shadows, dark text. The accent
               (orange) is the same; everything around it lifts up. */
            .install-card {
              position: relative;
              display: flex;
              flex-direction: column;
              padding: 40px 36px 34px;
              min-height: 340px;
              border-radius: 22px;
              background:
                radial-gradient(140% 90% at 0% 0%, rgba(249,115,21,0.08) 0%, rgba(249,115,21,0) 55%),
                linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
              box-shadow:
                0 1px 0 rgba(255,255,255,0.9) inset,
                0 0 0 1px rgba(0,0,0,0.06),
                0 16px 36px rgba(0,0,0,0.06),
                0 4px 10px rgba(0,0,0,0.04);
              text-decoration: none;
              color: inherit;
              transition: transform 380ms cubic-bezier(0.2, 0.7, 0.2, 1), background 380ms ease, box-shadow 380ms ease;
              overflow: hidden;
            }
            .install-card::before {
              content: '';
              position: absolute;
              left: 12%;
              right: 12%;
              top: 0;
              height: 2px;
              border-radius: 0 0 6px 6px;
              background: linear-gradient(90deg, rgba(249,115,21,0) 0%, rgba(249,115,21,0.55) 50%, rgba(249,115,21,0) 100%);
              opacity: 0.65;
              transition: opacity 380ms ease, height 380ms ease, background 380ms ease, left 380ms ease, right 380ms ease;
            }
            a.install-card:hover {
              transform: translateY(-8px);
              background:
                radial-gradient(140% 90% at 0% 0%, rgba(249,115,21,0.16) 0%, rgba(249,115,21,0) 55%),
                linear-gradient(180deg, #ffffff 0%, #fff7f0 100%);
              box-shadow:
                0 1px 0 rgba(255,255,255,1) inset,
                0 0 0 1px rgba(249,115,21,0.35),
                0 28px 64px rgba(0,0,0,0.10),
                0 8px 20px rgba(0,0,0,0.06),
                0 10px 40px rgba(249,115,21,0.20);
            }
            a.install-card:hover::before {
              left: 0;
              right: 0;
              height: 3px;
              opacity: 1;
              background: linear-gradient(90deg, rgba(249,115,21,0) 0%, rgba(249,115,21,1) 50%, rgba(249,115,21,0) 100%);
            }
            .install-card-num {
              position: relative;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 44px;
              height: 44px;
              border-radius: 999px;
              border: 1px solid rgba(249,115,21,0.45);
              background:
                radial-gradient(circle at 30% 30%, rgba(249,115,21,0.18), rgba(249,115,21,0.04) 70%);
              box-shadow:
                0 0 0 1px rgba(249,115,21,0.12),
                0 4px 12px rgba(249,115,21,0.14);
              font-family: "JetBrains Mono", monospace;
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 0.5px;
              color: #c95808;
              margin-bottom: 26px;
              transition: transform 380ms ease, box-shadow 380ms ease, background 380ms ease, color 380ms ease;
            }
            a.install-card:hover .install-card-num {
              transform: scale(1.06);
              color: #fff;
              background:
                radial-gradient(circle at 30% 30%, rgba(249,115,21,1), rgba(249,115,21,0.7) 70%);
              border-color: rgba(249,115,21,0.9);
              box-shadow:
                0 0 0 1px rgba(249,115,21,0.4),
                0 10px 28px rgba(249,115,21,0.5);
            }
            .install-card-title {
              font-family: "Inter", system-ui, sans-serif;
              font-size: 26px;
              font-weight: 500;
              letter-spacing: -0.5px;
              color: #0a0a0a;
              line-height: 1.2;
              margin-bottom: 16px;
            }
            .install-card-desc {
              font-family: "Inter", system-ui, sans-serif;
              font-size: 16px;
              line-height: 1.55;
              color: rgba(0,0,0,0.62);
              margin-bottom: 28px;
              flex: 1;
            }
            .install-card-cta {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-family: "JetBrains Mono", monospace;
              font-size: 12px;
              letter-spacing: 1.6px;
              text-transform: uppercase;
              opacity: 0.92;
              margin-top: auto;
            }
            .install-card-cta svg {
              width: 16px;
              height: 16px;
              transition: transform 240ms ease;
            }
            a.install-card:hover .install-card-cta svg {
              transform: translateX(5px);
            }
            @media (max-width: 860px) {
              .install-section { padding: 56px 20px 40px !important; }
              .install-grid {
                grid-template-columns: 1fr !important;
                gap: 16px !important;
                margin-top: 44px !important;
              }
              .install-card {
                padding: 28px 26px 26px;
                min-height: 0;
              }
              .install-card-title { font-size: 22px; }
              .install-card-desc { font-size: 15px; }
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

      {/* Search & reveal — tracking number → segmentation highlight.
          Bilingual: i18n keys cover the headline, picker, gate labels,
          status badges, and the demo CTA. */}
      {window.TrackingLookup && <TrackingLookup accent={tweaks.accent} />}

      {/* Founder contact cards */}
      <FounderCards accent={tweaks.accent} />

      {/* Book a demo — Cal.com embed */}
      <BookDemo />

      {/* FAQ */}
      <section
        id="faq"
        className="faq-section"
        style={{
          padding: '112px 40px 96px',
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: '#8a8a85',
              marginBottom: 16,
            }}
          >
            {t('faq.eyebrow')}
          </div>
          <h2
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(34px, 4.2vw, 56px)',
              lineHeight: 1.08,
              letterSpacing: -1.2,
              margin: 0,
              marginBottom: 64,
              color: '#0a0a0a',
            }}
          >
            {t('faq.headline')}
          </h2>
          <div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <details
                key={i}
                className="faq-item"
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.12)',
                  padding: '20px 0',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 19,
                    fontWeight: 500,
                    letterSpacing: -0.3,
                    color: '#0a0a0a',
                    lineHeight: 1.35,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 24,
                  }}
                >
                  <span>{t(`faq.q${i}.q`)}</span>
                  <svg
                    aria-hidden="true"
                    className="faq-marker"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: 4 }}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: 'rgba(0,0,0,0.62)',
                    marginTop: 14,
                    maxWidth: 820,
                  }}
                >
                  {t(`faq.q${i}.a`)}
                </div>
              </details>
            ))}
          </div>
          <style>{`
            .faq-item summary::-webkit-details-marker { display: none; }
            .faq-marker {
              color: rgba(0,0,0,0.45);
              transition: transform 200ms ease, color 200ms ease;
            }
            .faq-item[open] .faq-marker {
              transform: rotate(180deg);
              color: #f97315;
            }
            @media (max-width: 720px) {
              .faq-section { padding: 64px 20px 48px !important; }
            }
          `}</style>
        </div>
      </section>

      {/* Site footer — contact + legal links */}
      <Footer accent={tweaks.accent} />

      {tweaksOpen && (
        <Tweaks values={tweaks} onChange={updateTweaks} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
