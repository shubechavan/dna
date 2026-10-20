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
  { when: 'Oct 2023', what: 'Hackers reuse leaked passwords on ~14,000 accounts. Through “DNA Relatives”, 6.9M people are exposed.', c: '#ff4f6d' },
  { when: 'Mar 2025', what: '23andMe files for bankruptcy. Its genetic database becomes an asset for sale.', c: '#ffb547' },
  { when: 'Jun 2025', what: '1.9M customers (~15%) rush to delete their data.', c: '#8d7bff' },
  { when: 'Jul 2025', what: 'Sold to TTAM Research Institute for $305M, after Regeneron’s $256M bid.', c: '#45c8ff' },
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
      <Item className="footnote">$305M ÷ ~15M customers ≈ $20 each (our estimate). Sources: NPR, TechCrunch, HIPAA Journal, Business Insider.</Item>
    </>
  );
}

/* ── Why DNA data is different ─────────────────────────── */
const WHY = [
  { icon: InfinityIcon, t: 'Permanent', d: 'Leaked once, leaked forever. You can’t reset a genome.', c: '#45c8ff' },
  { icon: Users, t: 'Shared', d: '~50% identical to each parent, sibling and child. Your test exposes them too.', c: '#8d7bff' },
  { icon: Fingerprint, t: 'Identifying', d: '~60% of US European-ancestry people are traceable via a relative’s DNA (Science, 2018).', c: '#ff4f6d' },
  { icon: Activity, t: 'Predictive', d: 'Reveals disease risk, ancestry and traits, which is valuable to insurers & pharma.', c: '#ffb547' },
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
          <div className="gm-label">DNA letters in one human genome</div>
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
    { icon: User, t: 'You', d: 'pay ~$100–200 for a kit', c: '#2ff3c4' },
    { icon: FlaskConical, t: 'Testing company', d: 'builds & controls the database', c: '#45c8ff' },
    { icon: Pill, t: 'Pharma', d: 'GSK invested $300M in 23andMe (2018)', c: '#ffb547' },
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
                <span>{i === 0 ? 'DNA + fee' : 'data access $$$'}</span>
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
              Her cells were taken without consent. The HeLa line powered decades of research, from the polio vaccine to cancer studies. Her family settled
              with Thermo Fisher only in <b>2023</b>.
            </div>
          </div>
        </Card>
      </div>
      <Item className="checkbox-line">
        <span className="fake-check">✓</span>
        <span>
          Consent today = <b>one checkbox</b>, ticked once, valid forever.
        </span>
      </Item>
    </>
  );
}

/* ── Research question ─────────────────────────────────── */
const OBJECTIVES = [
  { n: '01', t: 'Control', d: 'How blockchain can give individuals control over access to their genomic data.', c: '#2ff3c4' },
  { n: '02', t: 'Consent & payment', d: 'How smart contracts could manage consent and compensation.', c: '#8d7bff' },
  { n: '03', t: 'Risks', d: 'Privacy, security, ethical and legal challenges.', c: '#ffb547' },
  { n: '04', t: 'Feasibility', d: 'Is a decentralised DNA data marketplace technically & economically viable?', c: '#ff4f6d' },
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
      <Item className="footnote">Method: secondary research → proposed architecture → critical evaluation. A model, not a finished product.</Item>
    </>
  );
}

/* ── Proposed model ────────────────────────────────────── */
const STEPS = [
  { icon: Dna, t: 'Provide a DNA sample', d: 'A lab sequences the genome (~$100–200 for a whole genome today).', where: 'off-chain', c: '#2ff3c4' },
  { icon: Lock, t: 'Encrypt & vault it', d: 'Stored encrypted in a personal vault. Only its hash goes on-chain.', where: 'off-chain', c: '#45c8ff' },
  { icon: FileCode2, t: 'Smart contract records consent', d: 'Who · purpose · duration · price, stored as enforceable rules.', where: 'on-chain', c: '#8d7bff' },
  { icon: Microscope, t: 'Researcher requests access', d: 'The owner reviews the terms and approves from a wallet.', where: 'on-chain', c: '#dfe9ff' },
  { icon: Coins, t: 'Automatic compensation', d: 'Escrow pays the owner if the agreement includes payment.', where: 'on-chain', c: '#ffb547' },
];

export function ModelMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="steps" accent="#8d7bff">
        {STEPS.map(({ icon: Icon, t, d, where, c }, i) => (
          <div className="step" key={t} style={css({ '--c': c })}>
            <div className="step-icon">
              <Icon />
              <span className="step-n">{i + 1}</span>
            </div>
            <div className="step-body">
              <div className="step-title">{t}</div>
              <div className="step-text">{d}</div>
            </div>
            <span className={`where where-${where}`}>{where}</span>
          </div>
        ))}
      </Card>
      <Item className="footnote">
        <Em text="Blockchain records *permissions and an audit trail*. It doesn’t make data private by itself." />
      </Item>
    </>
  );
}
