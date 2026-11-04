import { describe, expect, it, vi } from 'vitest';
import {
  type DemoRequest,
  type DemoRequestDeps,
  type DemoRequestStore,
  hashIp,
  isFreeEmailDomain,
  OWNER_EMAIL_DAILY_CAP,
  RATE_LIMIT,
  submitDemoRequest,
  validateDemoRequest,
  validateEmail
} from './demo-request';

const valid = {
  email: 'priya@quayside.dev',
  company: 'Quayside',
  teamSize: '21–100',
  codeHost: 'GitHub',
  website: ''
};

function memoryStore() {
  const attempts: { ipHash: string; at: Date }[] = [];
  const rows: (DemoRequest & { id: string; at: Date; notifiedAt?: Date })[] =
    [];
  const store: DemoRequestStore = {
    async countAttemptsSince(ipHash, since) {
      return attempts.filter((a) => a.ipHash === ipHash && a.at >= since)
        .length;
    },
    async recordAttempt(ipHash, at) {
      attempts.push({ ipHash, at });
    },
    async insertRequest(request, at) {
      if (rows.some((row) => row.email === request.email)) return null;
      const id = `row-${rows.length + 1}`;
      rows.push({ ...request, id, at });
      return id;
    },
    async countOwnerEmailsSince(since) {
      return rows.filter((row) => row.notifiedAt && row.notifiedAt >= since)
        .length;
    },
    async markOwnerNotified(id, at) {
      const row = rows.find((r) => r.id === id);
      if (row) row.notifiedAt = at;
    }
  };
  return { store, attempts, rows };
}

function deps(
  overrides: Partial<DemoRequestDeps> = {}
): DemoRequestDeps & ReturnType<typeof memoryStore> {
  const memory = memoryStore();
  return {
    ...memory,
    ipHash: 'hash-a',
    now: new Date('2026-11-05T15:00:00Z'),
    ownerEmail: '',
    notifyOwner: vi.fn(async () => true),
    ...overrides
  };
}

describe('email rules', () => {
  it('accepts a work address and lowercases it', () => {
    const result = validateDemoRequest({ ...valid, email: ' Priya@Quayside.DEV ' });
    expect(result).toEqual({
      ok: true,
      data: {
        email: 'priya@quayside.dev',
        company: 'Quayside',
        teamSize: '21–100',
        codeHost: 'GitHub'
      }
    });
  });

  it.each([
    'someone@gmail.com',
    'SOMEONE@GMAIL.COM',
    'a@outlook.com',
    'a@proton.me',
    'a@mail.yahoo.com'
  ])('rejects the free address %s with a clear message', (email) => {
    expect(isFreeEmailDomain(email)).toBe(true);
    expect(validateEmail(email)).toMatch(/work email/);
  });

  it('names the rejected domain', () => {
    expect(validateEmail('a@hotmail.com')).toContain('hotmail.com');
  });

  it.each(['', 'not-an-email', 'a@b', 'a b@company.com'])(
    'rejects the malformed address %j',
    (email) => {
      expect(validateEmail(email)).not.toBeNull();
    }
  );

  it('does not treat lookalike work domains as free', () => {
    expect(isFreeEmailDomain('a@notgmail.com')).toBe(false);
    expect(isFreeEmailDomain('a@gmail.company.com')).toBe(false);
  });
});

describe('field rules', () => {
  it('requires every field and only offers the listed options', () => {
    const result = validateDemoRequest({
      email: 'a@company.com',
      company: '   ',
      teamSize: '7',
      codeHost: 'SourceForge'
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        'codeHost',
        'company',
        'teamSize'
      ]);
    }
  });

  it.each(['1–20', '21–100', '101–500', '500+'])(
    'accepts the team size %s',
    (teamSize) => {
      expect(validateDemoRequest({ ...valid, teamSize }).ok).toBe(true);
    }
  );

  it.each(['GitHub', 'GitLab', 'Bitbucket'])('accepts the host %s', (codeHost) => {
    expect(validateDemoRequest({ ...valid, codeHost }).ok).toBe(true);
  });

  it('ignores values that are not strings', () => {
    const result = validateDemoRequest({
      email: ['a@company.com'],
      company: { name: 'x' },
      teamSize: 3,
      codeHost: null
    });
    expect(result.ok).toBe(false);
  });
});

describe('submitting', () => {
  it('saves a valid request', async () => {
    const d = deps();
    await expect(submitDemoRequest(valid, d)).resolves.toEqual({
      status: 'ok',
      email: 'priya@quayside.dev'
    });
    expect(d.rows).toHaveLength(1);
    expect(d.rows[0]).toMatchObject({ company: 'Quayside', codeHost: 'GitHub' });
  });

  it('says "already on the list" for the same email twice and adds no row', async () => {
    const d = deps();
    await submitDemoRequest(valid, d);
    const again = await submitDemoRequest(
      { ...valid, email: 'PRIYA@quayside.dev', company: 'Other' },
      d
    );
    expect(again).toEqual({ status: 'duplicate', email: 'priya@quayside.dev' });
    expect(d.rows).toHaveLength(1);
  });

  it('answers a filled honeypot like a success but saves nothing', async () => {
    const d = deps();
    const result = await submitDemoRequest({ ...valid, website: 'http://spam' }, d);
    expect(result.status).toBe('ok');
    expect(d.rows).toHaveLength(0);
  });

  it('returns field errors without saving', async () => {
    const d = deps();
    const result = await submitDemoRequest({ ...valid, email: 'x@gmail.com' }, d);
    expect(result.status).toBe('invalid');
    expect(d.rows).toHaveLength(0);
  });
});

