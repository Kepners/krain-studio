// Reusable striped/labeled placeholders for architectural imagery.
// Never invents drawings — always labeled with what should sit there.

function StripedPlaceholder({
  label = 'project shot',
  sublabel,
  ratio,            // e.g. '4/5'
  height,           // explicit height
  bg = '#e8e4dc',
  fg = 'rgba(40,32,20,.55)',
  stripe = 'rgba(40,32,20,.045)',
  rounded = 0,
  mono = true,
  align = 'center',
  style = {},
}) {
  const styleObj = {
    width: '100%',
    aspectRatio: ratio,
    height,
    background: `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe} 14px 15px)`,
    color: fg,
    borderRadius: rounded,
    display: 'flex',
    alignItems: align === 'top' ? 'flex-start' : align === 'bottom' ? 'flex-end' : 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
    fontFamily: mono ? 'Geist Mono, JetBrains Mono, monospace' : 'inherit',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: 16,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };
  return (
    <div style={styleObj}>
      <div style={{ opacity: 0.85 }}>[ {label} ]</div>
      {sublabel && <div style={{ opacity: 0.55, fontSize: 9 }}>{sublabel}</div>}
    </div>
  );
}

// "Technical drawing" placeholder — slightly different visual language
// (graph-paper grid + corner ticks) to distinguish it from a photo plate.
function DrawingPlate({
  label = 'drawing',
  caption,
  bg = '#f3f0e8',
  ink = 'rgba(20,20,20,.55)',
  height,
  ratio,
  style = {},
}) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: ratio,
      height,
      background: bg,
      backgroundImage: `
        linear-gradient(${ink.replace('.55', '.06')} 1px, transparent 1px),
        linear-gradient(90deg, ${ink.replace('.55', '.06')} 1px, transparent 1px)
      `,
      backgroundSize: '22px 22px',
      color: ink,
      fontFamily: 'Geist Mono, JetBrains Mono, monospace',
      fontSize: 10,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      ...style,
    }}>
      {/* corner ticks */}
      {[
        { top: 8, left: 8 },
        { top: 8, right: 8 },
        { bottom: 8, left: 8 },
        { bottom: 8, right: 8 },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', width: 10, height: 10, ...p }}>
          <div style={{ position: 'absolute', inset: 0, borderTop: `1px solid ${ink}`, borderLeft: `1px solid ${ink}`, transform: i === 1 ? 'rotate(90deg)' : i === 2 ? 'rotate(-90deg)' : i === 3 ? 'rotate(180deg)' : 'none' }} />
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: 10, left: 14, opacity: .8 }}>[ {label} ]</div>
      {caption && <div style={{ position: 'absolute', bottom: 10, right: 14, opacity: .55 }}>{caption}</div>}
    </div>
  );
}

Object.assign(window, { StripedPlaceholder, DrawingPlate });
