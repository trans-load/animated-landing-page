// Tracking lookup section: type or pick a tracking number, the matching
// segmentation lights up on the warehouse photo. Hovering any segment shows
// its details. Sourced from a COCO-style annotations export.
const { useState: useStateTL, useEffect: useEffectTL, useMemo: useMemoTL, useRef: useRefTL } = React;

// One color per gate — used to tint segmentations on the image and to label
// the columns in the picker. There's one gate per detected dock door, and
// each handling unit is assigned to its nearest dock so the door + the
// freight in front of it share a color. Palette spread across the hue
// wheel for visibility on the dark photo; orange is reserved for selection.
const GATE_COLORS = ['#38bdf8', '#34d399', '#facc15', '#f472b6', '#a78bfa'];

function TrackingLookup({ accent = '#f97315' }) {
  const { t } = window.useT();
  // Translate a raw enum-like string (status or category) via i18n. If
  // no translation key exists, fall back to the original raw value so
  // un-mapped strings (e.g. future status values from the JSON data)
  // still render readably.
  const lookup = (prefix, raw) => {
    if (!raw) return raw;
    const key = prefix + raw.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const out = t(key);
    return out && out !== key ? out : raw;
  };
  const statusLabel = (s) => lookup('tracking.status.', s);
  const categoryLabel = (c) => lookup('tracking.cat.', c);
  const [data, setData] = useStateTL(null);
  const [loadError, setLoadError] = useStateTL(null);
  const [selectedId, setSelectedId] = useStateTL(null);
  const [hoverId, setHoverId] = useStateTL(null);
  const [tooltipPos, setTooltipPos] = useStateTL(null); // {x,y} relative to image wrap
  const [pickerOpen, setPickerOpen] = useStateTL(false);
  // Auto-tour cursor: drifts between a few handling units with a "Click
  // here" badge attached, inviting the user to take over. Stops on the
  // user's first real interaction.
  const [demoCursor, setDemoCursor] = useStateTL(null); // {ix, iy} in image coords
  const [demoStopped, setDemoStopped] = useStateTL(false);
  const [sectionSeen, setSectionSeen] = useStateTL(false);
  // Tracks whether the section is currently in the viewport so we can pause
  // the polygon breathing animations + auto-tour timers when off-screen.
  const [sectionInView, setSectionInView] = useStateTL(false);
  const pickerWrapRef = useRefTL(null);
  const imgWrapRef = useRefTL(null);
  const demoTimersRef = useRefTL([]);

  useEffectTL(() => {
    let cancelled = false;
    fetch('assets/tracking-scene.json?v=2')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => { if (!cancelled) setData(j); })
      .catch((e) => { if (!cancelled) setLoadError(String(e)); });
    return () => { cancelled = true; };
  }, []);

  const trackedItems = useMemoTL(
    () => (data ? data.items.filter((it) => it.tracking) : []),
    [data]
  );
  const allItems = useMemoTL(() => (data ? data.items : []), [data]);
  const itemsById = useMemoTL(() => {
    const m = {};
    if (data) for (const it of data.items) m[it.id] = it;
    return m;
  }, [data]);

  // One gate per detected dock door, sorted left-to-right by x-centroid.
  const docks = useMemoTL(() => {
    if (!data) return [];
    return data.items
      .filter((it) => it.category === 'Dock' && it.bbox)
      .map((it) => ({ ...it, cx: it.bbox[0] + it.bbox[2] / 2 }))
      .sort((a, b) => a.cx - b.cx);
  }, [data]);

  // Bucket each handling unit into the gate of its nearest dock.
  const itemsByGate = useMemoTL(() => {
    const buckets = docks.map(() => []);
    if (docks.length === 0) return buckets;
    for (const it of trackedItems) {
      if (!it.bbox) continue;
      const cx = it.bbox[0] + it.bbox[2] / 2;
      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < docks.length; i++) {
        const d = Math.abs(cx - docks[i].cx);
        if (d < bestD) { bestD = d; bestI = i; }
      }
      buckets[bestI].push(it);
    }
    for (const b of buckets) {
      b.sort((a, b2) => a.bbox[1] - b2.bbox[1]);
    }
    return buckets;
  }, [trackedItems, docks]);

  // Reverse map: item.id → gate index, covers handling units AND docks so
  // a door inherits the same color as the freight assigned to its gate.
  const gateOf = useMemoTL(() => {
    const m = {};
    itemsByGate.forEach((bucket, gi) => {
      for (const it of bucket) m[it.id] = gi;
    });
    docks.forEach((dk, gi) => { m[dk.id] = gi; });
    return m;
  }, [itemsByGate, docks]);

  // Close picker on outside click.
  useEffectTL(() => {
    const onClick = (e) => {
      if (!pickerWrapRef.current) return;
      if (!pickerWrapRef.current.contains(e.target)) setPickerOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  // IntersectionObserver: only start the demo once the image actually
  // scrolls into view, so it doesn't play to an empty section above the fold.
  useEffectTL(() => {
    const el = imgWrapRef.current;
    if (!el || sectionSeen) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSectionSeen(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setSectionSeen(true); obs.disconnect(); break; }
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sectionSeen]);

  // Track current viewport intersection so the polygon breathing animations
  // can be paused via CSS when the section is scrolled out of view.
  useEffectTL(() => {
    const el = imgWrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSectionInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setSectionInView(e.isIntersecting);
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-demo: once the section is visible, roam a simulated cursor between
  // a few handling units with a "Click here" badge attached. Loops until
  // the user interacts. Doesn't select on its own — it's an invitation.
  useEffectTL(() => {
    if (!data || !sectionSeen || demoStopped) return;
    const hus = data.items.filter((it) => it.tracking && it.bbox);
    if (hus.length < 2) return;
    // Pick 3 visually distinct handling units spread across the image.
    const sorted = [...hus].sort((a, b) => {
      const ax = a.bbox[0] + a.bbox[2] / 2;
      const bx = b.bbox[0] + b.bbox[2] / 2;
      return ax - bx;
    });
    const picks = [0.2, 0.5, 0.8]
      .map((p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))])
      .filter(Boolean);

    const schedule = (fn, ms) => {
      const t = setTimeout(fn, ms);
      demoTimersRef.current.push(t);
    };

    let i = 0;
    const visit = () => {
      const it = picks[i % picks.length];
      i++;
      const [x, y, w, h] = it.bbox;
      const cx = x + w / 2;
      const cy = y + h / 2;
      setDemoCursor({ ix: cx, iy: cy });
      // Light the segment up so the badge clearly "points to" something
      // interactive, but don't pop the tooltip — the badge is the message.
      schedule(() => setHoverId(it.id), 700);
      schedule(visit, 1900);
    };

    schedule(visit, 500);

    return () => {
      demoTimersRef.current.forEach((t) => clearTimeout(t));
      demoTimersRef.current = [];
    };
  }, [data, sectionSeen, demoStopped]);

  // Any real pointer interaction inside the image kills the auto-demo.
  const stopDemo = () => {
    if (demoStopped) return;
    demoTimersRef.current.forEach((t) => clearTimeout(t));
    demoTimersRef.current = [];
    setDemoStopped(true);
    setDemoCursor(null);
    setHoverId(null);
  };

  const selectItem = (it) => {
    if (!it) return;
    setSelectedId(it.id);
    setPickerOpen(false);
    stopDemo();
  };

  const onSegmentMove = (e, it) => {
    const wrap = imgWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setHoverId(it.id);
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const onSegmentLeave = () => {
    setHoverId(null);
    setTooltipPos(null);
  };

  // Compute polygon points strings once data loads.
  const polysFor = (it) =>
    (it.segmentation || []).map((poly) => {
      let s = '';
      for (let i = 0; i < poly.length; i += 2) {
        s += (i ? ' ' : '') + poly[i] + ',' + poly[i + 1];
      }
      return s;
    });

  const selected = selectedId ? itemsById[selectedId] : null;
  const hovered = hoverId ? itemsById[hoverId] : null;
  const focusedItem = hovered || selected;

  // Centroid of selected segment (for the “target” crosshair).
  const selectedCentroid = useMemoTL(() => {
    if (!selected || !selected.bbox) return null;
    const [x, y, w, h] = selected.bbox;
    return { x: x + w / 2, y: y + h / 2 };
  }, [selected]);

  const imgW = data ? data.imageWidth : 1600;
  const imgH = data ? data.imageHeight : 1200;

  return (
    <section
      id="tracking-lookup"
      className="tracking-section"
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
          {t('tracking.headline.prefix')}{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #ffb070 0%, #f97315 55%, #c95808 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            {t('tracking.headline.accent')}
          </span>
        </h2>

        {loadError && (
          <div style={{ color: '#ff8a80', fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
            Failed to load annotations: {loadError}
          </div>
        )}

        <div
          className="tracking-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 360px) 1fr',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Left column: dropdown trigger + selected detail */}
          <div ref={pickerWrapRef} style={{ position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: 'rgba(10,10,10,0.55)',
                marginBottom: 10,
              }}
            >
              {t('tracking.count_template').replace('{n}', trackedItems.length)}
            </label>
            <button
              type="button"
              onClick={() => { stopDemo(); setPickerOpen((o) => !o); }}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              style={{
                width: '100%',
                appearance: 'none',
                background: '#ffffff',
                border: `1px solid ${pickerOpen ? accent : 'rgba(0,0,0,0.14)'}`,
                borderRadius: 12,
                padding: '14px 16px',
                color: '#0a0a0a',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'border-color 160ms ease, box-shadow 160ms ease',
                boxShadow: pickerOpen ? `0 0 0 4px ${accent}1a` : 'none',
              }}
            >
              {selected && gateOf[selected.id] != null && (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: GATE_COLORS[gateOf[selected.id]],
                  boxShadow: `0 0 6px ${GATE_COLORS[gateOf[selected.id]]}aa`,
                  flexShrink: 0,
                }} />
              )}
              <span style={{
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: selected ? '#0a0a0a' : 'rgba(10,10,10,0.55)',
                minWidth: 0,
              }}>
                {selected ? selected.tracking : t('tracking.select')}
              </span>
              {selected && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear selection"
                  onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setSelectedId(null); } }}
                  style={{
                    color: 'rgba(10,10,10,0.55)',
                    fontSize: 18,
                    lineHeight: 1,
                    padding: '0 4px',
                    cursor: 'pointer',
                  }}
                >×</span>
              )}
              <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"
                style={{
                  flexShrink: 0,
                  color: 'rgba(10,10,10,0.55)',
                  transform: pickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 180ms ease',
                }}
              >
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* One column per detected dock door (gate) */}
            {pickerOpen && (
              <div
                role="listbox"
                className="tracking-picker"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 30,
                  width: `min(${Math.max(420, itemsByGate.length * 190)}px, calc(100vw - 80px))`,
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.10)',
                  borderRadius: 14,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.05)',
                  padding: 14,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${itemsByGate.length || 1}, 1fr)`,
                  gap: 10,
                }}
              >
                {itemsByGate.map((bucket, gi) => {
                  const gateColor = GATE_COLORS[gi];
                  return (
                  <div key={gi} style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '4px 6px 10px',
                        borderBottom: `1px solid ${gateColor}44`,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 10,
                        letterSpacing: 1.4,
                        textTransform: 'uppercase',
                        color: gateColor,
                      }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: gateColor,
                          boxShadow: `0 0 6px ${gateColor}aa`,
                        }} />
                        {t('tracking.gate')} {gi + 1}
                      </span>
                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 10,
                        color: 'rgba(10,10,10,0.35)',
                      }}>
                        {bucket.length}
                      </span>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {bucket.length === 0 && (
                        <div style={{
                          padding: '8px 6px',
                          color: 'rgba(10,10,10,0.32)',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: 11,
                        }}>—</div>
                      )}
                      {bucket.map((it) => {
                        const isSel = it.id === selectedId;
                        return (
                          <div
                            key={it.id}
                            role="option"
                            aria-selected={isSel}
                            onMouseDown={(e) => { e.preventDefault(); selectItem(it); }}
                            onMouseEnter={() => setHoverId(it.id)}
                            onMouseLeave={() => setHoverId((h) => h === it.id ? null : h)}
                            style={{
                              padding: '7px 8px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              background: isSel ? `${accent}22` : 'transparent',
                              borderLeft: isSel ? `2px solid ${accent}` : `2px solid transparent`,
                              marginBottom: 2,
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: 11.5,
                              color: isSel ? '#0a0a0a' : 'rgba(10,10,10,0.78)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.4,
                              transition: 'background 120ms ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                            title={`${it.tracking}\n${it.carrier} → ${it.destination}`}
                          >
                            <span style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: gateColor,
                              flexShrink: 0,
                              opacity: 0.85,
                            }} />
                            <span style={{
                              flex: 1,
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>{it.tracking}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Currently-selected detail card */}
            {selected && (() => {
              const selGate = gateOf[selected.id];
              const selGateColor = selGate != null ? GATE_COLORS[selGate] : null;
              return (
              <div
                style={{
                  marginTop: 18,
                  padding: '16px 18px',
                  background: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  {selGateColor && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '3px 8px',
                      background: `${selGateColor}1c`,
                      border: `1px solid ${selGateColor}55`,
                      borderRadius: 999,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 10,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: selGateColor,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: selGateColor }} />
                      {t('tracking.gate')} {selGate + 1}
                    </span>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: 'rgba(10,10,10,0.7)',
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: selected.statusColor || accent,
                      boxShadow: `0 0 8px ${selected.statusColor || accent}`,
                    }} />
                    {statusLabel(selected.status)}
                  </span>
                </div>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 14,
                  color: '#0a0a0a',
                  marginBottom: 10,
                  wordBreak: 'break-all',
                }}>
                  {selected.tracking}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <Stat label={t('tracking.carrier')} value={selected.carrier} />
                  <Stat label={t('tracking.destination')} value={selected.destination} />
                </div>
              </div>
              );
            })()}
          </div>

          {/* Right column: image + segmentation overlay */}
          <div
            ref={imgWrapRef}
            className="tracking-imgwrap"
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#000',
              aspectRatio: `${imgW} / ${imgH}`,
              width: '100%',
            }}
            onMouseLeave={onSegmentLeave}
            onPointerMove={stopDemo}
            onPointerDown={stopDemo}
          >
            {/* Background image */}
            {data && (
              <img
                src={data.image + '?v=1'}
                alt="Warehouse loading bay with segmented handling units"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: focusedItem ? 'brightness(0.65)' : 'brightness(0.92)',
                  transition: 'filter 220ms ease',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            )}
            {/* Loading skeleton */}
            {!data && !loadError && (
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 12,
                  letterSpacing: 1.5,
                }}
              >
                LOADING CAMERA FEED…
              </div>
            )}

            {/* Segmentation overlay */}
            {data && (
              <svg
                viewBox={`0 0 ${imgW} ${imgH}`}
                preserveAspectRatio="xMidYMid slice"
                className={sectionInView ? undefined : 'tl-paused'}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  display: 'block',
                }}
              >
                {allItems.map((it) => {
                  const isSel = it.id === selectedId;
                  const isHov = it.id === hoverId;
                  const isHU = !!it.tracking;
                  const isDock = it.category === 'Dock';
                  const hasSelection = !!selectedId;
                  // Dock doors and the freight assigned to them share a
                  // gate index, so they share a color from GATE_COLORS.
                  const gi = gateOf[it.id];
                  const gateColor = (isHU || isDock) && gi != null ? GATE_COLORS[gi] : null;
                  // Visibility logic:
                  //   - selected → bold accent
                  //   - hovered (and not selected) → white highlight
                  //   - a selection exists but this isn't it → invisible
                  //     (still hoverable so you can probe other items)
                  //   - nothing selected → handling units & dock doors glow
                  //     in their gate color; other detected objects (forklift,
                  //     operator, pallet jack) get a faint white outline
                  let stroke, fill, strokeWidth;
                  if (isSel) {
                    stroke = accent;
                    fill = `${accent}40`;
                    strokeWidth = 3.5;
                  } else if (isHov) {
                    stroke = '#ffffff';
                    fill = 'rgba(255,255,255,0.14)';
                    strokeWidth = 2.6;
                  } else if (hasSelection) {
                    stroke = 'rgba(255,255,255,0)';
                    fill = 'rgba(255,255,255,0)';
                    strokeWidth = 1;
                  } else if (isHU) {
                    stroke = `${gateColor}cc`;
                    fill = `${gateColor}24`;
                    strokeWidth = 1.8;
                  } else if (isDock && gateColor) {
                    // Slightly softer than handling units so pallets remain
                    // the primary focus but the door's group is still legible.
                    stroke = gateColor;
                    fill = `${gateColor}26`;
                    strokeWidth = 2.2;
                  } else {
                    stroke = 'rgba(255,255,255,0.42)';
                    fill = 'rgba(255,255,255,0.04)';
                    strokeWidth = 1.4;
                  }
                  // Gentle breathing animation on idle handling-unit
                  // polygons signals interactivity. Stops the moment the
                  // user selects, hovers, or any other state takes over.
                  const breathe = isHU && !isSel && !isHov && !hasSelection;
                  return polysFor(it).map((points, i) => (
                    <polygon
                      key={`${it.id}-${i}`}
                      points={points}
                      className={breathe ? 'tl-poly-breathe' : undefined}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      onMouseMove={(e) => onSegmentMove(e, it)}
                      onMouseEnter={(e) => onSegmentMove(e, it)}
                      onMouseLeave={onSegmentLeave}
                      onClick={() => { if (isHU) selectItem(it); }}
                      style={{
                        cursor: isHU ? 'pointer' : 'default',
                        transition: 'fill 140ms ease, stroke 140ms ease, stroke-width 140ms ease',
                        pointerEvents: 'auto',
                      }}
                    />
                  ));
                })}
                {/* Pulsing ring around the selected segment's centroid */}
                {selected && selectedCentroid && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle
                      cx={selectedCentroid.x}
                      cy={selectedCentroid.y}
                      r={28}
                      fill="none"
                      stroke={accent}
                      strokeWidth={2}
                      opacity={0.9}
                    >
                      <animate attributeName="r" values="20;60;20" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0;0.9" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle
                      cx={selectedCentroid.x}
                      cy={selectedCentroid.y}
                      r={5}
                      fill={accent}
                    />
                  </g>
                )}
                {/* Auto-demo cursor — drifts between pallets to invite
                    interaction. Paired with a DOM-positioned "Click here"
                    badge rendered below. */}
                {demoCursor && (
                  <g
                    className="tl-demo-cursor"
                    style={{
                      transform: `translate(${demoCursor.ix}px, ${demoCursor.iy}px)`,
                      transition: 'transform 1100ms cubic-bezier(0.45, 0, 0.2, 1)',
                      pointerEvents: 'none',
                    }}
                  >
                    {/* Soft halo so the cursor reads against busy backgrounds */}
                    <circle r="22" fill={accent} opacity="0.18">
                      <animate attributeName="r" values="14;26;14" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.22;0.06;0.22" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                    {/* Classic arrow pointer, scaled up for image-coords. */}
                    <g transform="scale(2.4) translate(-2, -2)">
                      <path
                        d="M0,0 L0,17 L4.6,12.6 L7.7,21 L10.5,19.9 L7.5,11.6 L13.2,11.4 Z"
                        fill="#ffffff"
                        stroke="#0a0a0a"
                        strokeWidth="1.1"
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                )}
              </svg>
            )}

            {/* "Click here" badge that follows the demo cursor. Positioned
                via percentages so it tracks the cursor's image-space
                coordinates across resizes. CSS transitions on left/top
                keep it in lockstep with the SVG cursor's glide. */}
            {data && demoCursor && (
              <div
                className="tl-click-badge"
                style={{
                  position: 'absolute',
                  left: `${(demoCursor.ix / data.imageWidth) * 100}%`,
                  top: `${(demoCursor.iy / data.imageHeight) * 100}%`,
                  transform: 'translate(22px, -42px)',
                  pointerEvents: 'none',
                  zIndex: 6,
                  transition: 'left 1100ms cubic-bezier(0.45, 0, 0.2, 1), top 1100ms cubic-bezier(0.45, 0, 0.2, 1)',
                }}
              >
                <div
                  style={{
                    padding: '6px 12px',
                    background: accent,
                    color: '#0a0a0a',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 8px 22px rgba(0,0,0,0.45), 0 0 0 4px ${accent}26`,
                  }}
                >
                  {t('tracking.click_here')}
                </div>
              </div>
            )}

            {/* Floating tooltip on hover */}
            {hovered && tooltipPos && (() => {
              // Keep tooltip inside the image wrap.
              const wrap = imgWrapRef.current;
              const W = wrap ? wrap.clientWidth : 800;
              const H = wrap ? wrap.clientHeight : 600;
              const tipW = 240;
              const tipH = hovered.tracking ? 110 : 70;
              let left = tooltipPos.x + 14;
              let top = tooltipPos.y + 14;
              if (left + tipW > W - 8) left = tooltipPos.x - tipW - 14;
              if (top + tipH > H - 8) top = tooltipPos.y - tipH - 14;
              if (left < 8) left = 8;
              if (top < 8) top = 8;
              return (
                <div
                  style={{
                    position: 'absolute',
                    left,
                    top,
                    width: tipW,
                    padding: '12px 14px',
                    background: 'rgba(10, 10, 12, 0.92)',
                    backdropFilter: 'blur(14px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                    border: `1px solid ${hovered.tracking ? (GATE_COLORS[gateOf[hovered.id] || 0] + '99') : 'rgba(255,255,255,0.18)'}`,
                    borderRadius: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    color: '#fff',
                    pointerEvents: 'none',
                    zIndex: 5,
                    fontFamily: '"Inter", system-ui, sans-serif',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                    marginBottom: 4,
                  }}>
                    {hovered.tracking && gateOf[hovered.id] != null && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: GATE_COLORS[gateOf[hovered.id]],
                        flexShrink: 0,
                      }} />
                    )}
                    <span>
                      {hovered.tracking && gateOf[hovered.id] != null
                        ? `${t('tracking.gate')} ${gateOf[hovered.id] + 1} · ${categoryLabel(hovered.category)}`
                        : categoryLabel(hovered.category)}
                    </span>
                  </div>
                  {hovered.tracking ? (
                    <>
                      <div style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 13,
                        color: '#fff',
                        marginBottom: 8,
                        wordBreak: 'break-all',
                        lineHeight: 1.25,
                      }}>
                        {hovered.tracking}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11.5 }}>
                        <TipLine label={t('tracking.tip.status')} value={statusLabel(hovered.status)} color={hovered.statusColor} />
                        <TipLine label={t('tracking.tip.dest')} value={hovered.destination} />
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                      {t('tracking.tip.detected_as')} <strong style={{ color: '#fff' }}>{hovered.label}</strong>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Counter chip top-left */}
            {data && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  padding: '6px 10px',
                  background: 'rgba(10, 10, 12, 0.72)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 999,
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 8,
                  pointerEvents: 'none',
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: accent, boxShadow: `0 0 8px ${accent}`,
                }} />
                {t('tracking.tip.counter').replace('{n}', trackedItems.length)}
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes tlBreathe {
          0%, 100% { opacity: 0.78; }
          50%      { opacity: 1; }
        }
        .tl-poly-breathe {
          animation: tlBreathe 3.4s ease-in-out infinite;
          transform-origin: center;
        }
        /* Pause the per-polygon breathing animation when the section is
           scrolled out of view — keeps 51 simultaneous animations from
           burning paint cycles off-screen. */
        .tl-paused .tl-poly-breathe {
          animation-play-state: paused;
        }
        @media (max-width: 900px) {
          .tracking-section { padding: 64px 20px 80px !important; }
          .tracking-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .tracking-picker {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: 'rgba(10,10,10,0.45)',
        marginBottom: 3,
      }}>{label}</div>
      <div style={{ color: '#0a0a0a', fontSize: 13 }}>{value}</div>
    </div>
  );
}

function TipLine({ label, value, color }) {
  return (
    <div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9.5,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
        marginBottom: 2,
      }}>{label}</div>
      <div style={{ color: color || '#fff', fontSize: 12 }}>{value}</div>
    </div>
  );
}

window.TrackingLookup = TrackingLookup;
