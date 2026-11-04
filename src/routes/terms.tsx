import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '~/components/LegalPage';
import { terms } from '~/content/legal';
import { ogImage } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/terms')({
  head: () =>
    seo({
      title: `${terms.title} · ${siteConfig.product}`,
      description: terms.description,
      path: '/terms',
      image: ogImage('terms'),
      imageAlt: `${siteConfig.product} ${terms.title.toLowerCase()}`
    }),
  component: () => <LegalPage page={terms} />
});
