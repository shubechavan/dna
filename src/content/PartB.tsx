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
  struct Grant {
    address lab;   bytes32 purpose;
    uint64 expiry; uint256 fee;  bool active;
  }
  mapping(bytes32 => Grant) public grants; // hashes only, never DNA

  function approve(bytes32 id) external onlyOwner {
    Grant storage g = grants[id];
    g.active = true;
    escrow.release(owner, g.fee);          // owner gets paid
    emit ConsentGranted(id, g.lab, g.purpose);
  }

  function revoke(bytes32 id) external onlyOwner {
    grants[id].active = false;             // future access blocked
    emit ConsentRevoked(id);
  }
}`;

const TOKEN = /(\/\/.*$)|\b(contract|struct|mapping|function|external|public|storage|emit|onlyOwner|true|false)\b|\b(address|bytes32|uint64|uint256|bool)\b|\b(approve|revoke|release|ConsentGranted|ConsentRevoked)\b(?=\()/gm;

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
          <span className="code-note">simplified for illustration</span>
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
  { icon: Lock, t: 'Encryption at rest & in transit', d: 'Protects storage, but not data while it’s being used.', m: 5, lab: 'Mature', c: '#2ff3c4' },
  { icon: Cpu, t: 'Confidential computing (TEE)', d: 'Decrypts only inside sealed hardware, e.g. Genomes.io × AMD.', m: 4, lab: 'In production', c: '#45c8ff' },
  { icon: Send, t: 'Compute-to-data', d: 'The algorithm travels to the data; only results leave (Ocean Protocol).', m: 3, lab: 'Emerging', c: '#8d7bff' },
  { icon: EyeOff, t: 'Zero-knowledge proofs', d: 'Prove “I carry variant X” without revealing the genome.', m: 2, lab: 'Early', c: '#ffb547' },
  { icon: Binary, t: 'Homomorphic encryption', d: 'Compute directly on encrypted data. Still very slow.', m: 1, lab: 'Research', c: '#ff4f6d' },
];

export function PrivacyMain({ slide }: P) {
  return (
    <>
      <Head slide={slide} />
      <Card className="layers" accent="#45c8ff">
        <div className="layers-head">
          <span>Technique</span>
          <span>Maturity</span>
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
  { name: 'Genomes.io', meta: '2018 · UK', status: 'Active', c: '#2ff3c4', d: 'Encrypted DNA vaults, access log on Ethereum, $GENOME token on Base. Users are paid for anonymous research queries.' },
  { name: 'Nebula Genomics', meta: '2018 · George Church', status: 'Pivoted', c: '#8d7bff', d: 'Launched with a token & Ethereum vision. A 2024 class action alleges data was shared with Meta, Microsoft & Google.' },
  { name: 'LunaDNA', meta: '2017', status: 'Shut down', c: '#ff4f6d', d: 'Paid contributors in company shares, not coins. Closed Jan 2024 when funding ran out.' },
  { name: '23andMe', meta: '2006 · centralised', status: 'Sold', c: '#ffb547', d: '2023 breach, 2025 bankruptcy; database sold to TTAM for $305M.' },
  { name: 'VitaDAO', meta: 'DeSci', status: 'Active', c: '#45c8ff', d: 'Community-funded longevity research using IP-NFTs; raised $4.1M incl. Pfizer Ventures.' },
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
        <Em text="The technology works. *The business model* is the hard part." />
      </Item>
    </>
  );
}

/* ── Challenges ────────────────────────────────────────── */
const CHALLENGES = [
  { icon: Users, t: 'Relatives can’t consent', d: 'You share ~50% of your DNA with close family. Your “yes” exposes them.' },
  { icon: Undo2, t: 'Revoke ≠ delete', d: 'Contracts block future access; copies already shared can’t be recalled.' },
  { icon: Scale, t: 'Ownership is unclear', d: 'Moore v. Regents (1990): no property right in your own cells. Controlling a file ≠ owning DNA.' },
  { icon: Database, t: 'Ledgers never forget', d: 'Clashes with GDPR’s right to erasure, so store hashes only, never DNA.' },
  { icon: TrendingDown, t: 'Small, volatile payouts', d: 'Token prices swing, and payment could pressure poorer communities to sell.' },
  { icon: ScanSearch, t: 'Re-identification', d: '“Anonymous” DNA can often be traced back through relatives.' },
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
  { icon: EyeOff, t: 'Zero-knowledge genome queries' },
  { icon: Network, t: 'DeSci DAOs funding research' },
  { icon: Bot, t: 'AI drug discovery needs consented data' },
  { icon: FileCheck2, t: 'Standard consent codes (GA4GH DUO)' },
  { icon: Send, t: 'Federated & compute-to-data studies' },
  { icon: HandCoins, t: 'Fair benefit-sharing for communities' },
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
              <div className="feature-title">DPDP Act 2023 + DPDP Rules 2025</div>
              <div className="feature-text">
                Notified Nov 2025: registered <b>Consent Managers</b> let people give, review and withdraw consent from one dashboard, which fits naturally with
                smart-contract consent.
              </div>
            </div>
          </Card>
          <Card accent="#ffb547" className="feature">
            <Database className="feature-icon" />
            <div>
              <div className="feature-title">GenomeIndia</div>
              <div className="feature-text">
                <b>10,000</b> whole genomes from <b>85</b> population groups (180M variants) opened for research via IBDC in 2025.
              </div>
            </div>
          </Card>
          <Item className="footnote">
            <Globe size={14} style={{ verticalAlign: '-2px' }} /> Elsewhere: GDPR treats genetic data as a special category · US Genomic Data Protection Act
            proposed (2025).
          </Item>
        </div>
        <div className="future-col">
          <div className="col-label">
            <Sparkles size={15} style={{ verticalAlign: '-2px' }} /> Future scope
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
  { q: 'Can you control access?', a: 'Yes', c: '#2ff3c4', d: 'Smart contracts + encrypted vaults make it technically feasible today.' },
  { q: 'Can you get paid?', a: 'Possibly', c: '#ffb547', d: 'Only if agreements include it; amounts are small and uncertain.' },
  { q: 'Do you truly own your DNA?', a: 'Not yet', c: '#ff4f6d', d: 'Law, shared family DNA and existing copies limit ownership.' },
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
          <Decode text="Blockchain can’t make DNA private. It can make every access *visible, consented and accountable.*" duration={1400} delay={900} />
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