describe('rate limit', () => {
  it(`allows ${RATE_LIMIT.max} submissions per visitor per hour, then refuses`, async () => {
    const d = deps();
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      const result = await submitDemoRequest(
        { ...valid, email: `person${i}@quayside.dev` },
        d
      );
      expect(result.status).toBe('ok');
    }
    const blocked = await submitDemoRequest(
      { ...valid, email: 'late@quayside.dev' },
      d
    );
    expect(blocked).toEqual({ status: 'rate_limited' });
    expect(d.rows).toHaveLength(RATE_LIMIT.max);
  });

  it('counts invalid and honeypot submissions too', async () => {
    const d = deps();
    for (let i = 0; i < 3; i++) await submitDemoRequest({ email: 'bad' }, d);
    for (let i = 0; i < 2; i++) {
      await submitDemoRequest({ ...valid, website: 'x' }, d);
    }
    expect(await submitDemoRequest(valid, d)).toEqual({ status: 'rate_limited' });
  });

  it('keys the limit by visitor and resets after an hour', async () => {
    const d = deps();
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      await submitDemoRequest({ ...valid, email: `p${i}@quayside.dev` }, d);
    }
    const otherVisitor = await submitDemoRequest(
      { ...valid, email: 'other@quayside.dev' },
      { ...d, ipHash: 'hash-b' }
    );
    expect(otherVisitor.status).toBe('ok');

    const later = new Date(d.now.getTime() + RATE_LIMIT.windowMs + 1000);
    const nextHour = await submitDemoRequest(
      { ...valid, email: 'next@quayside.dev' },
      { ...d, now: later }
    );
    expect(nextHour.status).toBe('ok');
  });

  it('hashes the IP with a salt and never returns the raw address', async () => {
    const a = await hashIp('203.0.113.7', 'salt-one');
    const b = await hashIp('203.0.113.7', 'salt-two');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain('203.0.113.7');
    expect(a).not.toBe(b);
    expect(await hashIp('203.0.113.7', 'salt-one')).toBe(a);
  });
});

describe('owner email', () => {
  it('sends nothing when ownerEmail is empty', async () => {
    const d = deps();
    await submitDemoRequest(valid, d);
    expect(d.notifyOwner).not.toHaveBeenCalled();
  });

  it('emails only the owner, never the visitor', async () => {
    const d = deps({ ownerEmail: 'owner@fernhill.dev' });
    await submitDemoRequest(valid, d);
    expect(d.notifyOwner).toHaveBeenCalledTimes(1);
    expect(d.notifyOwner).toHaveBeenCalledWith(
      'owner@fernhill.dev',
      expect.objectContaining({ email: 'priya@quayside.dev' })
    );
  });

  it('does not email for duplicates, invalid requests, or the honeypot', async () => {
    const d = deps({ ownerEmail: 'owner@fernhill.dev' });
    await submitDemoRequest(valid, d);
    await submitDemoRequest(valid, d);
    await submitDemoRequest({ ...valid, email: 'x@gmail.com' }, d);
    await submitDemoRequest({ ...valid, email: 'bot@quayside.dev', website: 'x' }, d);
    expect(d.notifyOwner).toHaveBeenCalledTimes(1);
  });

  it(`stops emailing after ${OWNER_EMAIL_DAILY_CAP} a day but keeps saving`, async () => {
    const d = deps({ ownerEmail: 'owner@fernhill.dev' });
    for (let i = 0; i < OWNER_EMAIL_DAILY_CAP + 3; i++) {
      const result = await submitDemoRequest(
        { ...valid, email: `p${i}@quayside.dev` },
        { ...d, ipHash: `visitor-${i}` }
      );
      expect(result.status).toBe('ok');
    }
    expect(d.notifyOwner).toHaveBeenCalledTimes(OWNER_EMAIL_DAILY_CAP);
    expect(d.rows).toHaveLength(OWNER_EMAIL_DAILY_CAP + 3);

    const tomorrow = new Date('2026-11-06T00:00:01Z');
    await submitDemoRequest(
      { ...valid, email: 'tomorrow@quayside.dev' },
      { ...d, ipHash: 'visitor-next-day', now: tomorrow }
    );
    expect(d.notifyOwner).toHaveBeenCalledTimes(OWNER_EMAIL_DAILY_CAP + 1);
  });

  it('keeps the request when the email fails', async () => {
    const d = deps({
      ownerEmail: 'owner@fernhill.dev',
      notifyOwner: vi.fn(async () => {
        throw new Error('send_failed');
      })
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(submitDemoRequest(valid, d)).resolves.toMatchObject({
      status: 'ok'
    });
    expect(d.rows).toHaveLength(1);
    warn.mockRestore();
  });

  it('does not count failed sends toward the daily cap', async () => {
    const d = deps({
      ownerEmail: 'owner@fernhill.dev',
      notifyOwner: vi.fn(async () => false)
    });
    await submitDemoRequest(valid, d);
    expect(d.rows[0].notifiedAt).toBeUndefined();
  });
});
