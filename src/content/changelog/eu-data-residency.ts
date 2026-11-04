import type { ChangelogEntry } from '../types';

const entry: ChangelogEntry = {
  slug: 'eu-data-residency',
  title: 'Reviews that stay in the EU',
  date: '2026-09-30',
  summary:
    'Organizations can now choose to run every review in Frankfurt. Diffs, model calls, and comments never leave the EU.',
  body: [
    'Until now every review ran in Virginia. Teams in the EU asked for their code to stay in the EU, and so did a few in the US with European customers.',
    'An organization admin can now choose US or EU as the review region. The whole review runs there, from the webhook to the model call to the comment. Switching takes effect on the next pull request and needs no change to your code host.'
  ],
  changes: [
    'New review region: EU · Frankfurt',
    'Region is set per organization by an admin',
    'Model calls run in the same region with zero retention'
  ],
  screen: 'eu-data-residency'
};

export default entry;
