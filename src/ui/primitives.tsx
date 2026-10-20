import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.2 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Item({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.div variants={rise} className={className} style={style}>
      {children}
    </motion.div>
  );
}

/** Glass card with lab-instrument corner brackets. */
export function Card({ children, accent, className = '', style }: { children: ReactNode; accent?: string; className?: string; style?: CSSProperties }) {
  return (
    <motion.div variants={rise} className={`card ${className}`} style={{ ...(accent ? ({ '--c': accent } as CSSProperties) : {}), ...style }}>
      <span className="corner tl" />
      <span className="corner br" />
      {children}
    </motion.div>
  );
}

/** Splits "*highlighted*" segments out of a title string. */
export function parseEmphasis(text: string) {
  return text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((t) => (t.startsWith('*') && t.endsWith('*') ? { t: t.slice(1, -1), hl: true } : { t, hl: false }));
}

export const plain = (text: string) => text.replace(/\*/g, '');

const GLYPHS = 'ATGC';

/** Text that "sequences" itself: letters cycle through A/T/G/C before resolving left to right. */
export function Decode({ text, duration = 950, delay = 250 }: { text: string; duration?: number; delay?: number }) {
  const segs = useMemo(() => parseEmphasis(text), [text]);
  const total = useMemo(() => segs.reduce((n, s) => n + s.t.length, 0), [segs]);
  const [state, setState] = useState({ done: 0, tick: 0 });

  useEffect(() => {
    if (reducedMotion()) {
      setState({ done: total, tick: 0 });
      return;
    }
    setState({ done: 0, tick: 0 });
    let raf = 0;
    let start = 0;
    const loop = (now: number) => {
      if (!start) start = now;
      const p = Math.max(0, Math.min(1, (now - start - delay) / duration));
      setState((s) => ({ done: Math.floor(p * total), tick: s.tick + 1 }));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [text, total, duration, delay]);

  let k = 0;
  const scrambled = segs.map((s, si) => (
    <span key={si} className={s.hl ? 'hl' : undefined}>
      {Array.from(s.t, (ch) => {
        const i = k++;
        if (i < state.done || ch === ' ' || !/[A-Za-z0-9$]/.test(ch)) return ch;
        return GLYPHS[(i * 7 + (state.tick >> 1)) % 4];
      }).join('')}
    </span>
  ));

  return (
    <span className="decode" aria-label={plain(text)}>
      <span className="decode-ghost" aria-hidden>
        {segs.map((s, si) => (
          <span key={si} className={s.hl ? 'hl' : undefined}>
            {s.t}
          </span>
        ))}
      </span>
      <span className="decode-live" aria-hidden>
        {scrambled}
      </span>
    </span>
  );
}

/** Renders text with *emphasis* without the decode animation. */
export function Em({ text }: { text: string }) {
  return (
    <>
      {parseEmphasis(text).map((s, i) =>
        s.hl ? (
          <span key={i} className="hl">
            {s.t}
          </span>
        ) : (
          <span key={i}>{s.t}</span>
        ),
      )}
    </>
  );
}

/** Counts up the first number inside a string like "$305M", "≈$20" or "6.9M". */
export function CountUp({ value, duration = 1500, delay = 350 }: { value: string; duration?: number; delay?: number }) {
  const m = value.match(/^(.*?)(\d[\d,.]*)(.*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : 0;
  const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;
  const hasNum = m !== null;
  const [v, setV] = useState(reducedMotion() ? target : 0);

  useEffect(() => {
    if (!hasNum || reducedMotion()) return;
    let raf = 0;
    let start = 0;
    const loop = (now: number) => {
      if (!start) start = now;
      const p = Math.max(0, Math.min(1, (now - start - delay) / duration));
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hasNum, target, duration, delay]);

  if (!m) return <>{value}</>;
  const num = v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span className="tabular">
      {m[1]}
      {num}
      {m[3]}
    </span>
  );
}

export function Stat({ value, label, color, big }: { value: string; label: string; color?: string; big?: boolean }) {
  return (
    <Card accent={color} className={`stat ${big ? 'stat-big' : ''}`}>
      <div className="stat-value">
        <CountUp value={value} />
      </div>
      <div className="stat-label">{label}</div>
    </Card>
  );
}
