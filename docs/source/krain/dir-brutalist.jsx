// Direction B — Signal (interactive)
// Cursor-follow glow, parallax slash, magnetic CTA, hover plate-tilts,
// counter animations, animated underline. Cream + midnight + neon coral.

// Light cream theme — page background uses the warm bone tone from the logo render.
// "ink" is the foreground text color (deep), "bg" is what was previously the dark
// navy page background — now swapped to cream. We keep the same key names so the
// rest of the file's c.bg / c.ink references work without editing every line.
const KRAIN_PALETTE = {
  bg: '#1a1d33',                              // foreground text (was page bg)
  bgSoft: '#2a2e44',                          // slightly lighter ink for accents
  ink: '#ece7dd',                             // PAGE BG — the cream/bone from logo render
  inkSoft: 'rgba(26,29,51,0.62)',             // muted text on cream
  rule: 'rgba(26,29,51,0.16)',
  accent: '#ff4d6e', accentSoft: 'rgba(255,77,110,0.18)',
  plate: '#dfd9ca',                           // drawing plate slightly darker than page
};
window.KRAIN_PALETTE = KRAIN_PALETTE;

// ── Hooks ─────────────────────────────────────────────
function useMouse() {
  const [m, setM] = React.useState({ x: 0.5, y: 0.5, raw: { x: 0, y: 0 } });
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      setM({ x, y, raw: { x: e.clientX - r.left, y: e.clientY - r.top } });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);
  return [ref, m];
}

function useScroll() {
  const [y, setY] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

function useInView(threshold = 0.05) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el || seen) return;
    // If already in viewport on mount, fire immediately on next frame.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => setSeen(true));
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

function useCounter(target, start, ms = 1500) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!start) return;
    let raf, t0;
    const num = parseFloat(String(target).replace(/[^\d.]/g, '')) || 0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(num * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, ms]);
  return v;
}

// ── Animated link with coral underline ──
function AnimLink({ children, href = '#', style = {}, color }) {
  const [hover, setHover] = React.useState(false);
  const c = window.KRAIN_PALETTE;
  return (
    <a href={href}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', textDecoration: 'none', color: color || 'inherit', ...style }}>
      {children}
      <span style={{
        position: 'absolute', left: 0, bottom: -3, height: 1,
        width: hover ? '100%' : '0%', background: c.accent,
        boxShadow: hover ? `0 0 8px ${c.accent}` : 'none',
        transition: 'width .42s cubic-bezier(.2,.7,.2,1)',
      }} />
    </a>
  );
}

// ── Magnetic button ──
function MagneticBtn({ children, href = '#', primary = false, style = {} }) {
  const c = window.KRAIN_PALETTE;
  const ref = React.useRef(null);
  const [t, setT] = React.useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    setT({ x: x * 0.25, y: y * 0.25 });
  };
  const onLeave = () => setT({ x: 0, y: 0 });
  return (
    <a ref={ref} href={href} onMouseMove={onMove} onMouseLeave={onLeave} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: primary ? '18px 30px' : '14px 22px',
      background: primary ? c.accent : 'transparent',
      color: primary ? c.ink : 'inherit',
      border: primary ? 'none' : `1px solid currentColor`,
      borderRadius: 999, fontSize: 14, letterSpacing: '0.02em', fontWeight: 500,
      textDecoration: 'none',
      transform: `translate(${t.x}px,${t.y}px)`,
      transition: 'transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .25s',
      boxShadow: primary && (t.x || t.y) ? `0 14px 40px ${c.accent}66, 0 0 0 6px ${c.accent}22` : 'none',
      ...style,
    }}>
      {children}
    </a>
  );
}

