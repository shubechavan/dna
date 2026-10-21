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
  /** Speaker script, written to be said out loud (~2.5 words per second). {A} and {B} are replaced with presenter names. */
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
      "Good morning everyone. I'm {A}, and this is {B}. Our question is simple: who really owns your DNA? We'll look at whether blockchain can let you decide who uses your DNA data, maybe even pay you for it, and where the idea runs into trouble.",
  },
  {
    id: 'hook',
    kicker: '01 · A true story',
    title: 'Your DNA, sold for about *$20*.',
    lede: 'What happened to 23andMe, a DNA-testing company, between 2023 and 2025.',
    speaker: 'A',
    seconds: 40,
    shape: 'fragments',
    accent: '#ff4f6d',
    base: 'T',
    camera: { pos: [2.5, 1.5, 21], target: [0.5, 0, 0] },
    notes:
      "Let's start with a true story. 23andMe is a DNA-testing company with about 15 million customers. In 2023, hackers broke into about 14,000 accounts using reused passwords. But a 'find your relatives' feature let them reach data on 6.9 million people. In 2025 the company went bankrupt, and almost 2 million people rushed to delete their data. Then the whole DNA database was sold for 305 million dollars. That's about 20 dollars per person. And the customers were never paid for their DNA.",
  },
  {
    id: 'why',
    kicker: '02 · Why DNA is special',
    title: 'A password you can *never change*.',
    lede: 'DNA is not like an email address or a bank card. Here’s why:',
    speaker: 'A',
    seconds: 35,
    shape: 'fingerprint',
    accent: '#45c8ff',
    base: 'G',
    camera: { pos: [0, 0, 16.5], target: [0, 0, 0] },
    notes:
      "Why is DNA such a big deal? Because it's like a password you can never change. If it leaks, it's leaked forever. It's also shared: you have half your DNA in common with each parent, sibling and child, so your test exposes them too. A 2018 study found that 60% of Americans of European descent could be identified through a relative's DNA, even if they never took a test. And DNA shows your disease risks, which insurance and medicine companies want to know.",
  },
  {
    id: 'profits',
    kicker: '03 · The problem',
    title: 'Everyone profits, *except you*.',
    lede: 'Who makes money from your DNA today:',
    speaker: 'A',
    seconds: 40,
    shape: 'extraction',
    accent: '#ffb547',
    base: 'C',
    camera: { pos: [-1, 2.5, 19], target: [0.6, 0, 0] },
    notes:
      "So who makes money from DNA today? You pay 100 to 200 dollars for a test. The testing company keeps your data in a huge database. Then medicine companies pay to use it. In 2018, GSK put 300 million dollars into 23andMe to use its data for new medicines. The person who gave the DNA gets nothing. And this isn't new: in 1951, Henrietta Lacks' cells were taken without asking her and used in research for decades. Her family only got a settlement in 2023. Today, 'consent' usually means ticking one box, once, forever.",
  },
  {
    id: 'question',
    kicker: '04 · Our research question',
    title: 'Can you *control* your DNA data, and *get paid* when it’s used?',
    speaker: 'A',
    seconds: 25,
    shape: 'orbit',
    accent: '#2ff3c4',
    base: 'C',
    camera: { pos: [0, 4, 18], target: [0, 0, 0] },
    notes:
      "So our research question is: can people control who uses their DNA data, and get paid when it's used? We looked at four things: control, automatic permission and payment, the risks, and whether it could really work. This is an idea and an analysis, not a finished product.",
  },
  {
    id: 'model',
    kicker: '05 · Our idea',
    title: 'Your DNA stays locked. *Your rules* go on the blockchain.',
    lede: 'How it would work, in five steps:',
    speaker: 'A',
    seconds: 50,
    shape: 'pipeline',
    accent: '#8d7bff',
    base: 'G',
    camera: { pos: [1.5, 0.5, 17.5], target: [0, 0, 0] },
    notes:
      "Here's our idea in five steps. One: you give a DNA sample and a lab reads it, which now costs about 100 to 200 dollars. Two: your DNA file is locked in your own private vault, not on the blockchain. The blockchain keeps only a fingerprint of the file. Three: you set your rules in a smart contract, which is a small program on the blockchain: who can use your data, why, for how long, and for what price. Four: a researcher asks, and you approve or reject from your phone. Five: if there's a payment, the contract pays you automatically. Now {B} will show it working.",
  },
  {
    id: 'contract',
    kicker: '06 · Live demo',
    title: 'Your rules, as *code*.',
    lede: 'A smart contract is a small program on the blockchain. It runs your rules and saves every action.',
    speaker: 'B',
    seconds: 45,
    shape: 'chain',
    accent: '#8d7bff',
    base: 'A',
    camera: { pos: [-2, 1, 25], target: [0, -3.4, 0] },
    notes:
      "Thanks. This is a simple version of the smart contract. Each permission saves which lab it is, why they want the data, when it ends, the price, and whether it's on or off. Let's try it. [Click Approve, or press D.] A heart-research lab asks one question and offers 40 tokens. When I approve, three things are saved on the blockchain: permission given, question answered, payment sent. [Click 'Take back permission'.] If I take back permission, the lab can't ask anything new. But see the warning: the lab keeps answers it already got. And nobody can secretly change this record.",
  },
  {
    id: 'privacy',
    kicker: '07 · Keeping it private',
    title: 'Blockchain doesn’t *hide* data.',
    lede: 'It only shows who used your data. To keep the DNA itself private, we need extra protection:',
    speaker: 'B',
    seconds: 35,
    shape: 'shield',
    accent: '#45c8ff',
    base: 'T',
    camera: { pos: [0, 1.5, 17], target: [0, 0, 0] },
    notes:
      "One important point: blockchain doesn't hide data. It only shows who used it. To keep DNA private, we need extra protection. Lock the file with encryption. Open it only inside a sealed chip, which Genomes.io already does. Send the researcher's question to your data, so only the answer leaves. Prove things, like 'I have this gene', without showing your DNA. Or even do calculations on locked data, but that's still very slow.",
  },
  {
    id: 'landscape',
    kicker: '08 · Real companies',
    title: 'Who has *tried* this?',
    lede: 'Real companies, and what happened to them.',
    speaker: 'B',
    seconds: 35,
    shape: 'network',
    accent: '#ffb547',
    base: 'C',
    camera: { pos: [3.5, 2.5, 18.5], target: [0, 0, 0] },
    notes:
      "Has anyone tried this? Yes. Genomes.io keeps your DNA in a locked vault, records every access on a blockchain, and pays you in tokens for anonymous research questions. Nebula Genomics started with a similar plan, but in 2024 it was sued for allegedly sharing customer data with Meta, Microsoft and Google. LunaDNA ran out of money and closed in 2024. And 23andMe was sold off in bankruptcy. So the technology works. Making money from it is the hard part.",
  },
  {
    id: 'challenges',
    kicker: '09 · The problems',
    title: 'Where it *breaks*.',
    lede: 'Six problems that blockchain alone can’t fix.',
    speaker: 'B',
    seconds: 45,
    shape: 'glitch',
    accent: '#ff4f6d',
    base: 'G',
    camera: { pos: [0, 0, 20], target: [0, 0, 0] },
    notes:
      "Now the problems. One: your family can't say no, because your DNA reveals theirs. Two: taking back permission isn't deleting. A lab that already copied your data still has it. Three: it's legally unclear who owns DNA. In a 1990 US case, a court said a patient didn't own cells taken from his body. Four: blockchains never delete, but privacy laws say you can ask for deletion. That's why we store only a fingerprint. Five: token payments are small and can lose value, and poorer people might feel pushed to sell. Six: 'anonymous' DNA can often be traced back to you.",
  },
  {
    id: 'future',
    kicker: '10 · India & the future',
    title: 'India, and *what comes next*.',
    speaker: 'B',
    seconds: 30,
    shape: 'galaxy',
    accent: '#2ff3c4',
    base: 'T',
    camera: { pos: [0, 3, 17], target: [0, 0, 0] },
    notes:
      "What about India? Our new data protection law, the DPDP Act, creates 'consent managers': one app to give or take back permission for your data. That's exactly what our idea does with blockchain. India has also mapped the DNA of 10,000 people from 85 communities for research. In future we expect ways to ask DNA questions without seeing the DNA, online communities funding science, and AI medicine research that needs permitted data.",
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
      "Our conclusion. Can you control who uses your DNA data? Yes. Can you get paid? Maybe, but not much. Do you truly own your DNA? Not yet. Blockchain can't hide your DNA, but it can make sure every use is asked for and recorded. Thank you! Any questions?",
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
