import type { DiffFile, ScreenMedia, Severity } from './types';

/**
 * Copy and data for every section of the home page, in page order. Change a
 * headline, a number, a quote, or a price here; the components only lay it
 * out. The hero pull request lives in `demo-pr.ts`.
 */

// 1. Hero ------------------------------------------------------------------

export const hero = {
  /** Small link above the headline to the newest changelog entry. Empty hides it. */
  announcementLabel: 'New',
  /** A line break (\n) sets where the headline breaks on wide screens. */
  title: 'Every pull request,\nreviewed in under a minute.',
  body: 'Nitpick reads the diff the moment it opens, comments on the exact lines that need a second look, and writes the fix so the author can apply it in one click.',
  note: 'For GitHub, GitLab, and Bitbucket.'
};

// 2. Customers ---------------------------------------------------------------

export const customers = {
  label: 'Reviewing pull requests at',
  /**
   * Names with a drawn wordmark: Quayside, Northbeam Freight, Halcyon Health,
   * Tallowtree, Orrery, Brightwork. Any other name is set in type.
   */
  names: [
    'Quayside',
    'Northbeam Freight',
    'Halcyon Health',
    'Tallowtree',
    'Orrery',
    'Brightwork'
  ]
};

// 3. What it catches -------------------------------------------------------

export type RuleId =
  | 'n-plus-one'
  | 'missing-auth'
  | 'unhandled-errors'
  | 'secrets'
  | 'route-tests'
  | 'dead-code';

export const rules = {
  id: 'rules',
  eyebrow: 'What it catches',
  title: 'Six rules, each one a switch.',
  body: 'Every finding is tied to the rule that raised it. Turn a rule off and the review below changes with it, the same way it would on your own pull requests.',
  list: [
    {
      id: 'n-plus-one',
      name: 'N+1 queries',
      description: 'Queries inside loops that should be one batched call.'
    },
    {
      id: 'missing-auth',
      name: 'Missing auth checks',
      description: 'Handlers that read or change data without a session.'
    },
    {
      id: 'unhandled-errors',
      name: 'Unhandled errors',
      description: 'Calls that can fail with nothing there to catch them.'
    },
    {
      id: 'secrets',
      name: 'Secrets in code',
      description: 'Keys, tokens, and passwords committed to the repo.'
    },
    {
      id: 'route-tests',
      name: 'Missing tests for new routes',
      description: 'New endpoints that no test ever calls.'
    },
    {
      id: 'dead-code',
      name: 'Dead code',
      description: 'Functions, branches, and exports nothing uses.'
    }
  ] satisfies { id: RuleId; name: string; description: string }[],
  sample: {
    repo: 'northbeam/dispatch',
    number: 911,
    title: 'Export shipments as CSV',
    file: {
      path: 'src/routes/shipments/export.ts',
      status: 'added',
      language: 'ts',
      lines: [
        { text: 'import { Router } from "express";' },
        { text: 'import { db } from "../db";' },
        { text: 'import { putObject } from "../storage";' },
        { text: 'import { toCsvRow } from "./csv";' },
        { text: '' },
        { text: 'const BUCKET_KEY = "nbf_live_9f2c41d7e8a3b6c0";' },
        { text: '' },
        { text: 'export const router = Router();' },
        { text: '' },
        { text: 'router.post("/shipments/export", async (req, res) => {' },
        { text: '  const shipments = await db.shipment.findMany({' },
        { text: '    where: { accountId: req.body.accountId },' },
        { text: '  });' },
        { text: '' },
        { text: '  const rows = [];' },
        { text: '  for (const s of shipments) {' },
        { text: '    const carrier = await db.carrier.find(s.carrierId);' },
        { text: '    rows.push(toCsvRow(s, carrier));' },
        { text: '  }' },
        { text: '' },
        { text: '  const url = await putObject(BUCKET_KEY, rows.join("\\n"));' },
        { text: '  res.json({ url });' },
        { text: '});' },
        { text: '' },
        { text: 'function legacyHeader() {' },
        { text: '  return "id,carrier,eta,status";' },
        { text: '}' }
      ]
    } satisfies DiffFile,
    /** One finding per rule. `line` is where the note appears (1-based). */
    findings: [
      {
        rule: 'secrets',
        line: 6,
        severity: 'high',
        title: 'Live storage key in source',
        body: 'Move it to a secret and rotate it. It is already in this branch’s history.'
      },
      {
        rule: 'route-tests',
        line: 10,
        severity: 'low',
        title: 'New route has no test',
        body: 'Nothing in test/ calls POST /shipments/export.'
      },
      {
        rule: 'missing-auth',
        line: 12,
        severity: 'high',
        title: 'accountId is taken from the request body',
        body: 'No session check, so any caller can export any account’s shipments.'
      },
      {
        rule: 'n-plus-one',
        line: 17,
        severity: 'medium',
        title: 'One carrier query per shipment',
        body: 'An export of 2,000 shipments runs 2,001 queries. Fetch carriers once.'
      },
      {
        rule: 'unhandled-errors',
        line: 21,
        severity: 'medium',
        title: 'Upload failure isn’t handled',
        body: 'If putObject rejects, the request hangs until it times out.'
      },
      {
        rule: 'dead-code',
        line: 25,
        severity: 'low',
        title: 'legacyHeader is never called',
        body: 'No references anywhere in the repo. Safe to delete.'
      }
    ] satisfies {
      rule: RuleId;
      line: number;
      severity: Severity;
      title: string;
      body: string;
    }[]
  },
  /** Replace the drawn rules panel with an image or a video. */
  media: null as ScreenMedia | null
};

