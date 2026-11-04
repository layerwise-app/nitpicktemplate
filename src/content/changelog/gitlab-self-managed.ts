import type { ChangelogEntry } from '../types';

const entry: ChangelogEntry = {
  slug: 'gitlab-self-managed',
  title: 'Self-managed GitLab',
  date: '2026-08-27',
  summary:
    'Nitpick now connects to self-managed GitLab 16.0 and later, behind your firewall or on the public internet.',
  body: [
    'Connect an instance with its URL and a group access token. Nitpick verifies the version and webhook delivery before it reviews anything, and shows the result on the connection page.',
    'For instances that aren’t reachable from the internet, a small relay runs inside your network and keeps one outbound connection open. No inbound ports are needed.'
  ],
  changes: [
    'Self-managed GitLab 16.0 and later',
    'Connection check for version, token scopes, and webhooks',
    'Outbound-only relay for private networks'
  ],
  screen: 'gitlab-self-managed'
};

export default entry;
