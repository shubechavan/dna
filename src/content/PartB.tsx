import type { CSSProperties, ReactNode } from 'react';
import {
  Binary,
  Bot,
  Cpu,
  Database,
  EyeOff,
  FileCheck2,
  Globe,
  HandCoins,
  Landmark,
  Lock,
  MapPin,
  Network,
  ScanSearch,
  Scale,
  Send,
  Sparkles,
  TrendingDown,
  Undo2,
  Users,
} from 'lucide-react';
import Head from './Head';
import { Card, Decode, Em, Item } from '../ui/primitives';
import { DECK, SPEAKER_COLOR } from '../config';
import type { SlideDef } from '../slides';

type P = { slide: SlideDef };
const css = (v: Record<string, string>) => v as CSSProperties;

/* ── Smart contract ────────────────────────────────────── */
const CODE = `contract DNAConsent {
  struct Permission {
    address lab;     string purpose;
    uint64 endsOn;   uint256 price;   bool active;
  }
  mapping(bytes32 => Permission) public permissions; // fingerprint only, never DNA

  function approve(bytes32 id) external onlyOwner {
    Permission storage p = permissions[id];
    p.active = true;
    payOwner(p.price);                     // you get paid
    emit PermissionGiven(id, p.lab, p.purpose);
  }

  function takeBack(bytes32 id) external onlyOwner {
    permissions[id].active = false;        // no new access
    emit PermissionRemoved(id);
  }
}`;

const TOKEN = /(\/\/.*$)|\b(contract|struct|mapping|function|external|public|storage|emit|onlyOwner|true|false)\b|\b(address|bytes32|uint64|uint256|bool|string)\b|\b(approve|takeBack|payOwner|PermissionGiven|PermissionRemoved)\b(?=\()/gm;

function highlight(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of src.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(src.slice(last, i));
    const cls = m[1] ? 'tk-com' : m[2] ? 'tk-key' : m[3] ? 'tk-type' : 'tk-fn';
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  out.push(src.slice(last));
  return out;
}

export function ContractMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="code-card" accent="#8d7bff">
        <div className="code-head">
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
          DNAConsent.sol
          <span className="code-note">simplified example</span>
        </div>
        <pre className="code">
          <code>{highlight(CODE)}</code>
        </pre>
      </Card>
    </>
  );
}

/* ── Privacy layers ────────────────────────────────────── */
const LAYERS = [
  { icon: Lock, t: 'Lock the file', d: 'Scramble the data so only you hold the key (encryption).', m: 5, lab: 'Used everywhere', c: '#2ff3c4' },
  { icon: Cpu, t: 'Open it only inside a sealed chip', d: 'Data is unlocked only inside secure hardware. Genomes.io does this with AMD.', m: 4, lab: 'In use today', c: '#45c8ff' },
  { icon: Send, t: 'Send the question, not the data', d: 'The researcher’s code runs where your data lives; only the answer comes back.', m: 3, lab: 'Growing', c: '#8d7bff' },
  { icon: EyeOff, t: 'Prove without showing', d: 'Prove “I have gene X” without revealing your DNA (zero-knowledge proof).', m: 2, lab: 'Early stage', c: '#ffb547' },
  { icon: Binary, t: 'Calculate on locked data', d: 'Do maths on data while it’s still scrambled. Very slow for now.', m: 1, lab: 'Still in labs', c: '#ff4f6d' },
];

export function PrivacyMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="layers" accent="#45c8ff">
        <div className="layers-head">
          <span>Protection</span>
          <span>How ready?</span>
        </div>
        {LAYERS.map(({ icon: Icon, t, d, m, lab, c }) => (
          <div className="layer" key={t} style={css({ '--c': c })}>
            <Icon className="layer-icon" />
            <div className="layer-body">
              <div className="layer-title">{t}</div>
              <div className="layer-text">{d}</div>
            </div>
            <div className="meter" aria-label={`${lab}, ${m} of 5`}>
              <div className="meter-bars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} className={n <= m ? 'on' : ''} style={{ animationDelay: `${0.5 + n * 0.08}s` }} />
                ))}
              </div>
              <span>{lab}</span>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

