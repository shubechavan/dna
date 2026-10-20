import type { Speaker } from './config';
import type { ShapeId } from './three/shapes';

export type Base = 'A' | 'T' | 'G' | 'C';

export interface SlideDef {
  id: string;
  kicker: string;
  /** Wrap words in *asterisks* to highlight them in the accent colour. */
  title: string;
  lede?: string;
  speaker: Speaker;
  /** Target speaking time for the slide. */
  seconds: number;
  shape: ShapeId;
  accent: string;
  /** One DNA letter per slide: the progress bar spells ATG (start codon) … TAG (stop codon). */
  base: Base;
  layout?: 'split' | 'wide';
  camera: { pos: [number, number, number]; target: [number, number, number] };
  /** Speaker script. {A} and {B} are replaced with presenter names. */
  notes: string;
}

export const SLIDES: SlideDef[] = [
  {
    id: 'title',
    kicker: 'Research presentation',
    title: 'Who owns your *DNA*?',
    lede: 'Personal DNA data ownership & monetization using blockchain: opportunities, privacy risks and ethical challenges.',
    speaker: 'A',
    seconds: 20,
    shape: 'helix',
    accent: '#2ff3c4',
    base: 'A',
    camera: { pos: [0, 0.5, 20], target: [0, 0, 0] },
    notes:
      "Good morning everyone. I'm {A}, and this is {B}. Our research question is simple but uncomfortable: who actually owns your DNA? We'll look at whether blockchain can let people control their genetic data, maybe even get paid for it, and where that idea breaks down.",
  },
  {
    id: 'hook',
    kicker: '01 · The hook',
    title: 'Your genome sold for about *$20*.',
    lede: 'The 23andMe story: how one DNA database changed hands (2023–2025).',
    speaker: 'A',
    seconds: 40,
    shape: 'fragments',
    accent: '#ff4f6d',
    base: 'T',
    camera: { pos: [2.5, 1.5, 21], target: [0.5, 0, 0] },
    notes:
      "Let's start with a real story. 23andMe had around 15 million customers. In 2023, hackers logged into about 14,000 accounts using reused passwords, and through the DNA Relatives feature they reached data on 6.9 million people. In March 2025 the company went bankrupt, and nearly 2 million people rushed to delete their data. In July 2025, the whole genetic database was sold to a nonprofit for 305 million dollars. Divide that by the customers and each genome was worth roughly 20 dollars. The customers didn't set that price, and they weren't paid for their DNA.",
  },
  {
    id: 'why',
    kicker: '02 · Why DNA is different',
    title: 'A password you can *never change*.',
    lede: 'Genetic data is not like an email address or a card number. Four properties make it uniquely sensitive.',
    speaker: 'A',
    seconds: 35,
    shape: 'fingerprint',
    accent: '#45c8ff',
    base: 'G',
    camera: { pos: [0, 0, 16.5], target: [0, 0, 0] },
    notes:
      "Why does this matter more than a leaked email? Because DNA is a password you can never change. Your genome has about 3.2 billion letters, and once it leaks it's leaked forever. It's also shared: you share about half your DNA with each parent, sibling and child, so your test exposes them too. A 2018 study in Science showed that about 60% of Americans of European ancestry could be traced through a relative's DNA, even if they never took a test themselves. And it predicts disease risk, which makes it valuable to insurers and pharma.",
  },
  {
    id: 'profits',
    kicker: '03 · The problem',
    title: 'Everyone profits, *except you*.',
    lede: "Today's genetic data economy in one line:",
    speaker: 'A',
    seconds: 40,
    shape: 'extraction',
    accent: '#ffb547',
    base: 'C',
    camera: { pos: [-1, 2.5, 19], target: [0.6, 0, 0] },
    notes:
      "So who earns money from this data today? Customers pay around 100 to 200 dollars for a kit. The testing company builds a database. Then pharma pays for access: in 2018, GSK invested 300 million dollars in 23andMe for drug discovery. The person who provided the DNA earns nothing. This isn't new. In 1951, Henrietta Lacks' cells were taken without her consent and helped build a whole research industry, and her family only reached a settlement in 2023. And consent today is usually one checkbox, ticked once, forever.",
  },
  {
    id: 'question',
    kicker: '04 · Research question',
    title: 'Can you *control* your DNA data, and *get paid* when it’s used?',
    speaker: 'A',
    seconds: 25,
    shape: 'orbit',
    accent: '#2ff3c4',
    base: 'C',
    camera: { pos: [0, 4, 18], target: [0, 0, 0] },
    notes:
      "That leads to our research question: can individuals control access to their DNA data and receive compensation when it's used? We had four objectives: control, smart-contract consent and payment, the privacy, legal and ethical risks, and whether a DNA data marketplace is actually feasible. This is a proposed model plus a critical analysis, not a finished product.",
  },
  {
    id: 'model',
    kicker: '05 · Proposed model',
    title: 'Data off-chain. *Permissions on-chain.*',
    lede: 'Our proposed five-step architecture:',
    speaker: 'A',
    seconds: 50,
    shape: 'pipeline',
    accent: '#8d7bff',
    base: 'G',
    camera: { pos: [1.5, 0.5, 17.5], target: [0, 0, 0] },
    notes:
      "Here's our proposed model in five steps. One: a person gives a DNA sample and a lab sequences it. Whole-genome sequencing now costs roughly 100 to 200 dollars. Two: the genome is encrypted and stored off-chain in a personal vault. We never put DNA on the blockchain, only a hash, which is a fingerprint of the file. Three: a smart contract records the consent rules: who can access it, for what purpose, for how long and at what price. Four: an approved research organisation requests access, and the owner reviews it and approves from their wallet. Five: if the agreement includes payment, the contract releases it automatically. The golden rule is data off-chain, permissions on-chain. Now {B} will show it in action.",
  },
  {
    id: 'contract',
    kicker: '06 · Smart contract demo',
    title: 'Consent, written in *code*.',
    lede: 'Every grant, query and payment becomes a permanent, auditable event.',
    speaker: 'B',
    seconds: 45,
    shape: 'chain',
    accent: '#8d7bff',
    base: 'A',
    camera: { pos: [-2, 1, 25], target: [0, -3.4, 0] },
    notes:
      "Thanks {A}. This is a simplified version of the consent contract. Each request is stored as a grant: which lab, what purpose, when it expires, and whether it's active. Let me run it. [Click Approve, or press D.] A research lab requests one query for a heart-disease study and offers 40 tokens. When I approve, three events hit the ledger: consent granted, the query runs on the data, and the payment reaches my wallet. [Click Revoke.] If I revoke, future access is blocked. But look at the warning: results already shared can't be pulled back. Everything is auditable, and nobody can quietly rewrite the record.",
  },
  {
    id: 'privacy',
    kicker: '07 · Privacy layers',
    title: 'Blockchain is not *privacy*.',
    lede: 'A ledger proves who accessed what. Hiding the genome itself takes extra layers:',
    speaker: 'B',
    seconds: 35,
    shape: 'shield',
    accent: '#45c8ff',
    base: 'T',
    camera: { pos: [0, 1.5, 17], target: [0, 0, 0] },
    notes:
      "Blockchain gives us an audit trail, but on its own it doesn't hide data. Privacy needs extra layers. Encryption protects storage. Confidential computing, which Genomes.io uses with AMD hardware, decrypts data only inside sealed hardware. Compute-to-data, popularised by Ocean Protocol, sends the algorithm to the data so only the results leave. Zero-knowledge proofs can prove 'I carry this variant' without revealing the genome. And homomorphic encryption computes directly on encrypted data, but it's still very slow.",
  },
  {
    id: 'landscape',
    kicker: '08 · Real-world projects',
    title: 'Who has *tried* this?',
    lede: 'Real projects, and what happened to them.',
    speaker: 'B',
    seconds: 35,
    shape: 'network',
    accent: '#ffb547',
    base: 'C',
    camera: { pos: [3.5, 2.5, 18.5], target: [0, 0, 0] },
    notes:
      "Has anyone actually tried this? Yes. Genomes.io stores DNA in encrypted vaults, logs access on Ethereum, and pays users in its GENOME token for anonymous research queries. Nebula Genomics, co-founded by George Church in 2018, launched with a blockchain vision, and in 2024 a class action alleged it shared customer data with Meta, Microsoft and Google. LunaDNA gave contributors company shares instead of coins, and shut down in 2024 when funding ran out. And 23andMe, the centralised giant, was sold in bankruptcy. The lesson: the technology works, but the business model is the hard part.",
  },
  {
    id: 'challenges',
    kicker: '09 · Critical analysis',
    title: 'Where it *breaks*.',
    lede: 'Six problems blockchain alone cannot solve.',
    speaker: 'B',
    seconds: 45,
    shape: 'glitch',
    accent: '#ff4f6d',
    base: 'G',
    camera: { pos: [0, 0, 20], target: [0, 0, 0] },
    notes:
      "Now the critical part: why this is harder than it looks. First, relatives can't consent, because my DNA reveals my family. Second, revoking isn't deleting. A smart contract stops future access, but copies already made stay out there. Third, legally, controlling a data file isn't the same as owning DNA. In Moore v. Regents in 1990, a court ruled that a patient had no property right in his own cells. Fourth, blockchains never forget, which conflicts with GDPR's right to erasure, so only hashes can go on-chain. Fifth, payouts are small and volatile, and they could pressure poorer communities to sell. And sixth, 'anonymous' genetic data can often be re-identified.",
  },
  {
    id: 'future',
    kicker: '10 · India & future scope',
    title: 'India, and *what comes next*.',
    speaker: 'B',
    seconds: 30,
    shape: 'galaxy',
    accent: '#2ff3c4',
    base: 'T',
    camera: { pos: [0, 3, 17], target: [0, 0, 0] },
    notes:
      "What about India? The DPDP Act 2023 and the DPDP Rules, notified in November 2025, introduce registered Consent Managers: one dashboard to give, review and withdraw consent. That maps naturally onto smart-contract consent. Meanwhile GenomeIndia has released 10,000 genomes from 85 population groups for research, so demand for consented data is growing. Next we expect zero-knowledge genome queries, DeSci communities funding research, and AI drug discovery driving demand.",
  },
  {
    id: 'verdict',
    kicker: '11 · Conclusion',
    title: 'The *verdict*.',
    speaker: 'B',
    seconds: 20,
    shape: 'helixGold',
    accent: '#ffb547',
    base: 'A',
    camera: { pos: [0, 0.5, 19.5], target: [0, 0, 0] },
    notes:
      "So, our verdict. Can you control access to your DNA data? Yes, the technology exists. Can you get paid? Possibly, but the amounts are small and uncertain. Do you truly own your DNA? Not yet, because law, family links and existing copies limit it. Blockchain can't make DNA private, but it can make every access visible, consented and accountable. Thank you. We're happy to take questions.",
  },
  {
    id: 'sources',
    kicker: 'References',
    title: 'Sources',
    speaker: 'B',
    seconds: 0,
    shape: 'helix',
    accent: '#45c8ff',
    base: 'G',
    layout: 'wide',
    camera: { pos: [0, 0.5, 30], target: [0, 0, 0] },
    notes: 'Backup slide: references. Leave it up during Q&A if helpful.',
  },
];

export const TOTAL_SECONDS = SLIDES.reduce((n, s) => n + s.seconds, 0);

export const BASE_COLOR: Record<Base, string> = {
  A: '#2ff3c4',
  T: '#ff4f6d',
  G: '#ffb547',
  C: '#8d7bff',
};
