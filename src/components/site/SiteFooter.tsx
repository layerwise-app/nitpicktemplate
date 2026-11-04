import { Link } from '@tanstack/react-router';
import { siteConfig } from '~/site.config';
import { Logo } from './Logo';
import { SmartLink } from './SmartLink';

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className='relative border-t border-line'>
      <div className='mx-auto grid max-w-[1240px] gap-12 px-5 pb-10 pt-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] md:pt-16'>
        <div className='flex flex-col items-start gap-5'>
          <Link to='/' className='-m-2 rounded-lg p-2' aria-label={`${siteConfig.product} home`}>
            <Logo />
          </Link>
          <p className='max-w-[320px] text-[14px] leading-6 text-muted-foreground'>
            {siteConfig.product} is made by {siteConfig.company} in {siteConfig.city}.{' '}
            {siteConfig.tagline}
          </p>
          <a
            href='https://layerwise.app'
            target='_blank'
            rel='noopener noreferrer'
            className='-m-1 mt-1 inline-flex rounded-md p-1 opacity-80 transition-opacity hover:opacity-100'
          >
            <img
              src='https://layerwise.app/powered-by-dark.png'
              alt='Powered by Layerwise'
              width={174}
              height={28}
              loading='lazy'
              decoding='async'
              className='h-7 w-[174px]'
            />
          </a>
        </div>
        {siteConfig.footer.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className='eyebrow mb-4'>{group.title}</h2>
            <ul className='grid gap-1'>
              {group.links.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    className='inline-flex min-h-9 items-center text-[14px] text-muted-foreground transition-colors hover:text-foreground'
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className='mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line px-5 py-6 text-[13px] text-subtle sm:px-8'>
        <p>
          © {year} {siteConfig.company} Inc.
        </p>
        {siteConfig.social.length > 0 && (
          <ul className='flex gap-5'>
            {siteConfig.social.map((link) => (
              <li key={link.href}>
                <SmartLink href={link.href} className='hover:text-foreground'>
                  {link.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
