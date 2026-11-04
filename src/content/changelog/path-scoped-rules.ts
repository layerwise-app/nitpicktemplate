import type { ChangelogEntry } from '../types';

const entry: ChangelogEntry = {
  slug: 'path-scoped-rules',
  title: 'Scope rules to paths',
  date: '2026-10-14',
  summary:
    'Every rule in .nitpick.yml now accepts paths and ignore globs, so a rule can apply to your routes and skip your scripts.',
  body: [
    'A monorepo rarely wants one set of rules everywhere. Missing tests matter for API routes and not for a one-off migration script; dead code matters in the app and not in generated clients.',
    'Each rule now takes paths and ignore lists. Nitpick shows which rule matched in every comment, and the check summary lists the files each rule covered, so it is easy to see why something was or wasn’t flagged.'
  ],
  changes: [
    'paths and ignore globs on every rule',
    'The matching rule and glob are named in each comment',
    'The check summary lists the files each rule covered'
  ],
  screen: 'path-scoped-rules'
};

export default entry;
