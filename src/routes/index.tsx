import { createFileRoute } from '@tanstack/react-router';
import { Customers } from '~/components/home/Customers';
import { Hero } from '~/components/home/Hero';
import {
  DemoSection,
  NumbersSection,
  PricingSection,
  QuotesSection,
  RulesSection,
  SecuritySection,
  TimelineSection,
  WorkflowSection
} from '~/components/home/Sections';
import { ogImage, site, siteUrl } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: `${siteConfig.product}: AI code review for every pull request`,
      description: siteConfig.description,
      path: '/',
      image: ogImage('home'),
      imageAlt: site.imageAlt,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteConfig.company,
          url: siteUrl('/'),
          logo: siteUrl('/logo.png'),
          address: {
            '@type': 'PostalAddress',
            addressLocality: siteConfig.city,
            addressCountry: 'CA'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: siteConfig.product,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web',
          description: siteConfig.description,
          url: siteUrl('/'),
          publisher: { '@type': 'Organization', name: siteConfig.company },
          offers: [
            {
              '@type': 'Offer',
              name: 'Team',
              price: '24',
              priceCurrency: 'USD'
            },
            {
              '@type': 'Offer',
              name: 'Business',
              price: '40',
              priceCurrency: 'USD'
            }
          ]
        }
      ]
    }),
  component: Home
});

function Home() {
  return (
    <>
      <Hero />
      <Customers />
      <RulesSection />
      <TimelineSection />
      <WorkflowSection />
      <SecuritySection />
      <NumbersSection />
      <QuotesSection />
      <PricingSection />
      <DemoSection />
    </>
  );
}
