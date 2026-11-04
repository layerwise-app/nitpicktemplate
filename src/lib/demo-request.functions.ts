import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { and, count, eq, gte, isNotNull, lt } from 'drizzle-orm';
import { db } from '~/db';
import { demoRequestAttempts, demoRequests } from '~/db/schema';
import {
  type DemoRequest,
  type DemoRequestInput,
  type DemoRequestStore,
  hashIp,
  RATE_LIMIT,
  submitDemoRequest
} from '~/lib/demo-request';
import { siteConfig } from '~/site.config';

declare global {
  namespace Cloudflare {
    interface Env {
      /** Optional secret that salts the IP hash for the form's rate limit. */
      IP_HASH_SALT?: string;
    }
  }
}

const d1Store: DemoRequestStore = {
  async countAttemptsSince(ipHash, since) {
    const [row] = await db
      .select({ value: count() })
      .from(demoRequestAttempts)
      .where(
        and(
          eq(demoRequestAttempts.ipHash, ipHash),
          gte(demoRequestAttempts.createdAt, since)
        )
      );
    return row?.value ?? 0;
  },
  async recordAttempt(ipHash, at) {
    const expired = new Date(at.getTime() - RATE_LIMIT.windowMs);
    await db.batch([
      db.delete(demoRequestAttempts).where(lt(demoRequestAttempts.createdAt, expired)),
      db.insert(demoRequestAttempts).values({ ipHash, createdAt: at })
    ]);
  },
  async insertRequest(request, at) {
    const [row] = await db
      .insert(demoRequests)
      .values({ ...request, createdAt: at })
      .onConflictDoNothing({ target: demoRequests.email })
      .returning({ id: demoRequests.id });
    return row?.id ?? null;
  },
  async countOwnerEmailsSince(since) {
    const [row] = await db
      .select({ value: count() })
      .from(demoRequests)
      .where(
        and(
          isNotNull(demoRequests.ownerNotifiedAt),
          gte(demoRequests.ownerNotifiedAt, since)
        )
      );
    return row?.value ?? 0;
  },
  async markOwnerNotified(id, at) {
    await db
      .update(demoRequests)
      .set({ ownerNotifiedAt: at })
      .where(eq(demoRequests.id, id));
  }
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Emails the site owner. The recipient always comes from the site config. */
async function notifyOwner(to: string, request: DemoRequest) {
  const rows: [string, string][] = [
    ['Work email', request.email],
    ['Company', request.company],
    ['Team size', request.teamSize],
    ['Code host', request.codeHost]
  ];
  const { error } = await env.EMAIL.send({
    to,
    subject: `Demo request: ${request.company} (${request.teamSize})`.slice(0, 200),
    text: [
      `New demo request for ${siteConfig.product}.`,
      '',
      ...rows.map(([label, value]) => `${label}: ${value}`)
    ].join('\n'),
    html: `<p>New demo request for ${escapeHtml(siteConfig.product)}.</p><table>${rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:2px 16px 2px 0;color:#666">${label}</td><td>${escapeHtml(value)}</td></tr>`
      )
      .join('')}</table>`
  });
  if (error) {
    console.warn(`[demo] owner email: ${error.code} ${error.message}`);
    return false;
  }
  return true;
}

function visitorIp(): string {
  const forwarded = getRequestHeader('x-forwarded-for')?.split(',')[0];
  return (
    getRequestHeader('cf-connecting-ip') ??
    forwarded?.trim() ??
    getRequestHeader('x-real-ip') ??
    'unknown'
  );
}

export const requestDemo = createServerFn({ method: 'POST' })
  .validator((input: DemoRequestInput) => ({
    email: input?.email,
    company: input?.company,
    teamSize: input?.teamSize,
    codeHost: input?.codeHost,
    website: input?.website
  }))
  .handler(async ({ data }) => {
    const salt = env.IP_HASH_SALT || `${siteConfig.product}-demo-rate-limit`;
    return submitDemoRequest(data, {
      store: d1Store,
      ipHash: await hashIp(visitorIp(), salt),
      now: new Date(),
      ownerEmail: siteConfig.ownerEmail,
      notifyOwner
    });
  });
