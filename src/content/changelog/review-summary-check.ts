import type { ChangelogEntry } from '../types';

const entry: ChangelogEntry = {
  slug: 'review-summary-check',
  title: 'A summary in the check',
  date: '2026-09-16',
  summary:
    'The Nitpick check now opens with a short summary: what it looked at, what it found, and what is still open.',
  body: [
    'Reviewers told us they open the check before the diff. So the check now carries a summary table with each finding, its severity, and whether it has been resolved.',
    'The check passes once nothing high-severity is open. Low-severity findings are listed but never block a merge unless your config says so.'
  ],
  changes: [
    'Summary table at the top of the check',
    'Resolved findings are struck through instead of removed',
    'The check passes once no high-severity finding is open'
  ],
  screen: 'review-summary-check'
};

export default entry;
