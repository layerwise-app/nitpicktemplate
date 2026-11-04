import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Change a table here, then run `pnpm run db:generate --name <what_changed>`
// and `pnpm run db:migrate`. Migrations are applied to the production
// database on publish.

/** One row per "Book a demo" submission. Emails are stored lowercase. */
export const demoRequests = sqliteTable('demo_requests', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  company: text('company').notNull(),
  teamSize: text('team_size').notNull(),
  codeHost: text('code_host').notNull(),
  /** When the owner was emailed about this request; null if not emailed. */
  ownerNotifiedAt: integer('owner_notified_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

/**
 * Form submissions per visitor, for the rate limit. `ip_hash` is a salted
 * SHA-256 of the IP address; raw addresses are never stored. Rows older than
 * the rate-limit window are deleted as new submissions arrive.
 */
export const demoRequestAttempts = sqliteTable(
  'demo_request_attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ipHash: text('ip_hash').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    index('demo_request_attempts_ip_hash_idx').on(
      table.ipHash,
      table.createdAt
    ),
    index('demo_request_attempts_created_at_idx').on(table.createdAt)
  ]
);

/**
 * Values the server generates for its own use, such as the salt for the demo
 * form's IP hashes (`ip_hash_salt`). Created on first use and never sent to
 * the browser. Deleting a row makes a new value on next use.
 */
export const appSecrets = sqliteTable('app_secrets', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});
