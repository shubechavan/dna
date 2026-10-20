import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Maximize, MonitorPlay, StickyNote } from 'lucide-react';
import { CONTENT } from '../content';
import { DECK, SPEAKER_COLOR, type Speaker } from '../config';
import { BASE_COLOR, SLIDES, type SlideDef } from '../slides';
import { useDeck } from '../store';
import { Item, plain } from './primitives';
import { fmt, hashFor, notesFor, openPresenter, pad, toggleFullscreen, useDeckKeys, useNarrow, useNow } from './helpers';

const css = (v: Record<string, string>) => v as CSSProperties;

const slideVariants: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.075, delayChildren: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M9 3c0 7 14 7 14 13S9 22 9 29" stroke="#2ff3c4" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M23 3c0 7-14 7-14 13s14 6 14 13" stroke="#ffb547" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M11 7h10M12.5 12h7M12.5 20h7M11 25h10" stroke="#8d7bff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TimerPill() {
  const startedAt = useDeck((s) => s.startedAt);
  const now = useNow(500);
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const over = elapsed > DECK.totalSeconds;
  return (
    <div className={`timer-pill ${over ? 'over' : ''}`}>
      {startedAt ? fmt(elapsed) : '00:00'} <span>/ {fmt(DECK.totalSeconds)}</span>
    </div>
  );
}

function TopBar({ slide, index, showTimer }: { slide: SlideDef; index: number; showTimer: boolean }) {
  const p = DECK.presenters[slide.speaker];
  return (
    <header className="topbar">
      <div className="brand">
        <Logo />
        <span className="brand-name">{DECK.brand}</span>
        <span className="brand-sub">Who owns your DNA?</span>
      </div>
      <div className="top-right">
        {showTimer && <TimerPill />}
        <div className="speaker-chip" style={css({ '--c': SPEAKER_COLOR[slide.speaker] })}>
          <span className="avatar sm">{p.badge}</span>
          <span>{p.name}</span>
        </div>
        <div className="block-id">
          <span>
            BLOCK {pad(index + 1)}/{pad(SLIDES.length)}
          </span>
          <span className="hash">{hashFor(index)}</span>
        </div>
      </div>
    </header>
  );
}

function BottomBar({ index, onNotes }: { index: number; onNotes: () => void }) {
  const { go, next, prev } = useDeck.getState();
  return (
    <footer className="bottombar">
      <div className="keys">
        <kbd>←</kbd>
        <kbd>→</kbd> navigate · <kbd>N</kbd> notes · <kbd>P</kbd> presenter · <kbd>F</kbd> fullscreen
      </div>
      <nav className="codons" aria-label="Slides">
        <span className="prime">5′</span>
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`codon ${i === index ? 'is-current' : ''} ${i < index ? 'is-past' : ''}`}
            style={css({ '--c': BASE_COLOR[s.base] })}
            onClick={() => go(i)}
            title={`${i + 1}. ${plain(s.title)}`}
            data-mark={i === 1 ? 'START' : i === SLIDES.length - 2 ? 'STOP' : undefined}
          >
            {s.base}
          </button>
        ))}
        <span className="prime">3′</span>
      </nav>
      <div className="nav-btns">
        <button className="icon-btn" onClick={onNotes} title="Speaker notes (N)">
          <StickyNote size={17} />
        </button>
        <button className="icon-btn" onClick={openPresenter} title="Presenter view (P)">
          <MonitorPlay size={17} />
        </button>
        <button className="icon-btn" onClick={toggleFullscreen} title="Fullscreen (F)">
          <Maximize size={17} />
        </button>
        <button className="icon-btn" onClick={prev} title="Previous (←)">
          <ChevronLeft size={19} />
        </button>
        <button className="icon-btn primary" onClick={next} title="Next (→)">
          <ChevronRight size={19} />
        </button>
      </div>
    </footer>
  );
}

function Handover({ index }: { index: number }) {
  const [toast, setToast] = useState<Speaker | null>(null);
  const last = useRef<Speaker>(SLIDES[index].speaker);

  useEffect(() => {
    const s = SLIDES[index].speaker;
    if (s !== last.current) {
      last.current = s;
      setToast(s);
    }
  }, [index]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="handover"
          style={css({ '--c': SPEAKER_COLOR[toast] })}
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="handover-label">Handover</span>
          <ArrowRight size={16} />
          <span className="avatar sm">{DECK.presenters[toast].badge}</span>
          <strong>{DECK.presenters[toast].name}</strong>
          <span className="handover-part">{DECK.presenters[toast].part}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NotesPanel({ slide }: { slide: SlideDef }) {
  const p = DECK.presenters[slide.speaker];
  return (
    <motion.div className="notes-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <div className="notes-meta" style={css({ '--c': SPEAKER_COLOR[slide.speaker] })}>
        <span className="avatar sm">{p.badge}</span>
        {p.name} · target {slide.seconds}s
      </div>
      <p>{notesFor(slide)}</p>
    </motion.div>
  );
}

export default function Overlay() {
  const index = useDeck((s) => s.index);
  const slide = SLIDES[index];
  const [showNotes, setShowNotes] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  useDeckKeys({ notes: () => setShowNotes((v) => !v), timer: () => setShowTimer((v) => !v), presenter: openPresenter });

  const narrow = useNarrow();
  const { Main, Aside } = CONTENT[slide.id];
  const floatingAside = Aside && !narrow;

  return (
    <div className={`overlay layout-${slide.layout ?? 'split'} ${floatingAside ? 'has-aside' : ''}`} style={css({ '--accent': slide.accent })}>
      <div className="gridfx" aria-hidden />
      <TopBar slide={slide} index={index} showTimer={showTimer} />

      <main className="stage">
        <AnimatePresence mode="wait">
          <motion.section key={slide.id} className="slide" variants={slideVariants} initial="hidden" animate="show" exit="exit">
            <Main slide={slide} />
            {Aside && narrow && (
              <Item>
                <Aside />
              </Item>
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      <AnimatePresence mode="wait">
        {floatingAside && (
          <motion.aside
            key={`${slide.id}-aside`}
            className="aside"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.3 } }}
          >
            <Aside />
          </motion.aside>
        )}
      </AnimatePresence>

      <BottomBar index={index} onNotes={() => setShowNotes((v) => !v)} />
      <Handover index={index} />
      <AnimatePresence>{showNotes && <NotesPanel key="notes" slide={slide} />}</AnimatePresence>
    </div>
  );
}
