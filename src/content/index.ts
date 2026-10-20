import type { ComponentType } from 'react';
import type { SlideDef } from '../slides';
import { HookMain, ModelMain, ProfitsMain, QuestionMain, TitleMain, WhyMain } from './PartA';
import { ChallengesMain, ContractMain, FutureMain, LandscapeMain, PrivacyMain, SourcesMain, VerdictMain } from './PartB';
import ContractDemo from './ContractDemo';

export interface SlideContent {
  Main: ComponentType<{ slide: SlideDef }>;
  /** Optional floating panel on the right, over the 3D scene. */
  Aside?: ComponentType;
}

export const CONTENT: Record<string, SlideContent> = {
  title: { Main: TitleMain },
  hook: { Main: HookMain },
  why: { Main: WhyMain },
  profits: { Main: ProfitsMain },
  question: { Main: QuestionMain },
  model: { Main: ModelMain },
  contract: { Main: ContractMain, Aside: ContractDemo },
  privacy: { Main: PrivacyMain },
  landscape: { Main: LandscapeMain },
  challenges: { Main: ChallengesMain },
  future: { Main: FutureMain },
  verdict: { Main: VerdictMain },
  sources: { Main: SourcesMain },
};
