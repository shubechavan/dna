import type { CSSProperties } from 'react';
import {
  Activity,
  ArrowRight,
  Coins,
  Dna,
  FileCode2,
  FlaskConical,
  Fingerprint,
  InfinityIcon,
  Lock,
  Microscope,
  Pill,
  User,
  Users,
} from 'lucide-react';
import Head from './Head';
import { Card, CountUp, Decode, Em, Item, Stat } from '../ui/primitives';
import { DECK, SPEAKER_COLOR } from '../config';
import type { SlideDef } from '../slides';

type P = { slide: SlideDef };
const css = (v: Record<string, string>) => v as CSSProperties;

/* ── Title ─────────────────────────────────────────────── */
export function TitleMain({ slide }: P) {
  const { A, B } = DECK.presenters;
  return (
    <>
      <Item className="eyebrow">
        <span className="live-dot" />
        <span>
          {DECK.course} · {DECK.subject}
        </span>
      </Item>
      <Item>
        <h1 className="title title-xl">
          <Decode text={slide.title} duration={1200} />
        </h1>
      </Item>
      <Item>
        <p className="lede lede-lg">{slide.lede}</p>
      </Item>
      <Item className="tag-row">
        {['Blockchain', 'Genomics', 'Data Privacy', 'Digital Ownership'].map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </Item>
      <Item className="presenters">
        {(['A', 'B'] as const).map((k) => {
          const p = k === 'A' ? A : B;
          return (
            <div className="presenter" key={k} style={css({ '--c': SPEAKER_COLOR[k] })}>
              <span className="avatar">{p.badge}</span>
              <span>
                <strong>{p.name}</strong>
                <small className="roll">Roll No. {p.roll}</small>
                <small>{p.part}</small>
              </span>
            </div>
          );
        })}
      </Item>
      <Item className="hint">
        Press <kbd>→</kbd> to begin · <kbd>P</kbd> opens presenter view
      </Item>
    </>
  );
}

/* ── Hook: the 23andMe story ───────────────────────────── */
const HOOK_EVENTS = [
  { when: 'Oct 2023', what: 'Hackers break into ~14,000 accounts using reused passwords. A “find your relatives” feature lets them reach 6.9M people’s data.', c: '#ff4f6d' },
  { when: 'Mar 2025', what: '23andMe goes bankrupt. Its DNA database becomes something to sell.', c: '#ffb547' },
  { when: 'Jun 2025', what: '1.9M customers (~15%) rush to delete their data.', c: '#8d7bff' },
  { when: 'Jul 2025', what: 'The database is sold for $305M to a nonprofit set up by the company’s co-founder.', c: '#45c8ff' },
];

export function HookMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <div className="row stats-3">
        <Stat value="~15M" label="customers' DNA" color="#45c8ff" />
        <Stat value="$305M" label="sale price · Jul 2025" color="#ffb547" />
        <Stat value="≈$20" label="per person" color="#ff4f6d" big />
      </div>
      <Card className="timeline" accent="#ff4f6d">
        {HOOK_EVENTS.map((e) => (
          <div className="tl-row" key={e.when} style={css({ '--c': e.c })}>
            <span className="tl-dot" />
            <span className="tl-when">{e.when}</span>
            <span className="tl-what">{e.what}</span>
          </div>
        ))}
      </Card>
      <Item className="footnote">$305M ÷ ~15M customers ≈ $20 each (our own estimate). Sources: NPR, TechCrunch, HIPAA Journal, Business Insider.</Item>
    </>
  );
}

/* ── Why DNA data is different ─────────────────────────── */
const WHY = [
  { icon: InfinityIcon, t: 'Permanent', d: 'If it leaks, it’s leaked forever. You can’t change DNA like a password.', c: '#45c8ff' },
  { icon: Users, t: 'Shared', d: 'You share half your DNA with each parent, sibling and child. Your test reveals them too.', c: '#8d7bff' },
  { icon: Fingerprint, t: 'Identifying', d: 'A 2018 study: 60% of Americans of European descent could be identified through a relative’s DNA.', c: '#ff4f6d' },
  { icon: Activity, t: 'Predictive', d: 'It shows your disease risks, which insurance and medicine companies want to know.', c: '#ffb547' },
];

const STRAND = 'ATGCGTACGTTAGCCATGCAATCGGATCCGTAGCTAGGCTTACGATCGATGCATGCCGTAAGCT';

