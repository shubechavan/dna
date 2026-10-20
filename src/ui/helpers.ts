import { useEffect, useRef, useState } from 'react';
import { DECK } from '../config';
import { SLIDES, type SlideDef } from '../slides';
import { triggerDemo, useDeck } from '../store';

export const pad = (n: number) => String(n).padStart(2, '0');

export function fmt(totalSeconds: number) {
  const s = Math.max(0, Math.floor(Math.abs(totalSeconds)));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

export function notesFor(slide: SlideDef) {
  return slide.notes.replace(/\{A\}/g, DECK.presenters.A.name).replace(/\{B\}/g, DECK.presenters.B.name);
}

/** Planned elapsed time at the start of slide i. */
export function plannedStart(i: number) {
  return SLIDES.slice(0, i).reduce((n, s) => n + s.seconds, 0);
}

export const NARROW_QUERY = '(max-width: 900px), (max-aspect-ratio: 11/10)';

/** Matches the CSS breakpoint where the deck switches to a stacked, single-column layout. */
export function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

/** Re-renders every `ms` and returns Date.now(). */
export function useNow(ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
}

/** Fake but stable block hash for each slide, purely decorative. */
export function hashFor(i: number) {
  let h = 2166136261 ^ (i * 0x9e3779b1);
  const out: string[] = [];
  for (let k = 0; k < 10; k++) {
    h = Math.imul(h ^ (h >>> 13), 16777619);
    out.push(((h >>> 0) % 16).toString(16));
  }
  return `0x${out.slice(0, 6).join('')}…${out.slice(6).join('')}`;
}

export function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

export function openPresenter() {
  window.open(`${window.location.pathname}?presenter`, 'dna-presenter', 'width=1180,height=780');
}

interface KeyHandlers {
  notes?: () => void;
  timer?: () => void;
  presenter?: () => void;
}

export function useDeckKeys(handlers: KeyHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      const onControl = tag === 'BUTTON' || tag === 'A' || tag === 'INPUT';
      const { next, prev, go } = useDeck.getState();
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          next();
          e.preventDefault();
          break;
        case ' ':
        case 'Enter':
          if (onControl) return;
          next();
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          prev();
          e.preventDefault();
          break;
        case 'Home':
          go(0);
          break;
        case 'End':
          go(SLIDES.length - 1);
          break;
        case 'n':
        case 'N':
          ref.current.notes?.();
          break;
        case 't':
        case 'T':
          ref.current.timer?.();
          break;
        case 'p':
        case 'P':
          ref.current.presenter?.();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'd':
        case 'D':
          triggerDemo();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
