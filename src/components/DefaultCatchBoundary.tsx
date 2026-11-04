import { Link, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  console.error(error);

  return (
    <section className='mx-auto flex max-w-[1240px] flex-col items-start px-5 pb-28 pt-24 sm:px-8 md:pt-32'>
      <p className='eyebrow'>Error</p>
      <h1 className='display mt-4 text-[44px] sm:text-[56px]'>Something broke on our side.</h1>
      <p className='lede mt-5 max-w-[46ch] text-[17px] leading-7'>
        The page couldn’t load. Try again, and if it keeps happening, come back in a few minutes.
      </p>
      <div className='mt-10 flex flex-wrap gap-3'>
        <button type='button' className='btn btn-primary' onClick={() => router.invalidate()}>
          Try again
        </button>
        <Link to='/' className='btn btn-ghost'>
          Back to home
        </Link>
      </div>
    </section>
  );
}
