import { Link, useRouterState } from '@tanstack/react-router';

/** The 404 page: a one-line diff that points the visitor home. */
export function NotFound() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <section className='mx-auto flex max-w-[1240px] flex-col items-start px-5 pb-28 pt-24 sm:px-8 md:pt-32'>
      <title>Page not found · Nitpick</title>
      <meta name='robots' content='noindex' />
      <p className='eyebrow'>404</p>
      <h1 className='display mt-4 max-w-[14ch] text-[44px] sm:text-[64px]'>
        Nothing to review here.
      </h1>
      <p className='lede mt-5 max-w-[46ch] text-[17px] leading-7'>
        This page doesn’t exist, or it was removed in a later commit.
      </p>

      <div className='panel mt-10 w-full max-w-[560px] overflow-hidden'>
        <div className='flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[12px] text-subtle'>
          <span>routes.ts</span>
          <span className='flex items-center gap-2 text-brand'>
            <span className='size-1.5 rounded-full bg-brand' />1 issue
          </span>
        </div>
        <div className='code py-3'>
          <div className='diff-row' data-kind='del'>
            <span className='diff-num'>1</span>
            <span className='diff-sign'>−</span>
            <span className='diff-code truncate tk-str'>"{path}"</span>
          </div>
          <div className='diff-row applied-row' data-kind='add' data-state='applied'>
            <span className='diff-num'>1</span>
            <span className='diff-sign'>+</span>
            <span className='diff-code tk-str'>"/"</span>
          </div>
        </div>
        <p className='border-t border-line px-4 py-3 text-[13px] text-muted-foreground'>
          <span className='text-foreground'>Nitpick</span> · This link points to a page that
          doesn’t exist.
        </p>
      </div>

      <div className='mt-10 flex flex-wrap gap-3'>
        <Link to='/' className='btn btn-primary'>
          Back to home
        </Link>
        <Link to='/changelog' className='btn btn-ghost'>
          Read the changelog
        </Link>
      </div>
    </section>
  );
}
