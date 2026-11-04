import { createFileRoute, Link } from '@tanstack/react-router';
import { ChangelogScreen } from '~/components/screens/changelog';
import { changelog, formatDate } from '~/lib/changelog';
import { ogImage } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/changelog/')({
  head: () =>
    seo({
      title: `Changelog · ${siteConfig.product}`,
      description: `What’s new in ${siteConfig.product}: the latest review rules, integrations, and speed improvements, newest first.`,
      path: '/changelog',
      image: ogImage('changelog'),
      imageAlt: `${siteConfig.product} changelog`
    }),
  component: ChangelogPage
});

function ChangelogPage() {
  return (
    <div className='mx-auto max-w-[1240px] px-5 pb-32 pt-20 sm:px-8 md:pt-28'>
      <header className='max-w-[44rem]'>
        <p className='eyebrow'>Changelog</p>
        <h1 className='display mt-4 text-[44px] text-foreground sm:text-[64px]'>What’s new in {siteConfig.product}</h1>
        <p className='lede mt-5 text-[17px] leading-[1.65]'>
          New rules, integrations, and speed improvements, newest first. Every change ships to every plan unless it says otherwise.
        </p>
      </header>

      <ol className='mt-16 border-t border-line md:mt-20'>
        {changelog.map((entry) => (
          <li key={entry.slug} className='grid grid-cols-[minmax(0,1fr)] gap-6 border-b border-line py-12 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10 xl:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] xl:gap-12'>
            <p className='font-mono text-[13px] text-subtle md:pt-1.5'>
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            </p>
            <div>
              <h2 className='heading text-[26px] text-foreground sm:text-[30px]'>
                <Link to='/changelog/$slug' params={{ slug: entry.slug }} className='rounded-md transition-colors hover:text-muted-foreground'>
                  {entry.title}
                </Link>
              </h2>
              <p className='mt-3 max-w-[34rem] text-[16px] leading-[1.65] text-muted-foreground'>{entry.summary}</p>
              <Link
                to='/changelog/$slug'
                params={{ slug: entry.slug }}
                className='mt-5 inline-flex min-h-11 items-center gap-2 text-[14px] text-foreground'
                aria-label={`Read more: ${entry.title}`}
              >
                Read more <span aria-hidden='true'>→</span>
              </Link>
            </div>
            <div className='md:col-start-2 xl:col-start-auto'>
              <ChangelogScreen entry={entry} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
