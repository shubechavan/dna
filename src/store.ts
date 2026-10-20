import { create } from 'zustand';
import { SLIDES } from './slides';

interface DeckState {
  index: number;
  /** Epoch ms when the talk started; null until started. Shared between windows. */
  startedAt: number | null;
  go: (i: number) => void;
  next: () => void;
  prev: () => void;
  startTimer: () => void;
  resetTimer: () => void;
}

const clamp = (i: number) => Math.max(0, Math.min(SLIDES.length - 1, i));

export const IS_PRESENTER = new URLSearchParams(window.location.search).has('presenter');

function indexFromHash() {
  const n = parseInt(window.location.hash.replace('#', ''), 10);
  return Number.isFinite(n) ? clamp(n - 1) : 0;
}

export const useDeck = create<DeckState>((set, get) => ({
  index: IS_PRESENTER ? 0 : indexFromHash(),
  startedAt: null,
  go: (i) => {
    const index = clamp(i);
    if (index === get().index) return;
    const patch: Partial<DeckState> = { index };
    // Leaving the title slide auto-starts the clock, assuming the intro took its planned time.
    if (get().startedAt === null && get().index === 0 && index === 1) {
      patch.startedAt = Date.now() - SLIDES[0].seconds * 1000;
    }
    set(patch);
  },
  next: () => get().go(get().index + 1),
  prev: () => get().go(get().index - 1),
  startTimer: () => set({ startedAt: Date.now() }),
  resetTimer: () => set({ startedAt: null }),
}));

/* ── Sync between the audience window and the presenter window ── */

type Msg = { type: 'state'; index: number; startedAt: number | null } | { type: 'hello' } | { type: 'demo' };

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('dna-deck') : null;
let applyingRemote = false;

function broadcast() {
  const { index, startedAt } = useDeck.getState();
  channel?.postMessage({ type: 'state', index, startedAt } satisfies Msg);
}

if (channel) {
  channel.onmessage = (e: MessageEvent<Msg>) => {
    const m = e.data;
    if (m.type === 'hello') {
      if (!IS_PRESENTER) broadcast();
      return;
    }
    if (m.type === 'demo') {
      window.dispatchEvent(new Event('deck:demo'));
      return;
    }
    applyingRemote = true;
    useDeck.setState({ index: clamp(m.index), startedAt: m.startedAt });
    applyingRemote = false;
  };
  useDeck.subscribe((s, prev) => {
    if (applyingRemote) return;
    if (s.index !== prev.index || s.startedAt !== prev.startedAt) broadcast();
  });
  channel.postMessage({ type: 'hello' } satisfies Msg);
}

/** Runs the smart-contract demo in every open window (so the presenter view can trigger it). */
export function triggerDemo() {
  window.dispatchEvent(new Event('deck:demo'));
  channel?.postMessage({ type: 'demo' } satisfies Msg);
}

if (!IS_PRESENTER) {
  useDeck.subscribe((s, prev) => {
    if (s.index !== prev.index) window.history.replaceState(null, '', `#${s.index + 1}`);
  });
}
