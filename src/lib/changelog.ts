import type { ChangelogEntry } from '~/content/types';

// Every file in `src/content/changelog/` is an entry. Add a file to publish
// one; its page, the list, the sitemap, and the home page link pick it up.
const modules = import.meta.glob<{ default: ChangelogEntry }>(
  '../content/changelog/*.ts',
  { eager: true }
);

/** Newest first. */
export const changelog: ChangelogEntry[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getChangelogEntry(slug: string) {
  const index = changelog.findIndex((entry) => entry.slug === slug);
  if (index === -1) return null;
  return {
    entry: changelog[index],
    newer: changelog[index - 1] ?? null,
    older: changelog[index + 1] ?? null
  };
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});

export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}
