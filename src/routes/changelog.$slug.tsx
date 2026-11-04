import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ChangelogScreen } from '~/components/screens/changelog';
import { SmartLink } from '~/components/site/SmartLink';
import { formatDate, getChangelogEntry } from '~/lib/changelog';
import { ogImage, siteUrl } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/changelog/$slug')({
  loader: ({ params }) => {
    const found = getChangelogEntry(params.slug);
    if (!found) throw notFound();
    return found;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return seo({ title: `Page not found · ${siteConfig.product}`, noindex: true });
    const { entry } = loaderData;
    return seo({
      title: `${entry.title} · ${siteConfig.product} changelog`,
      description: entry.summary,
      path: `/changelog/${params.slug}`,
      image: ogImage(`changelog/${entry.slug}`),
      imageAlt: entry.title,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: entry.title,
        description: entry.summary,
        datePublished: entry.date,
        image: siteUrl(ogImage(`changelog/${entry.slug}`)),
        url: siteUrl(`/changelog/${entry.slug}`),
        author: { '@type': 'Organization', name: siteConfig.company },
        publisher: { '@type': 'Organization', name: siteConfig.company }
      }
    });
  },
  component: ChangelogEntryPage
});

function ChangelogEntryPage() {
  const { entry, newer, older } = Route.useLoaderData();
  return (
    <article className='mx-auto max-w-[1240px] px-5 pb-32 pt-16 sm:px-8 md:pt-24'>
      <Link to='/changelog' className='inline-flex min-h-11 items-center gap-2 text-[14px] text-muted-foreground transition-colors hover:text-foreground'>
        <span aria-hidden='true'>←</span> Changelog
      </Link>
      <header className='mt-8 max-w-[46rem]'>
        <p className='font-mono text-[13px] text-subtle'>
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
        </p>
        <h1 className='display mt-4 text-[40px] text-foreground sm:text-[60px]'>{entry.title}</h1>
        <p className='lede mt-5 text-[18px] leading-[1.6]'>{entry.summary}</p>
      </header>

      <div className='mt-12 max-w-[880px]'>
        <ChangelogScreen entry={entry} />
      </div>

      <div className='mt-14 grid max-w-[880px] gap-12 md:grid-cols-[minmax(0,1fr)_240px]'>
        <div className='grid gap-5 text-[17px] leading-[1.7] text-muted-foreground'>
          {entry.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside aria-labelledby='changes-title'>
          <h2 id='changes-title' className='eyebrow'>What changed</h2>
          <ul className='mt-4 grid gap-3 text-[14.5px] leading-6 text-foreground'>
            {entry.changes.map((change) => (
              <li key={change} className='flex gap-3'>
                <span aria-hidden='true' className='mt-[11px] h-px w-3 shrink-0 bg-subtle' />
                {change}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <nav aria-label='More changelog entries' className='mt-20 grid max-w-[880px] gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2'>
        {[
          { label: 'Newer', item: newer },
          { label: 'Older', item: older }
        ].map(({ label, item }) =>
          item ? (
            <Link
              key={label}
              to='/changelog/$slug'
              params={{ slug: item.slug }}
              className={`group flex min-h-24 flex-col justify-center bg-background px-6 py-5 transition-colors hover:bg-surface-1 ${label === 'Older' ? 'sm:text-right' : ''}`}
            >
              <span className='font-mono text-[12px] text-subtle'>{label}</span>
              <span className='mt-1.5 text-[16px] text-foreground'>{item.title}</span>
            </Link>
          ) : (
            <span key={label} className='hidden bg-background sm:block' />
          )
        )}
      </nav>

      <div className='mt-16 flex max-w-[880px] flex-col items-start justify-between gap-5 border-t border-line pt-10 sm:flex-row sm:items-center'>
        <p className='text-[17px] text-foreground'>See it on your own pull requests.</p>
        <SmartLink href={`/#${siteConfig.cta.formId}`} className='btn btn-primary'>
          {siteConfig.cta.primary}
        </SmartLink>
      </div>
    </article>
  );
}