// ── Plate that tilts toward cursor ──
function TiltPlate({ children, max = 6, style = {} }) {
  const ref = React.useRef(null);
  const [t, setT] = React.useState({ x: 0, y: 0, s: 1 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setT({ x: -y * max, y: x * max, s: 1.015 });
  };
  const onLeave = () => setT({ x: 0, y: 0, s: 1 });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{
      transform: `perspective(1200px) rotateX(${t.x}deg) rotateY(${t.y}deg) scale(${t.s})`,
      transition: 'transform .35s cubic-bezier(.2,.7,.2,1)',
      transformStyle: 'preserve-3d',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Project card with reveal + cursor "View" follower ──
function ProjectCard({ p, featured = false }) {
  const c = window.KRAIN_PALETTE;
  const ref = React.useRef(null);
  const [hover, setHover] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <a ref={ref} href="#"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onMouseMove={onMove}
      style={{
        display: 'block', textDecoration: 'none', color: c.bg, position: 'relative',
        gridRow: featured ? 'span 2' : 'auto',
      }}>
      <div style={{
        position: 'relative', borderRadius: 6, overflow: 'hidden',
        cursor: 'none',
      }}>
        <div style={{
          transition: 'transform .9s cubic-bezier(.2,.7,.2,1), filter .5s',
          transform: hover ? 'scale(1.04)' : 'scale(1)',
          filter: hover ? 'brightness(1.05)' : 'brightness(1)',
        }}>
          <DrawingPlate
            label={p.plate}
            caption={p.sheet}
            ratio={featured ? undefined : '4/3'}
            height={featured ? 580 : undefined}
            bg={c.bgSoft} ink="rgba(21,24,43,.5)"
          />
        </div>

        {featured && (
          <div style={{
            position: 'absolute', top: 16, left: 16, background: c.accent, color: c.ink,
            padding: '6px 12px', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            fontWeight: 600, borderRadius: 999,
            boxShadow: hover ? `0 0 30px ${c.accent}` : 'none', transition: 'box-shadow .35s',
          }}>Featured</div>
        )}

        {/* cursor follower */}
        <div style={{
          position: 'absolute', left: pos.x, top: pos.y,
          transform: `translate(-50%,-50%) scale(${hover ? 1 : 0})`,
          width: 86, height: 86, borderRadius: '50%',
          background: c.accent, color: c.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600,
          transition: 'transform .25s cubic-bezier(.2,.7,.2,1)',
          boxShadow: `0 12px 40px ${c.accent}88`,
          pointerEvents: 'none',
        }}>VIEW →</div>

        {/* coral sweep on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(120deg, transparent 30%, ${c.accent}22 50%, transparent 70%)`,
          transform: hover ? 'translateX(0%)' : 'translateX(-100%)',
          transition: 'transform .8s cubic-bezier(.2,.7,.2,1)',
          pointerEvents: 'none',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18 }}>
        <div style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: featured ? 34 : 22,
          fontWeight: 300, letterSpacing: '-0.02em',
          transform: hover ? 'translateX(8px)' : 'translateX(0)',
          transition: 'transform .35s cubic-bezier(.2,.7,.2,1)',
        }}>{p.name}</div>
        <div style={{ fontSize: 12, opacity: .55, letterSpacing: '0.1em' }}>{p.y} · {p.loc.toUpperCase()}</div>
      </div>
      <div style={{ fontSize: 13, opacity: .65, marginTop: 4 }}>{p.sub}</div>
    </a>
  );
}

// ── Stat counter ──
function Stat({ n, l, decimals = 0 }) {
  const c = window.KRAIN_PALETTE;
  const [ref, seen] = useInView();
  const v = useCounter(n, seen);
  const formatted = typeof n === 'string' && /^[A-Z]/.test(n)
    ? (seen ? n : '\u00A0')
    : v.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return (
    <div ref={ref} style={{ padding: '0 32px', borderRight: `1px solid ${c.rule}` }}>
      <div style={{
        fontFamily: 'Geist, sans-serif', fontWeight: 200,
        fontSize: 64, letterSpacing: '-0.04em', lineHeight: 1,
      }}>{formatted}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: .55, marginTop: 10 }}>{l}</div>
    </div>
  );
}

// ── Main ──
function KrainSignal() {
  const c = KRAIN_PALETTE;
  const [pageRef, mouse] = useMouse();
  const scrollY = useScroll();

  // hero parallax — slash drifts with cursor + scroll
  const slashX = (mouse.x - 0.5) * 40;
  const slashY = (mouse.y - 0.5) * 40 - scrollY * 0.15;
  const glowX = (mouse.x - 0.5) * 80;
  const glowY = (mouse.y - 0.5) * 60 - scrollY * 0.12;

  const projects = [
    { n: '01', name: 'Holloway Mews', y: '2025', loc: 'London N7', plate: 'section 1:50 · holloway mews', sheet: 'A-300', sub: '4-bed terrace · CLT frame · brick rainscreen · 142 sheets' },
    { n: '02', name: 'Cobden Yard', y: '2025', loc: 'Margate', plate: 'site plan · cobden yard', sheet: 'P-002', sub: 'Mixed-use · 208 sheets' },
    { n: '03', name: 'Bartle Lane', y: '2024', loc: 'Bradford', plate: 'elevation · bartle lane', sheet: 'A-201', sub: 'Residential ×3 · 96 sheets' },
    { n: '04', name: 'Quarry House', y: '2024', loc: 'Hebden Bridge', plate: 'plan · quarry house', sheet: 'A-101', sub: 'New-build · 178 sheets' },
    { n: '05', name: 'Pelham Workshop', y: '2024', loc: 'Brighton', plate: 'roof junction · pelham', sheet: 'D-403', sub: 'Retrofit · 64 sheets' },
  ];

  return (
    <div ref={pageRef} style={{
      background: c.ink, color: c.bg,
      fontFamily: 'Geist, -apple-system, system-ui, sans-serif',
      fontSize: 14, lineHeight: 1.5, position: 'relative', overflow: 'hidden', minHeight: '100vh',
    }}>
      {/* ── ambient bg glow that follows mouse ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(600px at ${mouse.x * 100}% ${mouse.y * 100}%, ${c.accent}1f, transparent 60%)`,
        transition: 'background .2s linear',
      }} />

      {/* ── TICKER ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '12px 32px', display: 'flex', justifyContent: 'space-between',
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        borderBottom: `1px solid ${c.rule}`, color: c.inkSoft,
      }}>
        <span><span style={{ color: c.accent, animation: 'pulse 2s ease-in-out infinite' }}>● </span>Live · Holloway Mews · WK 17</span>
        <span style={{ display: 'flex', gap: 28 }}>
          <span>RIBA 4–5</span><span>NBS</span><span>SHF · LDN</span>
        </span>
      </div>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        backdropFilter: 'blur(12px)', background: 'rgba(236,231,221,.78)',
        padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${c.rule}`,
      }}>
        <img src="krain/logo.png" alt="Krain Studio" style={{ height: 34, width: 'auto', display: 'block' }} />
        <nav style={{ display: 'flex', gap: 32, fontSize: 13 }}>
          {['Work', 'Process', 'Services', 'Journal', 'About', 'Contact'].map(x => (
            <AnimLink key={x} href="#" style={{ color: c.bg, opacity: .85 }}>{x}</AnimLink>
          ))}
        </nav>
        <MagneticBtn primary>Start a brief →</MagneticBtn>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '120px 32px 140px', overflow: 'hidden' }}>
        {/* the slash */}
        <div style={{
          position: 'absolute', top: '12%', left: '40%', width: 6, height: 620,
          background: `linear-gradient(180deg, transparent, ${c.accent} 28%, ${c.accent} 72%, transparent)`,
          transform: `translate(${slashX}px, ${slashY}px) rotate(20deg)`,
          boxShadow: `0 0 60px ${c.accent}, 0 0 120px ${c.accent}88`,
          filter: 'blur(0.5px)',
          transition: 'transform .15s linear',
          zIndex: 2,
        }} />
        <div style={{
          position: 'absolute', top: '5%', left: '30%', width: 900, height: 900,
          background: `radial-gradient(ellipse at center, ${c.accent}33 0%, transparent 50%)`,
          transform: `translate(${glowX}px, ${glowY}px) rotate(20deg)`,
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: c.inkSoft, marginBottom: 36 }}>
              <FadeIn>Detailed construction design / 2018 →</FadeIn>
            </div>
            <h1 style={{
              fontFamily: 'Geist, sans-serif', fontWeight: 200,
              fontSize: 128, lineHeight: 0.92, letterSpacing: '-0.045em', margin: 0,
            }}>
              <FadeIn delay={0}>Drawn at <span style={{ color: c.accent, fontWeight: 300, position: 'relative' }}>1:5
                <span style={{
                  position: 'absolute', inset: 0, color: c.accent, filter: 'blur(20px)',
                  animation: 'flicker 3s infinite',
                }}>1:5</span>
              </span>.</FadeIn>
              <FadeIn delay={120}>Built without</FadeIn>
              <FadeIn delay={240}>surprises.</FadeIn>
            </h1>
            <FadeIn delay={420}>
              <p style={{ fontSize: 17, lineHeight: 1.55, opacity: .82, maxWidth: 520, marginTop: 56 }}>
                Krain is a small office that produces RIBA Stage 4–5 packages — the
                construction-stage drawings, details, and specs that turn a planning
                permission into a buildable thing.
              </p>
            </FadeIn>
          </div>

          {/* HERO IMAGE SLOT */}
          <FadeIn delay={300}>
            <TiltPlate max={4} style={{ width: '100%' }}>
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '4/3',
                borderRadius: 8, overflow: 'hidden',
                boxShadow: `0 30px 80px rgba(26,29,51,.18), 0 0 0 1px ${c.rule}`,
                background: `repeating-linear-gradient(135deg, ${c.plate} 0 18px, ${c.bg}11 18px 19px)`,
                color: c.inkSoft,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
                padding: 24, boxSizing: 'border-box',
                fontFamily: 'Geist Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 10, letterSpacing: '0.2em', opacity: .55 }}>[ HERO PHOTO · drop image of site / detail / drawing here ]</div>
                <div style={{ position: 'absolute', bottom: 16, left: 16 }}>16:12 · replace src</div>
                <div style={{ position: 'absolute', bottom: 16, right: 16, opacity: .55 }}>1600 × 1200</div>
                {/* corner ticks */}
                {[{top:14,left:14},{top:14,right:14},{bottom:14,left:14},{bottom:14,right:14}].map((p,i)=>(
                  <div key={i} style={{ position:'absolute', width:14, height:14, border:`1px solid ${c.bg}`, borderRight: i===1||i===3 ? `1px solid ${c.bg}` : 'none', borderBottom: i===2||i===3 ? `1px solid ${c.bg}`:'none', borderLeft: i===0||i===2 ? `1px solid ${c.bg}` : 'none', borderTop: i===0||i===1 ? `1px solid ${c.bg}` : 'none', opacity:.4, ...p }} />
                ))}
              </div>
            </TiltPlate>
          </FadeIn>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        position: 'relative', zIndex: 2,
        padding: '32px 0', borderTop: `1px solid ${c.rule}`, borderBottom: `1px solid ${c.rule}`,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
        <Stat n={17} l="Live + completed projects" />
        <Stat n={1184} l="Sheets issued · 2025" />
        <Stat n={0} l="RFIs unanswered today" />
        <Stat n="Q3 26" l="Next opening" />
      </section>

      {/* ── WORK ── */}
      <section style={{ position: 'relative', zIndex: 2, padding: '120px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 200, fontSize: 64, margin: 0, letterSpacing: '-0.04em' }}>Selected work</h2>
          <AnimLink color={c.accent} style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>All projects →</AnimLink>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '56px 24px' }}>
          <ProjectCard p={projects[0]} featured />
          <ProjectCard p={projects[1]} />
          <ProjectCard p={projects[2]} />
          <ProjectCard p={projects[3]} />
          <ProjectCard p={projects[4]} />
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section style={{ padding: '140px 32px', background: c.bg, color: c.ink, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -100, left: -100, width: 500, height: 500,
          background: `radial-gradient(circle, ${c.accent}33 0%, transparent 60%)`, filter: 'blur(60px)',
          transform: `translate(${(mouse.x - 0.5) * 30}px, ${(mouse.y - 0.5) * 30}px)`,
          transition: 'transform .4s ease-out',
        }} />
        <div style={{ position: 'relative', maxWidth: 1100 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: .55, marginBottom: 28 }}>On the practice</div>
          <FadeIn>
            <h2 style={{
              fontFamily: 'Geist, sans-serif', fontWeight: 200, fontSize: 96,
              lineHeight: 0.98, letterSpacing: '-0.04em', margin: 0,
            }}>
              A building is the sum of its <RevealWord>junctions.</RevealWord><br/>
              The rest is marketing.
            </h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 60 }}>
            {[
              'No mood boards, no renderings. Drawings that turn permission into a buildable thing without a clipboard of RFIs.',
              'Every detail is drawn at the scale a tradesperson actually needs. 1:5 at thresholds, 1:10 elsewhere.',
              'We work with architects who\u2019d rather be designing, contractors who want a clean set, clients who\u2019ve been quoted twice for the same job.',
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 100}>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, opacity: .8 }}>{p}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: '120px 32px' }}>
        <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 200, fontSize: 64, margin: '0 0 48px', letterSpacing: '-0.04em' }}>Services</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            ['A', 'Construction package', 'RIBA 4–5 · tender / building-control set'],
            ['B', '1:5 / 1:10 details', 'Junctions · thresholds · cills · eaves'],
            ['C', 'NBS specification', 'Clause-level · performance-written'],
            ['D', 'Building Control', 'Part L · Part B · Approved Inspector'],
            ['E', 'Site / RFI', 'Live queries · same-day response'],
            ['F', 'Peer review', 'Pre-tender check on another set'],
          ].map(([k, t, d], i) => (
            <ServiceCard key={k} k={k} t={t} d={d} i={i} />
          ))}
        </div>
      </section>

      {/* ── JOURNAL ── */}
      <section style={{ padding: '60px 32px 120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 200, fontSize: 64, margin: 0, letterSpacing: '-0.04em' }}>Journal</h2>
          <AnimLink color={c.accent} style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>All entries →</AnimLink>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {[
            ['Feb 2026', 'On drawing what cannot be photographed', 'Essay · 8 min'],
            ['Feb 2026', 'A short defence of the section', 'Note · 4 min'],
            ['Jan 2026', 'EPDM, in three positions', 'Detail study · 6 min'],
          ].map(([d, t, m], i) => (
            <JournalCard key={i} d={d} t={t} m={m} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '160px 32px', borderTop: `1px solid ${c.rule}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', bottom: -300, right: -100, width: 900, height: 900,
          background: `radial-gradient(circle, ${c.accent}55 0%, transparent 60%)`, filter: 'blur(60px)',
          transform: `translate(${(mouse.x - 0.5) * 60}px, ${(mouse.y - 0.5) * 40}px)`,
          transition: 'transform .4s ease-out',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: .55, marginBottom: 28 }}>Commissions — Q3 2026</div>
          <h2 style={{
            fontFamily: 'Geist, sans-serif', fontWeight: 200, fontSize: 120,
            lineHeight: 0.96, letterSpacing: '-0.045em', margin: 0,
          }}>
            Got a set of plans?
          </h2>
          <div style={{ marginTop: 56, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <MagneticBtn primary href="mailto:matt@krainstudio">matt@krainstudio →</MagneticBtn>
            <MagneticBtn href="#">Start a brief</MagneticBtn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '24px 32px', borderTop: `1px solid ${c.rule}`,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: .55,
      }}>
        <span>© Krain Studio · MMXXVI</span>
        <span>Sheffield / London</span>
      </footer>

      {/* keyframes + global cursor */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        @keyframes flicker { 0%,100% { opacity: .8 } 50% { opacity: .4 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}} />
    </div>
  );
}

function FadeIn({ children, delay = 0 }) {
  const [ref, seen] = useInView();
  return (
    <span ref={ref} style={{
      display: 'inline-block', width: '100%',
      opacity: seen ? 1 : 0,
      transform: seen ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity .9s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
    }}>{children}</span>
  );
}

function RevealWord({ children }) {
  const c = window.KRAIN_PALETTE;
  const [hover, setHover] = React.useState(false);
  return (
    <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      color: c.accent, position: 'relative', cursor: 'default',
      textShadow: hover ? `0 0 30px ${c.accent}` : `0 0 0px ${c.accent}`,
      transition: 'text-shadow .4s',
    }}>{children}</span>
  );
}

function ServiceCard({ k, t, d, i }) {
  const c = window.KRAIN_PALETTE;
  const [hover, setHover] = React.useState(false);
  return (
    <a href="#" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      padding: 24, borderRadius: 8, color: c.bg, textDecoration: 'none',
      background: hover ? 'rgba(255,77,110,0.08)' : 'rgba(26,29,51,0.04)',
      border: `1px solid ${hover ? c.accent + '88' : c.rule}`,
      minHeight: 200, display: 'flex', flexDirection: 'column',
      transform: hover ? 'translateY(-4px)' : 'translateY(0)',
      transition: 'transform .35s cubic-bezier(.2,.7,.2,1), background .35s, border-color .35s, box-shadow .35s',
      boxShadow: hover ? `0 24px 60px rgba(0,0,0,.3), 0 0 0 1px ${c.accent}33` : 'none',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontFamily: 'Geist, sans-serif', fontWeight: 200, fontSize: 56,
          letterSpacing: '-0.04em', lineHeight: 1, color: c.accent,
          transform: hover ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'transform .35s',
        }}>{k}</span>
        <span style={{ fontSize: 10, letterSpacing: '0.14em', opacity: .45 }}>0{i + 1}/06</span>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em',
          transform: hover ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform .35s',
        }}>{t}</div>
        <div style={{ fontSize: 13, opacity: .6, marginTop: 6 }}>{d}</div>
        <div style={{
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.accent,
          marginTop: 14, opacity: hover ? 1 : 0, transform: hover ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'opacity .35s, transform .35s',
        }}>Learn more →</div>
      </div>
    </a>
  );
}

function JournalCard({ d, t, m }) {
  const c = window.KRAIN_PALETTE;
  const [hover, setHover] = React.useState(false);
  return (
    <a href="#" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      display: 'block', textDecoration: 'none', color: c.bg,
      borderTop: `1px solid ${hover ? c.accent : c.rule}`,
      paddingTop: 24, position: 'relative',
      transition: 'border-color .35s',
    }}>
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: .55 }}>{d} · {m}</div>
      <div style={{
        fontFamily: 'Geist, sans-serif', fontSize: 26, lineHeight: 1.18, marginTop: 16,
        fontWeight: 300, letterSpacing: '-0.01em',
        transform: hover ? 'translateX(8px)' : 'translateX(0)',
        transition: 'transform .45s cubic-bezier(.2,.7,.2,1)',
      }}>{t}</div>
      <div style={{
        fontSize: 12, marginTop: 18, color: c.accent, letterSpacing: '0.1em', textTransform: 'uppercase',
        opacity: hover ? 1 : 0.7, transition: 'opacity .35s',
      }}>Read →</div>
    </a>
  );
}

window.KrainSignal = KrainSignal;
window.KrainBrutalist = KrainSignal;
