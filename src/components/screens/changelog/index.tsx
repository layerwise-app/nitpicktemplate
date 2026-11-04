import type { ComponentType } from 'react';
import type { ChangelogEntry } from '~/content/types';
import { formatDate } from '~/lib/changelog';
import { LogoMark } from '~/components/site/Logo';
import { ScreenSlot } from '../ScreenSlot';
import { EuDataResidency } from './EuDataResidency';
import { FasterFirstComment } from './FasterFirstComment';
import { GitlabSelfManaged } from './GitlabSelfManaged';
import { MultiFileSuggestions } from './MultiFileSuggestions';
import { PathScopedRules } from './PathScopedRules';
import { ReviewSummaryCheck } from './ReviewSummaryCheck';

/** Drawn screens, by the `screen` name a changelog entry uses. */
export const changelogScreens: Record<string, ComponentType> = {
  'multi-file-suggestions': MultiFileSuggestions,
  'path-scoped-rules': PathScopedRules,
  'eu-data-residency': EuDataResidency,
  'review-summary-check': ReviewSummaryCheck,
  'gitlab-self-managed': GitlabSelfManaged,
  'faster-first-comment': FasterFirstComment
};

/** An entry's screen: its media if set, else its drawn screen, else a title card. */
export function ChangelogScreen({ entry }: { entry: ChangelogEntry }) {
  const Drawn = entry.screen ? changelogScreens[entry.screen] : undefined;
  return (
    <ScreenSlot media={entry.media}>
      {Drawn ? (
        <Drawn />
      ) : (
        <div className='panel flex aspect-[16/7] flex-col justify-between p-6'>
          <LogoMark size={28} />
          <div>
            <p className='font-mono text-[12px] text-subtle'>{formatDate(entry.date)}</p>
            <p className='heading mt-2 text-[24px] text-foreground'>{entry.title}</p>
          </div>
        </div>
      )}
    </ScreenSlot>
  );
}
