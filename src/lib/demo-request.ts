/**
 * Rules for the "Book a demo" form, shared by the browser (instant feedback)
 * and the server (the real check). Nothing here touches the database or
 * email directly, so the rules can be tested on their own; see
 * `demo-request.test.ts`.
 */

export const TEAM_SIZES = ['1–20', '21–100', '101–500', '500+'] as const;
export const CODE_HOSTS = ['GitHub', 'GitLab', 'Bitbucket'] as const;

export type TeamSize = (typeof TEAM_SIZES)[number];
export type CodeHost = (typeof CODE_HOSTS)[number];

export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };
export const OWNER_EMAIL_DAILY_CAP = 100;

/** Personal mailbox providers. Demo requests need a work address. */
export const FREE_EMAIL_DOMAINS = new Set([
  '163.com',
  '126.com',
  'aol.com',
  'fastmail.com',
  'gmail.com',
  'gmx.com',
  'gmx.de',
  'gmx.net',
  'googlemail.com',
  'hotmail.co.uk',
  'hotmail.com',
  'hotmail.fr',
  'icloud.com',
  'inbox.com',
  'live.com',
  'mac.com',
  'mail.com',
  'mail.ru',
  'me.com',
  'msn.com',
  'outlook.com',
  'pm.me',
  'proton.me',
  'protonmail.com',
  'qq.com',
  'rocketmail.com',
  'tutanota.com',
  'web.de',
  'yahoo.co.uk',
  'yahoo.com',
  'yahoo.fr',
  'yandex.com',
  'yandex.ru',
  'ymail.com',
  'zoho.com'
]);

export type DemoRequestInput = {
  email?: unknown;
  company?: unknown;
  teamSize?: unknown;
  codeHost?: unknown;
  /** Honeypot. Hidden from people; bots fill it in. */
  website?: unknown;
};

export type DemoRequest = {
  email: string;
  company: string;
  teamSize: TeamSize;
  codeHost: CodeHost;
};

export type FieldErrors = Partial<Record<keyof DemoRequest, string>>;

export type DemoRequestResult =
  | { status: 'ok'; email: string }
  | { status: 'duplicate'; email: string }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'rate_limited' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** True for gmail.com and also for subdomains such as mail.yahoo.com. */
export function isFreeEmailDomain(email: string): boolean {
  const domain = normalizeEmail(email).split('@')[1] ?? '';
  if (FREE_EMAIL_DOMAINS.has(domain)) return true;
  for (const free of FREE_EMAIL_DOMAINS) {
    if (domain.endsWith(`.${free}`)) return true;
  }
  return false;
}

export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) return 'Enter your work email.';
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return 'Enter an email address like you@company.com.';
  }
  if (isFreeEmailDomain(email)) {
    const domain = email.split('@')[1];
    return `Please use your work email. We can’t book demos for personal addresses like ${domain}.`;
  }
  return null;
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

export function validateDemoRequest(
  input: DemoRequestInput
): { ok: true; data: DemoRequest } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const emailError = validateEmail(asString(input.email));
  if (emailError) errors.email = emailError;

  const company = asString(input.company).trim().replace(/\s+/g, ' ');
  if (!company) errors.company = 'Enter your company’s name.';
  else if (company.length > 120) {
    errors.company = 'Keep the company name under 120 characters.';
  }

  const teamSize = asString(input.teamSize);
  if (!TEAM_SIZES.includes(teamSize as TeamSize)) {
    errors.teamSize = 'Choose your team size.';
  }

  const codeHost = asString(input.codeHost);
  if (!CODE_HOSTS.includes(codeHost as CodeHost)) {
    errors.codeHost = 'Choose where your code lives.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      email: normalizeEmail(asString(input.email)),
      company,
      teamSize: teamSize as TeamSize,
      codeHost: codeHost as CodeHost
    }
  };
}

/** SHA-256 of the salted IP, hex encoded. The raw address is never stored. */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Storage the submission flow needs. The server backs it with D1. */
export type DemoRequestStore = {
  countAttemptsSince(ipHash: string, since: Date): Promise<number>;
  recordAttempt(ipHash: string, at: Date): Promise<void>;
  /** Returns the new row's id, or null when the email is already saved. */
  insertRequest(request: DemoRequest, at: Date): Promise<string | null>;
  countOwnerEmailsSince(since: Date): Promise<number>;
  markOwnerNotified(id: string, at: Date): Promise<void>;
};

export type DemoRequestDeps = {
  store: DemoRequestStore;
  ipHash: string;
  now: Date;
  /** Empty means no notification email. */
  ownerEmail: string;
  /** Sends one email to the owner. Resolves true when it was accepted. */
  notifyOwner(to: string, request: DemoRequest): Promise<boolean>;
};

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

/**
 * The whole server-side flow: honeypot, rate limit, validation, duplicate
 * check, save, then an optional email to the owner. The visitor is never
 * emailed: the only recipient is `ownerEmail` from the site config.
 */
export async function submitDemoRequest(
  input: DemoRequestInput,
  deps: DemoRequestDeps
): Promise<DemoRequestResult> {
  const { store, ipHash, now } = deps;

  const since = new Date(now.getTime() - RATE_LIMIT.windowMs);
  const attempts = await store.countAttemptsSince(ipHash, since);
  if (attempts >= RATE_LIMIT.max) return { status: 'rate_limited' };
  await store.recordAttempt(ipHash, now);

  // Bots that fill the hidden field get the same answer as people, and nothing is saved.
  if (asString(input.website).trim() !== '') {
    return { status: 'ok', email: normalizeEmail(asString(input.email)) };
  }

  const result = validateDemoRequest(input);
  if (!result.ok) return { status: 'invalid', errors: result.errors };

  const id = await store.insertRequest(result.data, now);
  if (!id) return { status: 'duplicate', email: result.data.email };

  const ownerEmail = deps.ownerEmail.trim();
  if (ownerEmail) {
    try {
      const sentToday = await store.countOwnerEmailsSince(startOfUtcDay(now));
      if (sentToday < OWNER_EMAIL_DAILY_CAP) {
        const sent = await deps.notifyOwner(ownerEmail, result.data);
        if (sent) await store.markOwnerNotified(id, now);
      }
    } catch (error) {
      // The request is saved; a failed notification must not fail it.
      console.warn('[demo] owner notification failed', error);
    }
  }

  return { status: 'ok', email: result.data.email };
}
