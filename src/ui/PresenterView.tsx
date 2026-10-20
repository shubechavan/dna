import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Zap } from 'lucide-react';
import { DECK, SPEAKER_COLOR } from '../config';
import { SLIDES } from '../slides';
import { triggerDemo, useDeck } from '../store';
import { plain } from './primitives';
import { Logo } from './Overlay';
import { fmt, notesFor, plannedStart, useDeckKeys, useNow } from './helpers';

const css = (v: Record<string, string>) => v as CSSProperties;

/** Opened with P from the main window (or ?presenter). Stays in sync via BroadcastChannel. */
export default function PresenterView() {
  const { index, startedAt, go, next, prev, startTimer, resetTimer } = useDeck();
  useDeckKeys({});
  const now = useNow(250);

  const slide = SLIDES[index];
  const upcoming = SLIDES[index + 1];
  const p = DECK.presenters[slide.speaker];
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const planned = plannedStart(index);
  const slideTimeLeft = planned + slide.seconds - elapsed;
  // Positive = behind schedule.
  const drift = startedAt ? elapsed - planned : 0;
  const total = DECK.totalSeconds;

  return (
    <div className="presenter-view" style={css({ '--c': SPEAKER_COLOR[slide.speaker] })}>
      <header className="pv-top">
        <div className="brand">
          <Logo />
          <span className="brand-name">Presenter view</span>
        </div>
        <div className="pv-clocks">
          <div className={`pv-clock ${elapsed > total ? 'bad' : ''}`}>
            <small>Elapsed</small>
            <b>{fmt(elapsed)}</b>
            <span>/ {fmt(total)}</span>
          </div>
          <div className={`pv-clock ${startedAt && slideTimeLeft < 0 ? 'bad' : ''}`}>
            <small>This slide</small>
            <b>{startedAt ? (slideTimeLeft < 0 ? '+' : '') + fmt(slideTimeLeft) : fmt(slide.seconds)}</b>
            <span>target {slide.seconds}s</span>
          </div>
          <div className={`pv-clock ${drift > 10 ? 'bad' : drift < -10 ? 'good' : ''}`}>
            <small>Pace</small>
            <b>{!startedAt ? 'n/a' : Math.abs(drift) < 5 ? 'On time' : `${fmt(drift)} ${drift > 0 ? 'behind' : 'ahead'}`}</b>
            <span>vs plan</span>
          </div>
          <div className="pv-timer-btns">
            <button className="btn btn-ok" onClick={startTimer}>
              <Play size={15} /> {startedAt ? 'Restart' : 'Start'}
            </button>
            <button className="btn btn-ghost" onClick={resetTimer}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>
      </header>

      <div className="pv-body">
        <section className="pv-main">
          <div className="pv-now">
            <span className="pv-num">
              {index + 1}/{SLIDES.length}
            </span>
            <span className="avatar">{p.badge}</span>
            <span className="pv-who">{p.name}</span>
          </div>
          <h1 className="pv-title">{plain(slide.title)}</h1>
          <p className="pv-notes">{notesFor(slide)}</p>
          {slide.id === 'contract' && (
            <button className="btn btn-ok pv-demo" onClick={triggerDemo}>
              <Zap size={16} /> Run demo on main screen (D)
            </button>
          )}
        </section>

        <aside className="pv-side">
          <div className="pv-next">
            <small>Up next</small>
            {upcoming ? (
              <>
                <strong>{plain(upcoming.title)}</strong>
                {upcoming.speaker !== slide.speaker && (
                  <span className="pv-handover" style={css({ '--c': SPEAKER_COLOR[upcoming.speaker] })}>
                    Handover → {DECK.presenters[upcoming.speaker].name}
                  </span>
                )}
              </>
            ) : (
              <strong>End of deck</strong>
            )}
          </div>
          <ol className="pv-list">
            {SLIDES.map((s, i) => (
              <li key={s.id}>
                <button className={i === index ? 'on' : i < index ? 'done' : ''} onClick={() => go(i)} style={css({ '--c': SPEAKER_COLOR[s.speaker] })}>
                  <i />
                  <span>
                    {i + 1}. {plain(s.title)}
                  </span>
                  <em>{s.seconds ? `${s.seconds}s` : '·'}</em>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <footer className="pv-foot">
        <button className="btn btn-ghost" onClick={prev}>
          <ChevronLeft size={18} /> Prev
        </button>
        <span className="pv-hint">Arrow keys / clicker work in this window too · Timer auto-starts when you leave the title slide</span>
        <button className="btn btn-ok" onClick={next}>
          Next <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}
