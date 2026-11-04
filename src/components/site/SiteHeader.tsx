import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState } from 'react';
import { siteConfig } from '~/site.config';
import { Logo } from './Logo';
import { SmartLink } from './SmartLink';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const location = useRouterState({ select: (s) => s.location.href });

  // Close the phone menu whenever the page or section changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: location is the trigger
  useEffect(() => setOpen(false), [location]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className='sticky top-0 z-50 border-b border-line bg-background/75 backdrop-blur-xl backdrop-saturate-150'>
      <a
        href='#main'
        className='sr-only-focusable absolute left-4 top-3 z-10 rounded-md bg-surface-3 px-3 py-2 text-sm'
      >
        Skip to content
      </a>
      <div className='mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-5 sm:px-8'>
        <Link
          to='/'
          className='-m-2 flex min-h-11 items-center rounded-lg p-2'
          aria-label={`${siteConfig.product} home`}
        >
          <Logo />
        </Link>

        <nav aria-label='Main' className='ml-auto hidden md:block'>
          <ul className='flex items-center gap-1'>
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <SmartLink
                  href={item.href}
                  className='rounded-full px-3 py-2 text-[14px] text-muted-foreground transition-colors hover:text-foreground'
                >
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className='ml-auto flex items-center gap-2 md:ml-2'>
          <SmartLink
            href={`/#${siteConfig.cta.formId}`}
            className='btn btn-primary btn-sm'
          >
            {siteConfig.cta.primary}
          </SmartLink>
          <button
            ref={buttonRef}
            type='button'
            className='-mr-2 flex size-11 items-center justify-center rounded-full text-foreground md:hidden'
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden='true' className='relative block h-3 w-4'>
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0.5'}`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-2.5'}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        ref={panelRef}
        hidden={!open}
        className='absolute inset-x-0 top-full border-b border-line bg-background/95 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl md:hidden'
      >
        <nav aria-label='Main' className='mx-auto max-w-[1240px] px-5 py-3'>
          <ul>
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <SmartLink
                  href={item.href}
                  className='flex min-h-12 items-center border-b border-line text-[17px] text-foreground'
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
