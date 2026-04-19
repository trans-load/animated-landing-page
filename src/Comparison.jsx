// "What changes with Transload" — past vs. now comparison section.
// Dark-aesthetic match: cards on the site background, orange accent for "Now".

function Comparison({ accent = '#f97315' }) {
  const mono = '"JetBrains Mono", monospace';
  const sans = '"Inter", system-ui, -apple-system, sans-serif';

  const pastRows = [
    'Dimension only a sample',
    'Forklift detours to dimensioner station',
    'Drivers waiting at the dimensioner',
  ];
  const nowRows = [
    'Dimension every item',
    'Measure everywhere on the terminal',
    'Runs fully in the background — no extra steps',
  ];

  return (
    <section
      style={{
        padding: '120px 40px 140px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Eyebrow + heading */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: accent,
              marginBottom: 16,
            }}
          >
            What changes with Transload
          </div>
          <h2
            style={{
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 'clamp(32px, 4vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: -1,
              margin: 0,
              color: '#fff',
            }}
          >
            From sampling to full coverage.
          </h2>
        </div>

        {/* Two columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
          }}
        >
          <Column
            label="The past"
            sublabel="Slow and manual"
            labelColor="rgba(255,255,255,0.95)"
            borderColor="rgba(255,255,255,0.08)"
            img="assets/past-dimensioner.png"
            rows={pastRows}
            rowIconColor="rgba(255,255,255,0.35)"
            rowIcon={<CrossIcon />}
            imageTint="grayscale(15%)"
          />
          <Column
            label="Now"
            sublabel="Fast and automatic"
            labelColor={accent}
            borderColor={accent}
            img="assets/now-highlighted.png"
            rows={nowRows}
            rowIconColor={accent}
            rowIcon={<CheckIcon color={accent} />}
            glow
          />
        </div>
      </div>
    </section>
  );
}

function Column({
  label,
  sublabel,
  labelColor,
  borderColor,
  img,
  rows,
  rowIcon,
  rowIconColor,
  glow = false,
  imageTint = 'none',
}) {
  const mono = '"JetBrains Mono", monospace';
  const sans = '"Inter", system-ui, -apple-system, sans-serif';
  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            color: labelColor,
            marginBottom: 4,
            letterSpacing: -0.2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {sublabel}
        </div>
      </div>

      {/* Image card */}
      <div
        style={{
          position: 'relative',
          borderRadius: 18,
          overflow: 'hidden',
          border: `1.5px solid ${borderColor}`,
          boxShadow: glow
            ? `0 0 0 1px ${borderColor}22, 0 20px 60px rgba(249, 115, 21, 0.18)`
            : '0 20px 60px rgba(0,0,0,0.35)',
          aspectRatio: '16 / 9',
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
            filter: imageTint,
          }}
        />
      </div>

      {/* Row list */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              borderRadius: 12,
              background: glow ? 'rgba(249, 115, 21, 0.06)' : 'rgba(255,255,255,0.03)',
              border: glow
                ? `1px solid rgba(249, 115, 21, 0.22)`
                : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: glow ? 'rgba(249, 115, 21, 0.15)' : 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: rowIconColor,
              }}
            >
              {rowIcon}
            </div>
            <span
              style={{
                fontFamily: sans,
                fontSize: 15,
                fontWeight: 450,
                color: 'rgba(255,255,255,0.88)',
                letterSpacing: -0.1,
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

function CheckIcon({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6.2 L5 8.5 L9.5 3.5" stroke={color || 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

window.Comparison = Comparison;
