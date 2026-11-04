import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { REPLAY_EVENT, HeroReview } from '~/components/screens/review/HeroReview';
import { ScreenSlot } from '~/components/screens/ScreenSlot';
import { SmartLink } from '~/components/site/SmartLink';
import { demoPr } from '~/content/demo-pr';
import { hero } from '~/content/home';
import { changelog } from '~/lib/changelog';
import { siteConfig } from '~/site.config';

export function Hero() {
  const latest = changelog[0];
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Browsers without scroll-driven animations straighten the screen here.
  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tilt = tiltRef.current;
    if (!tilt) return;
    const from = window.innerWidth < 768 ? 8 : 16;
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(1, window.scrollY / 620);
      tilt.style.setProperty('--tilt', `${(from * (1 - p)).toFixed(2)}deg`);
      tilt.style.setProperty('--tilt-scale', (0.955 + 0.045 * p).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const replay = (event: React.MouseEvent) => {
    event.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stageRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    stageRef.current?.focus({ preventScroll: true });
    window.dispatchEvent(new Event(REPLAY_EVENT));
  };

  return (
    <section className='relative' aria-labelledby='hero-title'>
      <div className='mx-auto max-w-[1240px] px-5 pt-16 sm:px-8 md:pt-24'>
        {hero.announcementLabel && latest && (
          <Link
            to='/changelog/$slug'
            params={{ slug: latest.slug }}
            className='group inline-flex min-h-9 items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5 text-[13px] text-muted-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09)] transition-colors hover:text-foreground'
          >
            <span className='rounded-full bg-surface-3 px-2 py-0.5 text-[12px] font-medium text-foreground'>
              {hero.announcementLabel}
            </span>
            {latest.title}
            <span aria-hidden='true' className='transition-transform group-hover:translate-x-0.5'>
              →
            </span>
          </Link>
        )}
        <h1
          id='hero-title'
          className='display mt-7 text-[42px] text-foreground sm:text-[60px] lg:text-[76px]'
        >
          {hero.title.split('\n').map((line, index) => (
            <span key={line} className='sm:block'>
              {index > 0 && ' '}
              {line}
            </span>
          ))}
        </h1>
        <div className='mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between'>
          <p className='lede max-w-[38rem] text-[17px] leading-[1.6] sm:text-[19px]'>{hero.body}</p>
          <div className='flex shrink-0 flex-col items-start gap-3 lg:items-end'>
            <div className='flex flex-wrap gap-3'>
              <SmartLink href={`/#${siteConfig.cta.formId}`} className='btn btn-primary'>
                {siteConfig.cta.primary}
              </SmartLink>
              {/* A real link to the screen, so it still works before JavaScript loads. */}
              {/* biome-ignore lint/a11y/useValidAnchor: navigates to #review and replays */}
              <a href='#review' onClick={replay} className='btn btn-ghost'>
                {siteConfig.cta.replay}
              </a>
            </div>
            <p className='text-[13px] text-subtle'>{hero.note}</p>
          </div>
        </div>
      </div>

      <div
        id='review'
        ref={stageRef}
        tabIndex={-1}
        className='hero-stage relative mx-auto mt-14 max-w-[1304px] px-3 outline-none sm:px-8 md:mt-20'
      >
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-[8%] -top-24 h-64 rounded-[50%] bg-[radial-gradient(closest-side,rgb(236_241_245/0.08),transparent)]'
        />
        <div ref={tiltRef} className='hero-tilt relative'>
          <ScreenSlot media={demoPr.media} priority>
            <HeroReview />
          </ScreenSlot>
        </div>
      </div>
    </section>
  );
}
