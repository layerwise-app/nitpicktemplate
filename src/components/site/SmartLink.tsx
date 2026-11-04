import { Link } from '@tanstack/react-router';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  children: ReactNode;
};

/**
 * One link for every kind of address in the content files: `/#section`
 * scrolls to a home page section, `/path` is a page on this site, and
 * anything else opens in a new tab.
 */
export function SmartLink({ href, children, ...rest }: Props) {
  if (href.startsWith('/#')) {
    return (
      <Link to='/' hash={href.slice(2)} {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  if (href.startsWith('/')) {
    return (
      <Link to={href as '/'} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target='_blank' rel='noopener noreferrer' {...rest}>
      {children}
    </a>
  );
}
