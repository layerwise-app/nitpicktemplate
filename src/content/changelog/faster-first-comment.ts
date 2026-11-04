import type { ChangelogEntry } from '../types';

const entry: ChangelogEntry = {
  slug: 'faster-first-comment',
  title: 'First comment in 38 seconds',
  date: '2026-08-12',
  summary:
    'Median time from opening a pull request to Nitpick’s first comment dropped from 71 seconds to 38.',
  body: [
    'Most of a review used to be waiting: for the clone, for dependency metadata, for the model. Nitpick now reads only the files a diff touches and the symbols they use, and starts commenting on the first file while it reads the rest.',
    'The median review now posts its first comment 38 seconds after the pull request opens. The slowest 5% went from four minutes to under two.'
  ],
  changes: [
    'Median first comment: 71s → 38s',
    '95th percentile: 4m 02s → 1m 51s',
    'Comments post file by file as the review runs'
  ],
  screen: 'faster-first-comment'
};

export default entry;
