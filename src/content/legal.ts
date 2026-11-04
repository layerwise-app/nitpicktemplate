/**
 * Copy for /privacy and /terms. Plain language, short sections. Update the
 * dates when you change a policy.
 */

export type LegalPage = {
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const privacy: LegalPage = {
  title: 'Privacy',
  description:
    'How Fernhill Labs handles the code Nitpick reviews and the details you share with us.',
  updated: '2026-09-30',
  intro:
    'Fernhill Labs Inc. makes Nitpick. This page explains what we collect, why, and how long we keep it. If something here is unclear, write to us and we will fix the page.',
  sections: [
    {
      heading: 'Code we review',
      body: [
        'When a pull request opens, your code host sends us the diff and the context Nitpick needs to review it. We hold that code in memory for the length of the review and discard it when the comments post. We never write it to disk, keep it in logs, or use it to train models.',
        'Model calls run in the same region as your review, with providers that keep no copy of the input or the output.'
      ]
    },
    {
      heading: 'What we keep',
      body: [
        'We keep the comments Nitpick posted, the rule that raised each one, and whether it was applied, so we can show your team its review history. We keep account details: names, work email addresses, and billing information.'
      ]
    },
    {
      heading: 'Demo requests',
      body: [
        'When you book a demo we store your work email, company, team size, and code host, and use them only to arrange the demo. To limit abuse of the form we store a salted hash of your IP address, never the address itself, and clear hashes older than an hour as new requests arrive.'
      ]
    },
    {
      heading: 'Where data lives',
      body: [
        'Reviews run in the United States (Virginia) or the European Union (Frankfurt), whichever your organization chooses. Account data is stored in the United States.'
      ]
    },
    {
      heading: 'Your choices',
      body: [
        'You can ask for a copy of your data or for it to be deleted at any time. Removing Nitpick from your code host stops all reviews immediately.'
      ]
    }
  ]
};

export const terms: LegalPage = {
  title: 'Terms',
  description:
    'The terms for using Nitpick, the AI code reviewer from Fernhill Labs.',
  updated: '2026-09-30',
  intro:
    'These terms cover your use of Nitpick, made by Fernhill Labs Inc. of Toronto, Canada. Enterprise customers may have a signed agreement; where it differs, the signed agreement wins.',
  sections: [
    {
      heading: 'Your code stays yours',
      body: [
        'You keep every right to the code Nitpick reviews and to the suggestions it writes for you. You give us permission to process your code only to provide the review.'
      ]
    },
    {
      heading: 'Using Nitpick',
      body: [
        'Use Nitpick for your own repositories or ones you are allowed to manage. Don’t use it to break the law, to attack our systems, or to review code you have no right to share with us.'
      ]
    },
    {
      heading: 'Suggestions are suggestions',
      body: [
        'Nitpick is a second reviewer, not a guarantee. Read a suggestion before you apply it; you are responsible for what you merge.'
      ]
    },
    {
      heading: 'Plans and billing',
      body: [
        'Plans are billed per author per month. An author is anyone who opens a pull request in a billing month. You can cancel at any time and keep access until the end of the month you paid for.'
      ]
    },
    {
      heading: 'Availability',
      body: [
        'We work to keep Nitpick available and fast, and we post incidents as they happen. If reviews are delayed, your pull requests still work normally; they just wait for comments.'
      ]
    },
    {
      heading: 'Changes',
      body: [
        'If we change these terms in a way that matters, we will tell account owners by email at least 30 days before the change takes effect.'
      ]
    }
  ]
};