export function WhyMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="genome-meter" accent="#45c8ff">
        <div className="gm-num">
          <CountUp value="3.2" />
          <span className="gm-unit">billion</span>
        </div>
        <div className="gm-side">
          <div className="gm-label">letters in one person’s DNA</div>
          <div className="gm-strand" aria-hidden>
            <span>{STRAND + STRAND}</span>
          </div>
        </div>
      </Card>
      <div className="grid-2">
        {WHY.map(({ icon: Icon, t, d, c }) => (
          <Card key={t} accent={c} className="feature">
            <Icon className="feature-icon" />
            <div>
              <div className="feature-title">{t}</div>
              <div className="feature-text">{d}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── Who profits ───────────────────────────────────────── */
export function ProfitsMain({ slide }: P) {
  const nodes = [
    { icon: User, t: 'You', d: 'pay ~$100–200 for a DNA test', c: '#2ff3c4' },
    { icon: FlaskConical, t: 'Testing company', d: 'keeps your data in a big database', c: '#45c8ff' },
    { icon: Pill, t: 'Medicine companies', d: 'GSK put $300M into 23andMe (2018) to use its data', c: '#ffb547' },
  ];
  return (
    <>
      <Head slide={slide} />
      <Item className="flow">
        {nodes.map(({ icon: Icon, t, d, c }, i) => (
          <div className="flow-step" key={t} style={css({ '--c': c })}>
            <div className="flow-node">
              <Icon />
              <strong>{t}</strong>
              <small>{d}</small>
            </div>
            {i < nodes.length - 1 && (
              <div className="flow-arrow">
                <span>{i === 0 ? 'DNA + money' : 'pay to use it'}</span>
                <ArrowRight />
              </div>
            )}
          </div>
        ))}
      </Item>
      <div className="row profits-row">
        <Card accent="#ff4f6d" className="zero">
          <div className="stat-label">Your share</div>
          <div className="zero-value">$0</div>
        </Card>
        <Card accent="#8d7bff" className="lacks">
          <div className="lacks-year">1951</div>
          <div>
            <div className="feature-title">Henrietta Lacks</div>
            <div className="feature-text">
              Her cells were taken without asking her and used in research for 70+ years, even for the polio vaccine. Her family got a settlement only in{' '}
              <b>2023</b>.
            </div>
          </div>
        </Card>
      </div>
      <Item className="checkbox-line">
        <span className="fake-check">✓</span>
        <span>
          Consent today = <b>tick one box</b>, once, forever.
        </span>
      </Item>
    </>
  );
}

/* ── Research question ─────────────────────────────────── */
const OBJECTIVES = [
  { n: '01', t: 'Control', d: 'Can blockchain let people decide who uses their DNA data?', c: '#2ff3c4' },
  { n: '02', t: 'Permission & payment', d: 'Can smart contracts handle permission and payment automatically?', c: '#8d7bff' },
  { n: '03', t: 'Risks', d: 'What are the privacy, security, legal and ethical problems?', c: '#ffb547' },
  { n: '04', t: 'Will it work?', d: 'Could a market for DNA data really work, in practice and in money terms?', c: '#ff4f6d' },
];

export function QuestionMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} size="lg" />
      <div className="grid-2">
        {OBJECTIVES.map((o) => (
          <Card key={o.n} accent={o.c} className="objective">
            <span className="obj-n">{o.n}</span>
            <div>
              <div className="feature-title">{o.t}</div>
              <div className="feature-text">{o.d}</div>
            </div>
          </Card>
        ))}
      </div>
      <Item className="footnote">How we did it: read research & real cases → designed a model → checked where it fails. It’s an idea, not a finished product.</Item>
    </>
  );
}

/* ── Proposed model ────────────────────────────────────── */
const STEPS = [
  { icon: Dna, t: 'Give a DNA sample', d: 'A lab reads your full DNA (about $100–200 today).', onChain: false, c: '#2ff3c4' },
  { icon: Lock, t: 'Lock it in your own vault', d: 'The file is encrypted (scrambled). The blockchain keeps only its fingerprint.', onChain: false, c: '#45c8ff' },
  { icon: FileCode2, t: 'Set your rules', d: 'A smart contract records who can use it, why, for how long and for what price.', onChain: true, c: '#8d7bff' },
  { icon: Microscope, t: 'A researcher asks', d: 'You see the request and approve or reject it on your phone.', onChain: true, c: '#dfe9ff' },
  { icon: Coins, t: 'Get paid automatically', d: 'If you agreed to a payment, the contract pays you straight away.', onChain: true, c: '#ffb547' },
];

export function ModelMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="steps" accent="#8d7bff">
        {STEPS.map(({ icon: Icon, t, d, onChain, c }, i) => (
          <div className="step" key={t} style={css({ '--c': c })}>
            <div className="step-icon">
              <Icon />
              <span className="step-n">{i + 1}</span>
            </div>
            <div className="step-body">
              <div className="step-title">{t}</div>
              <div className="step-text">{d}</div>
            </div>
            <span className={`where ${onChain ? 'where-on-chain' : 'where-off-chain'}`}>{onChain ? 'blockchain' : 'private vault'}</span>
          </div>
        ))}
      </Card>
      <Item className="footnote">
        <Em text="The blockchain keeps *a record of who used what*. It doesn’t hide the data by itself." />
      </Item>
    </>
  );
}
