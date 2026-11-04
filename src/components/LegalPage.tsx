import type { LegalPage as LegalContent } from '~/content/legal';
import { formatDate } from '~/lib/changelog';

export function LegalPage({ page }: { page: LegalContent }) {
  return (
    <article className='mx-auto max-w-[1240px] px-5 pb-32 pt-20 sm:px-8 md:pt-28'>
      <header className='max-w-[44rem]'>
        <p className='eyebrow'>
          Updated <time dateTime={page.updated}>{formatDate(page.updated)}</time>
        </p>
        <h1 className='display mt-4 text-[44px] text-foreground sm:text-[64px]'>{page.title}</h1>
        <p className='lede mt-6 text-[18px] leading-[1.65]'>{page.intro}</p>
      </header>
      <div className='mt-14 max-w-[44rem] border-t border-line'>
        {page.sections.map((section) => (
          <section key={section.heading} className='border-b border-line py-8'>
            <h2 className='text-[19px] font-medium tracking-[-0.015em] text-foreground'>{section.heading}</h2>
            <div className='mt-3 grid gap-4 text-[16px] leading-[1.7] text-muted-foreground'>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
