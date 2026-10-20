// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE: put your names here before presenting.
// ─────────────────────────────────────────────────────────────

export const DECK = {
  presenters: {
    // badge is shown in the round avatar (both presenters share the initials "SC")
    A: { name: 'Shubham Chavan', roll: '17030925005', badge: '1', part: 'Problem & proposed model' },
    B: { name: 'Shubham Chaubey', roll: '17030925004', badge: '2', part: 'Demo, analysis & verdict' },
  },
  course: 'MCA · Semester III',
  subject: 'Blockchain Research',
  brand: 'GENOME·LEDGER',
  // Total talk length in seconds (used by the timer in presenter view)
  totalSeconds: 420,
};

export type Speaker = keyof typeof DECK.presenters;

export const SPEAKER_COLOR: Record<Speaker, string> = {
  A: '#2ff3c4',
  B: '#ffb547',
};