/* ── Real-world landscape ──────────────────────────────── */
const PROJECTS = [
  { name: 'Genomes.io', meta: '2018 · UK', status: 'Active', c: '#2ff3c4', d: 'Keeps your DNA in a locked vault, records every access on a blockchain, and pays you in tokens for anonymous research questions.' },
  { name: 'Nebula Genomics', meta: '2018 · USA', status: 'Sued', c: '#8d7bff', d: 'Started with a blockchain and token plan. In 2024 it was sued for allegedly sharing customer data with Meta, Microsoft & Google.' },
  { name: 'LunaDNA', meta: '2017 · USA', status: 'Shut down', c: '#ff4f6d', d: 'Paid people with company shares instead of crypto. Ran out of money and closed in Jan 2024.' },
  { name: '23andMe', meta: '2006 · no blockchain', status: 'Sold', c: '#ffb547', d: 'The big traditional company: hacked in 2023, bankrupt in 2025, DNA data sold for $305M.' },
  { name: 'VitaDAO', meta: 'online community', status: 'Active', c: '#45c8ff', d: 'People pool money online to fund anti-ageing research. Raised $4.1M, with backing from Pfizer Ventures.' },
];

export function LandscapeMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="projects" accent="#ffb547">
        {PROJECTS.map((p) => (
          <div className="project" key={p.name} style={css({ '--c': p.c })}>
            <div className="project-name">
              <strong>{p.name}</strong>
              <small>{p.meta}</small>
            </div>
            <span className="badge">{p.status}</span>
            <div className="project-text">{p.d}</div>
          </div>
        ))}
      </Card>
      <Item className="takeaway">
        <Em text="The technology works. *Making money from it* is the hard part." />
      </Item>
    </>
  );
}

/* ── Challenges ────────────────────────────────────────── */
const CHALLENGES = [
  { icon: Users, t: 'Your family can’t say no', d: 'You share half your DNA with close family. When you share yours, you share theirs.' },
  { icon: Undo2, t: 'Taking back ≠ deleting', d: 'You can stop new access, but a lab that already copied your data keeps it.' },
  { icon: Scale, t: 'Who owns DNA? Unclear', d: 'In a 1990 US case (Moore v. Regents), a court said a patient didn’t own cells taken from his body.' },
  { icon: Database, t: 'Blockchains never forget', d: 'Privacy laws let you ask for deletion, but a blockchain can’t delete. So store only a fingerprint, never DNA.' },
  { icon: TrendingDown, t: 'Small, unstable payments', d: 'Crypto tokens can lose value, and poorer people may feel pushed to sell their data.' },
  { icon: ScanSearch, t: '“Anonymous” isn’t really', d: 'DNA can often be traced back to you through your relatives.' },
];

