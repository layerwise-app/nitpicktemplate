import { customers } from '~/content/home';
import { Wordmark } from './Wordmarks';

export function Customers() {
  return (
    <section aria-label='Customers' className='mx-auto max-w-[1240px] px-5 pt-24 sm:px-8 md:pt-28'>
      <p className='text-center text-[14px] text-muted-foreground'>{customers.label}</p>
      <ul className='mt-8 grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-9 text-[#9a9ea6] sm:grid-cols-3 lg:flex lg:justify-between'>
        {customers.names.map((name) => (
          <li key={name} className='flex h-9 items-center'>
            <Wordmark name={name} className='h-[26px] w-auto max-w-full sm:h-7' />
          </li>
        ))}
      </ul>
    </section>
  );
}
