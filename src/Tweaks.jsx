// Tweaks panel
const { useState: useStateTw, useEffect: useEffectTw } = React;

function Tweaks({ values, onChange, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 100,
        width: 280,
        background: 'rgba(20, 20, 22, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14,
        padding: 16,
        color: '#fff',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.7 }}>
          Tweaks
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6, fontSize: 14, padding: 0 }}
        >×</button>
      </div>

      <Row label="Accent">
        <div style={{ display: 'flex', gap: 6 }}>
          {['#f97315', '#B5FF3B', '#7CF5FF', '#FFD24A', '#FFFFFF'].map((c) => (
            <button
              key={c}
              onClick={() => onChange({ accent: c })}
              style={{
                width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                background: c,
                border: values.accent === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </Row>

      <Row label={`Point size · ${values.pointSize.toFixed(1)}`}>
        <input
          type="range" min="0.5" max="4" step="0.1"
          value={values.pointSize}
          onChange={(e) => onChange({ pointSize: parseFloat(e.target.value) })}
          style={{ width: '100%' }}
        />
      </Row>

      <Row label="Background">
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'dark', bg: '#0a0a0a' },
            { id: 'mid', bg: '#1a1a1d' },
            { id: 'light', bg: '#e9e7e2' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => onChange({ bg: b.id })}
              style={{
                flex: 1, height: 28, borderRadius: 6, cursor: 'pointer',
                background: b.bg,
                border: values.bg === b.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </Row>

      <Row label="Transition">
        <select
          value={values.transition}
          onChange={(e) => onChange({ transition: e.target.value })}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: 6,
            background: 'rgba(255,255,255,0.06)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)', fontSize: 12,
          }}
        >
          <option value="crossfade">Crossfade</option>
          <option value="zoom">Camera push-in</option>
        </select>
      </Row>

      <Row label="Auto-rotate (after transition)">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={values.autoRotate}
            onChange={(e) => onChange({ autoRotate: e.target.checked })}
          />
          <span style={{ opacity: 0.8 }}>{values.autoRotate ? 'on' : 'off'}</span>
        </label>
      </Row>

      <Row label="Headline">
        <select
          value={values.headlineMode || 'static'}
          onChange={(e) => onChange({ headlineMode: e.target.value })}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: 6,
            background: '#1a1a1d', color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            fontFamily: 'inherit', fontSize: 12,
          }}
        >
          <option value="static">Static (always visible)</option>
          <option value="scroll">Scroll-reveal (below cloud)</option>
        </select>
      </Row>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ opacity: 0.7, marginBottom: 6, fontSize: 11 }}>{label}</div>
      {children}
    </div>
  );
}

window.Tweaks = Tweaks;
