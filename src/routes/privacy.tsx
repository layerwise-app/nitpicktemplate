import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '~/components/LegalPage';
import { privacy } from '~/content/legal';
import { ogImage } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/privacy')({
  head: () =>
    seo({
      title: `${privacy.title} · ${siteConfig.product}`,
      description: privacy.description,
      path: '/privacy',
      image: ogImage('privacy'),
      imageAlt: `${siteConfig.product} ${privacy.title.toLowerCase()}`
    }),
  component: () => <LegalPage page={privacy} />
});