// 4. Timeline ----------------------------------------------------------------

export type TimelineState =
  | 'opened'
  | 'reviewed'
  | 'fixed'
  | 'approved'
  | 'merged';

export const timeline = {
  id: 'timeline',
  eyebrow: 'Start to merge',
  title: 'Thirteen minutes from opened to merged.',
  body: 'The same pull request, played back step by step.',
  scrollHint: 'Scroll to move the clock',
  humanReviewer: 'Tomás Ferreira',
  mergeCommit: 'a3f9c1e',
  steps: [
    {
      time: '10:02:14',
      label: 'Opened',
      title: 'Priya opens #2184',
      body: 'Forty new lines across a route and a component.',
      event: 'priya-raman opened this pull request',
      state: 'opened'
    },
    {
      time: '10:02:52',
      label: 'Reviewed',
      title: 'Nitpick reviews it in 38 seconds',
      body: 'Three comments on the exact lines. Both high-severity ones carry a fix.',
      event: 'nitpick reviewed: 3 issues, 2 suggested fixes',
      state: 'reviewed'
    },
    {
      time: '10:09:30',
      label: 'Fixes pushed',
      title: 'Both suggestions applied',
      body: 'Priya applies the two fixes and adds the empty state. One commit.',
      event: 'priya-raman pushed 1 commit: apply suggestions, add empty state',
      state: 'fixed'
    },
    {
      time: '10:14:05',
      label: 'Approved',
      title: 'Approved by Tomás Ferreira',
      body: 'A human reviewer reads a smaller, cleaner diff and signs off.',
      event: 'tomas-ferreira approved these changes',
      state: 'approved'
    },
    {
      time: '10:15:41',
      label: 'Merged',
      title: 'Merged into main',
      body: 'Checks are green and nothing is left to nitpick.',
      event: 'priya-raman merged commit a3f9c1e into main',
      state: 'merged'
    }
  ] satisfies {
    time: string;
    label: string;
    title: string;
    body: string;
    event: string;
    state: TimelineState;
  }[],
  /** Replace the drawn timeline screen with an image or a video. */
  media: null as ScreenMedia | null
};

// 5. Fits your workflow ------------------------------------------------------

export const workflow = {
  id: 'workflow',
  eyebrow: 'Fits your workflow',
  title: 'Comments land where your team already reviews.',
  body: 'Install Nitpick on GitHub, GitLab, or Bitbucket, in the cloud or on your own instance. It comments in the thread, posts a check, and reads its rules from a file in your repository.',
  hosts: [
    {
      id: 'github',
      name: 'GitHub',
      install: 'GitHub App · Cloud and Enterprise Server',
      request: 'Pull request',
      ref: '#2184',
      check: 'Check run',
      checkResult: '1 low-severity issue, nothing blocking'
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      install: 'Group integration · GitLab.com and self-managed',
      request: 'Merge request',
      ref: '!2184',
      check: 'Pipeline job',
      checkResult: 'Passed with 1 low-severity issue'
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      install: 'Marketplace app · Cloud and Data Center',
      request: 'Pull request',
      ref: '#2184',
      check: 'Build status',
      checkResult: 'Successful, 1 low-severity issue'
    }
  ],
  points: [
    'Review comments on the exact lines, in the thread your team already reads.',
    'A check that passes once nothing high-severity is left.',
    'Rules in a YAML file, reviewed like any other change.'
  ],
  configFile: '.nitpick.yml',
  config: `# .nitpick.yml
version: 1

review:
  on: [opened, synchronize]
  min_severity: low
  suggest_fixes: true

rules:
  n-plus-one: on
  missing-auth: on
  unhandled-errors: on
  secrets: { severity: high, block_merge: true }
  route-tests: { paths: ["src/routes/**"] }
  dead-code: off

ignore:
  - "**/*.generated.ts"
  - "vendor/**"`,
  /** Replace the drawn comment preview with an image or a video. */
  media: null as ScreenMedia | null
};

// 6. Security --------------------------------------------------------------

