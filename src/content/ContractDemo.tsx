import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Play, RotateCcw, ShieldOff, TriangleAlert, Wallet, X } from 'lucide-react';

type Phase = 'pending' | 'active' | 'revoked' | 'declined';

interface Entry {
  id: number;
  block: number;
  event: string;
  detail: string;
  color: string;
  hash: string;
}

const hex = (n: number) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const shortHash = () => `0x${hex(4)}…${hex(4)}`;
const FEE = 40;

/** A scripted, in-browser simulation of the consent contract (no real chain involved). */
export default function ContractDemo() {
  const [phase, setPhase] = useState<Phase>('pending');
  const [log, setLog] = useState<Entry[]>([]);
  const [balance, setBalance] = useState(0);
  const timers = useRef<number[]>([]);
  const block = useRef(21904331);
  const seq = useRef(0);
  const phaseRef = useRef<Phase>('pending');
  phaseRef.current = phase;

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const push = useCallback((event: string, detail: string, color: string) => {
    block.current += 1 + Math.floor(Math.random() * 3);
    const e = { id: seq.current++, block: block.current, event, detail, color, hash: shortHash() };
    setLog((l) => [e, ...l].slice(0, 5));
  }, []);

  const countBalance = useCallback((to: number) => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setBalance(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const approve = useCallback(() => {
    if (phaseRef.current !== 'pending') return;
    setPhase('active');
    push('Permission given', 'CardioGen · heart study · 90 days', '#2ff3c4');
    later(1000, () => push('Question answered', 'only a summary left your vault', '#45c8ff'));
    later(2000, () => {
      push('Payment sent', `${FEE} tokens → your wallet`, '#ffb547');
      countBalance(FEE);
    });
  }, [push, countBalance]);

  const decline = useCallback(() => {
    if (phaseRef.current !== 'pending') return;
    setPhase('declined');
    push('Request declined', 'nothing shared, nothing paid', '#ff4f6d');
  }, [push]);

  const revoke = useCallback(() => {
    if (phaseRef.current !== 'active') return;
    setPhase('revoked');
    push('Permission taken back', 'no new questions allowed', '#ff4f6d');
  }, [push]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase('pending');
    setLog([]);
    setBalance(0);
  }, []);

  const autoplay = useCallback(() => {
    reset();
    later(500, () => {
      phaseRef.current = 'pending';
      approve();
    });
    later(5200, () => {
      phaseRef.current = 'active';
      revoke();
    });
  }, [reset, approve, revoke]);

  useEffect(() => {
    const onDemo = () => autoplay();
    window.addEventListener('deck:demo', onDemo);
    return () => window.removeEventListener('deck:demo', onDemo);
  }, [autoplay]);

  const status = { pending: 'WAITING', active: 'ALLOWED', revoked: 'TAKEN BACK', declined: 'DECLINED' }[phase];

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="live-dot" /> LIVE DEMO
        <span className="demo-wallet">
          <Wallet size={14} /> Your wallet ·{' '}
          <b className="tabular">
            {balance} tokens
          </b>
        </span>
      </div>

      <div className={`request phase-${phase}`}>
        <div className="request-top">
          <span className="request-id">NEW REQUEST</span>
          <span className="request-status">{status}</span>
        </div>
        <div className="request-lab">CardioGen Research Lab</div>
        <dl className="request-terms">
          <dt>Why</dt>
          <dd>Heart-disease study</dd>
          <dt>They get</dt>
          <dd>One summary answer, never your full DNA</dd>
          <dt>They pay</dt>
          <dd>{FEE} tokens · access for 90 days</dd>
        </dl>
        <div className="request-actions">
          {phase === 'pending' && (
            <>
              <button className="btn btn-ok" onClick={approve}>
                <Check size={16} /> Approve
              </button>
              <button className="btn btn-ghost" onClick={decline}>
                <X size={16} /> Decline
              </button>
            </>
          )}
          {phase === 'active' && (
            <button className="btn btn-danger" onClick={revoke}>
              <ShieldOff size={16} /> Take back permission
            </button>
          )}
          {(phase === 'revoked' || phase === 'declined') && (
            <button className="btn btn-ghost" onClick={reset}>
              <RotateCcw size={16} /> Reset
            </button>
          )}
          <button className="btn btn-ghost btn-auto" onClick={autoplay} title="Auto-play (D)">
            <Play size={14} /> Auto <kbd>D</kbd>
          </button>
        </div>
      </div>

      <div className="ledger">
        <div className="ledger-title">Blockchain record · can’t be changed</div>
        {log.length === 0 && <div className="ledger-empty">Waiting for your decision…</div>}
        <AnimatePresence initial={false}>
          {log.map((e) => (
            <motion.div
              key={e.id}
              className="ledger-row"
              style={{ borderColor: e.color }}
              initial={{ opacity: 0, x: 24, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="lr-block">#{e.block.toLocaleString('en-US')}</span>
              <span className="lr-event" style={{ color: e.color }}>
                {e.event}
              </span>
              <span className="lr-detail">{e.detail}</span>
              <span className="lr-hash">{e.hash}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {phase === 'revoked' && (
          <motion.div className="warning" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TriangleAlert size={18} />
            <span>
              No new access, but <b>the lab keeps answers it already got</b>.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