export function ChallengesMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <div className="grid-2 challenges">
        {CHALLENGES.map(({ icon: Icon, t, d }, i) => (
          <Card key={t} accent="#ff4f6d" className="challenge">
            <span className="ch-n">{String(i + 1).padStart(2, '0')}</span>
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

/* ── India & future scope ──────────────────────────────── */
const FUTURE = [
  { icon: EyeOff, t: 'Ask DNA questions without seeing the DNA' },
  { icon: Network, t: 'Online communities funding science' },
  { icon: Bot, t: 'AI medicine research will need permitted data' },
  { icon: FileCheck2, t: 'One standard “permission label” for DNA data' },
  { icon: Send, t: 'Studies where data never leaves your vault' },
  { icon: HandCoins, t: 'A fair share for communities who give DNA' },
];

export function FutureMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <div className="future">
        <div className="future-col">
          <div className="col-label">
            <MapPin size={15} style={{ verticalAlign: '-2px' }} /> India
          </div>
          <Card accent="#2ff3c4" className="feature">
            <Landmark className="feature-icon" />
            <div>
              <div className="feature-title">India’s new data law (DPDP Act)</div>
              <div className="feature-text">
                Rules released in Nov 2025 create <b>consent managers</b>: one app where you give or take back permission for your data, just like our idea.
              </div>
            </div>
          </Card>
          <Card accent="#ffb547" className="feature">
            <Database className="feature-icon" />
            <div>
              <div className="feature-title">GenomeIndia</div>
              <div className="feature-text">
                India mapped the full DNA of <b>10,000</b> people from <b>85</b> communities and opened it to researchers in 2025.
              </div>
            </div>
          </Card>
          <Item className="footnote">
            <Globe size={14} style={{ verticalAlign: '-2px' }} /> Elsewhere: Europe’s GDPR gives DNA extra protection · the US proposed a DNA privacy law in
            2025.
          </Item>
        </div>
        <div className="future-col">
          <div className="col-label">
            <Sparkles size={15} style={{ verticalAlign: '-2px' }} /> What comes next
          </div>
          <Card accent="#8d7bff" className="future-list">
            {FUTURE.map(({ icon: Icon, t }) => (
              <div className="future-item" key={t}>
                <Icon />
                <span>{t}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

/* ── Verdict ───────────────────────────────────────────── */
const VERDICT = [
  { q: 'Can you control who uses it?', a: 'Yes', c: '#2ff3c4', d: 'The technology to do this exists today.' },
  { q: 'Can you get paid?', a: 'Maybe', c: '#ffb547', d: 'Only if the deal includes payment, and amounts are small.' },
  { q: 'Do you truly own your DNA?', a: 'Not yet', c: '#ff4f6d', d: 'Laws, your relatives and old copies get in the way.' },
];

export function VerdictMain({ slide }: P) {
  const { A, B } = DECK.presenters;
  return (
    <>
      <Head slide={slide} />
      <Card className="verdict" accent="#ffb547">
        {VERDICT.map((v) => (
          <div className="verdict-row" key={v.q} style={css({ '--c': v.c })}>
            <div className="verdict-q">{v.q}</div>
            <span className="verdict-a">{v.a}</span>
            <div className="verdict-d">{v.d}</div>
          </div>
        ))}
      </Card>
      <Item>
        <blockquote className="quote">
          <Decode text="Blockchain can’t hide your DNA. But it can make sure *every use is asked for, and recorded.*" duration={1400} delay={900} />
        </blockquote>
      </Item>
      <Item className="thanks">
        <span className="thanks-big">Thank you · Questions?</span>
        <span className="thanks-names">
          <i style={{ background: SPEAKER_COLOR.A }} />
          {A.name}
          <i style={{ background: SPEAKER_COLOR.B }} />
          {B.name}
        </span>
      </Item>
    </>
  );
}

/* ── Sources ───────────────────────────────────────────── */
const SOURCES: [string, string, string][] = [
  ['NPR / OPB (Jul 2025)', 'Judge OKs sale of 23andMe and its DNA data to a nonprofit led by its founder', 'https://www.opb.org/article/2025/07/01/judge-oks-sale-of-23andme-to-a-nonprofit-led-by-its-founder/'],
  ['TechCrunch (Jun 2025)', 'UK watchdog fines 23andMe over 2023 data breach', 'https://techcrunch.com/2025/06/17/uk-watchdog-fines-23andme-over-2023-data-breach'],
  ['HIPAA Journal', '6.9 million 23andMe users affected by data breach', 'https://www.hipaajournal.com/6-9-million-23andme-users-affected-by-data-breach/'],
  ['Business Insider (Jun 2025)', 'Almost 2 million 23andMe users asked the company to delete their data', 'https://www.yahoo.com/news/almost-2-million-23andme-users-094501555.html'],
  ['Fierce Biotech (Jul 2018)', 'GSK makes $300M investment in 23andMe, forms R&D pact', 'https://www.fiercebiotech.com/biotech/glaxosmithkline-makes-300m-investment-23andme-forms-50-50-r-d-pact'],
  ['Erlich et al., Science 362 (2018)', 'Identity inference of genomic data using long-range familial searches', 'https://www.pbs.org/newshour/science/dna-ancestry-searches-can-now-identify-most-white-americans-heres-why-thats-legally-questionable'],
  ['AP via WBAY (Aug 2023)', 'Henrietta Lacks’ family and Thermo Fisher reach settlement', 'https://www.wbay.com/2023/08/01/henrietta-lacks-family-biotech-firm-reach-settlement-over-use-her-cells-research-reports-say/'],
  ['Genomes.io', 'Encrypted DNA vaults, Ethereum audit log, $GENOME token', 'https://genomes.io'],
  ['MIT Technology Review (Feb 2018)', 'Nebula Genomics: sequence your genome and share it on a blockchain', 'https://www.technologyreview.com/2018/02/07/145768/this-new-company-wants-to-sequence-your-genome-and-let-you-share-it-on-a-blockchain/'],
  ['Wikipedia', 'Nebula Genomics (Portillo v. Nebula Genomics, 2024)', 'https://en.wikipedia.org/wiki/Nebula_Genomics'],
  ['Inside Precision Medicine (2024)', 'Total eclipse of LunaDNA: genome data-sharing platform goes dark', 'https://www.insideprecisionmedicine.com/topics/precision-medicine/total-eclipse-of-lunadna-once-touted-genome-data-sharing-platform-goes-dark'],
  ['The Block (2023)', 'Pfizer Ventures backs DeSci startup VitaDAO in $4.1M round', 'https://www.theblock.co/amp/post/206552/pfizer-ventures-backs-decentralized-science-startup-in-4-1-million-round'],
  ['Ocean Protocol docs', 'Compute-to-Data', 'https://docs.oceanprotocol.com/developers/compute-to-data'],
  ['Alghazwi et al. (2021)', 'Blockchain for Genomics: A Systematic Literature Review', 'https://arxiv.org/abs/2111.10153'],
  ['Dedeturk et al., PeerJ (2021)', 'Blockchain for genomics and healthcare: literature review & open issues', 'https://peerj.com/articles/12130'],
  ['PIB, Govt. of India (Nov 2025)', 'Digital Personal Data Protection Rules, 2025', 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf'],
  ['Medical Dialogues (Jan 2025)', 'India launches 10,000-genome dataset and IBDC portals', 'https://health.medicaldialogues.in/health/india-launches-10000-genomes-database-and-ibdc-portals-for-genetic-research-141353'],
  ['NIH', 'Genomic Data Sharing Policy', 'https://sharing.nih.gov/genomic-data-sharing-policy'],
  ['GEN (2022)', 'Ultima Genomics targets the $100 genome', 'https://genengnews.com/insights/ultima-genomics-bursts-onto-ngs-scene-targeting-the-100-genome'],
  ['US Senate (Mar 2025)', 'Cassidy, Peters introduce Genomic Data Protection Act', 'https://www.cassidy.senate.gov/newsroom/press-releases/cassidy-peters-introduce-bill-to-protect-americans-dna-national-security'],
  ['Case law', 'Moore v. Regents of the University of California, 51 Cal.3d 120 (1990)', ''],
];

export function SourcesMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="sources" accent="#45c8ff">
        <ol>
          {SOURCES.map(([who, what, url]) => (
            <li key={what}>
              <span className="src-who">{who}</span>{' '}
              {url ? (
                <a href={url} target="_blank" rel="noreferrer">
                  {what}
                </a>
              ) : (
                <span>{what}</span>
              )}
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