export const security = {
  id: 'security',
  eyebrow: 'Security',
  title: 'Your code is read, never kept.',
  body: 'Nitpick needs a diff for about a minute. It holds it in memory for that long and no longer.',
  points: [
    {
      title: 'Never stored or used for training',
      body: 'Diffs stay in memory for the length of a review and are discarded when the comments post. Model calls run with zero data retention.'
    },
    {
      title: 'SOC 2 Type II',
      body: 'Audited every year by an independent firm. The latest report is available under NDA.'
    },
    {
      title: 'Single-tenant option',
      body: 'An isolated deployment with its own encryption keys and network, on the Enterprise plan.'
    },
    {
      title: 'Data residency in the US or EU',
      body: 'Reviews run in Virginia or Frankfurt, and code never leaves the region you choose.'
    }
  ],
  diagram: {
    title: 'Where your code goes during a review',
    host: 'Your code host',
    hostNote: 'GitHub · GitLab · Bitbucket',
    inbound: 'Diff and context, TLS 1.3',
    worker: 'Review worker',
    workerNote: 'In memory, in your region',
    model: 'Model',
    modelNote: 'Zero retention',
    outbound: 'Comments and a check',
    discard: 'Discarded when the review posts',
    nothing: 'No disk · No logs of code · No training',
    regions: ['US · Virginia', 'EU · Frankfurt']
  }
};

// 7. Numbers ---------------------------------------------------------------

export const numbers = {
  id: 'numbers',
  eyebrow: 'In numbers',
  items: [
    { value: '38', unit: 's', label: 'Median time from opened to first review' },
    { value: '61', unit: '%', label: 'Of suggested fixes applied by the author' },
    { value: '4.2', unit: 'M', label: 'Pull requests reviewed so far' }
  ],
  note: 'Across all customers. Median and apply rate over the last 90 days.'
};

// 8. Quotes ------------------------------------------------------------------

export const quotes = {
  id: 'quotes',
  eyebrow: 'From engineering leads',
  items: [
    {
      quote:
        'Our senior engineers stopped leaving the same five comments on every pull request. Nitpick leaves them in the first minute, with the fix attached, and people apply it.',
      name: 'Hannah Okafor',
      title: 'Director of Engineering',
      company: 'Northbeam Freight'
    },
    {
      quote:
        'The auth rule caught a route that would have served patient records to anyone with the URL. It was in staging for eleven minutes.',
      name: 'Daniel Reyes',
      title: 'Head of Platform',
      company: 'Halcyon Health'
    },
    {
      quote:
        'It is quiet. Three comments, not thirty. So when Nitpick flags something, the team actually reads it.',
      name: 'Mei Lindqvist',
      title: 'Engineering Manager',
      company: 'Orrery'
    }
  ]
};

// 9. Pricing ---------------------------------------------------------------

export const pricing = {
  id: 'pricing',
  eyebrow: 'Pricing',
  title: 'Priced per author, not per seat.',
  body: 'An author is anyone who opens a pull request in a month. Reviewers, approvers, and bots are free.',
  plans: [
    {
      name: 'Team',
      price: '$24',
      period: 'per author / month',
      description: 'For teams that want every pull request reviewed.',
      features: [
        'Unlimited repositories',
        'All six review rules',
        'One-click suggested fixes',
        'GitHub, GitLab, and Bitbucket Cloud'
      ],
      highlighted: false
    },
    {
      name: 'Business',
      price: '$40',
      period: 'per author / month',
      description: 'For companies with an identity provider and auditors.',
      features: [
        'Everything in Team',
        'SSO with SAML or OIDC',
        'Audit log with export',
        'Self-managed GitLab and Bitbucket Data Center'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Talk to us',
      period: '',
      description: 'For security reviews, regions, and isolation.',
      features: [
        'Single-tenant deployment',
        'US or EU data residency',
        'Security review and DPA',
        'A named support engineer'
      ],
      highlighted: false
    }
  ]
};

// 10. Book a demo ------------------------------------------------------------

export const demo = {
  eyebrow: 'Book a demo',
  title: 'See Nitpick review your own code.',
  body: 'Thirty minutes with an engineer from our team. We install it on a repository you choose and review your last ten pull requests together.',
  points: [
    'No code leaves your region',
    'Set up in about five minutes',
    'Free for 14 days after the call'
  ],
  fields: {
    email: { label: 'Work email', placeholder: 'you@company.com' },
    company: { label: 'Company', placeholder: 'Company name' },
    teamSize: { label: 'Team size', hint: 'Engineers who open pull requests' },
    codeHost: { label: 'Code host' }
  },
  submitting: 'Booking…',
  success: {
    title: 'You’re on the list.',
    body: 'Someone from our team will reach out to {email} within one business day to pick a time.'
  },
  duplicate: {
    title: 'You’re already on the list.',
    body: 'We have a request from {email}. Someone from our team will be in touch within one business day.'
  },
  rateLimited:
    'That’s a lot of requests from one network. Please try again in an hour.',
  networkError:
    'We couldn’t send your request. Your details are still here, so check your connection and try again.',
  privacy: 'We use these details only to arrange the demo.'
};
