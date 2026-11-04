import type { ChangelogEntry } from '../types';

const entry: ChangelogEntry = {
  slug: 'multi-file-suggestions',
  title: 'Suggestions that span files',
  date: '2026-10-28',
  summary:
    'When a fix touches more than one file, Nitpick now proposes it as one suggestion. Apply it and both changes land in a single commit.',
  body: [
    'Some fixes don’t fit on one line range. Moving a query into a shared helper, for example, changes the route and the helper at once. Until now Nitpick described those fixes in words and left the edit to the author.',
    'Suggestions can now carry a change to up to four files. The comment shows each file as a tab with its own diff, and applying it creates one commit with every change, so the history stays readable.'
  ],
  changes: [
    'Suggestions can include up to four files',
    'Each file is shown as a tab inside the comment',
    'Applying creates one commit for all files'
  ],
  screen: 'multi-file-suggestions'
};

export default entry;
