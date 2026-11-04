import { CodeBlock } from '~/components/code/CodeBlock';
import { PrTimeline } from '~/components/screens/PrTimeline';
import { RulesDemo } from '~/components/screens/RulesDemo';
import { ScreenSlot } from '~/components/screens/ScreenSlot';
import { SecurityDiagram } from '~/components/screens/SecurityDiagram';
import { WorkflowPreview } from '~/components/screens/WorkflowPreview';
import { SmartLink } from '~/components/site/SmartLink';
import { demo, numbers, pricing, quotes, rules, security, timeline, workflow } from '~/content/home';
import { siteConfig } from '~/site.config';
import { DemoForm } from './DemoForm';
import { SectionHeader } from './SectionHeader';
import { Wordmark } from './Wordmarks';

const container = 'mx-auto max-w-[1240px] px-5 sm:px-8';

export function RulesSection() {
  return (
    <section id={rules.id} aria-labelledby={`${rules.id}-title`} className='pt-32 md:pt-44'>
      <div className={container}>
        <SectionHeader id={rules.id} eyebrow={rules.eyebrow} title={rules.title} body={rules.body} split />
        <div className='mt-12 md:mt-16'>
          <ScreenSlot media={rules.media}>
            <RulesDemo />
          </ScreenSlot>
        </div>
      </div>
    </section>
  );
}

export function TimelineSection() {
  return (
    <section id={timeline.id} aria-labelledby={`${timeline.id}-title`} className='pt-32 md:pt-44'>
      <div className={container}>
        <SectionHeader id={timeline.id} eyebrow={timeline.eyebrow} title={timeline.title} body={timeline.body} split>
          <p className='mt-4 hidden font-mono text-[12px] text-subtle lg:block'>{timeline.scrollHint} ↓</p>
        </SectionHeader>
      </div>
      <ScreenSlot media={timeline.media} className='mx-auto mt-12 max-w-[1176px]'>
        <PrTimeline />
      </ScreenSlot>
    </section>
  );
}

export function WorkflowSection() {
  return (
    <section id={workflow.id} aria-labelledby={`${workflow.id}-title`} className='pt-32 md:pt-36 lg:pt-24'>
      <div className={container}>
        <SectionHeader id={workflow.id} eyebrow={workflow.eyebrow} title={workflow.title} body={workflow.body} split />
        <ul className='mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3'>
          {workflow.points.map((point, index) => (
            <li key={point} className='flex gap-4 bg-background px-5 py-5 text-[15px] leading-6 text-muted-foreground'>
              <span className='font-mono text-[12px] leading-6 text-subtle tabular'>0{index + 1}</span>
              {point}
            </li>
          ))}
        </ul>
        <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]'>
          <ScreenSlot media={workflow.media}>
            <WorkflowPreview />
          </ScreenSlot>
          <div className='panel overflow-hidden'>
            <div className='flex h-[60px] items-center justify-between border-b border-line px-5'>
              <span className='font-mono text-[13px] text-foreground'>{workflow.configFile}</span>
              <span className='text-[12.5px] text-subtle'>Reviewed like any other change</span>
            </div>
            <CodeBlock code={workflow.config} language='yaml' label={`${workflow.configFile} configuration`} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SecuritySection() {
  return (
    <section id={security.id} aria-labelledby={`${security.id}-title`} className='pt-32 md:pt-44'>
      <div className={`${container} grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16`}>
        <div>
          <SectionHeader id={security.id} eyebrow={security.eyebrow} title={security.title} body={security.body} />
          <ul className='mt-10 border-t border-line'>
            {security.points.map((point, index) => (
              <li key={point.title} className='grid grid-cols-[32px_1fr] gap-3 border-b border-line py-5'>
                <span className='pt-0.5 font-mono text-[12px] text-subtle tabular'>0{index + 1}</span>
                <div>
                  <h3 className='text-[16px] font-medium text-foreground'>{point.title}</h3>
                  <p className='mt-1.5 text-[15px] leading-6 text-muted-foreground'>{point.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className='lg:sticky lg:top-28 lg:self-start lg:pt-[52px]'>
          <SecurityDiagram />
        </div>
      </div>
    </section>
  );
}

export function NumbersSection() {
  return (
    <section id={numbers.id} aria-labelledby={`${numbers.id}-title`} className='pt-32 md:pt-44'>
      <div className={container}>
        <h2 id={`${numbers.id}-title`} className='eyebrow'>
          {numbers.eyebrow}
        </h2>
        <dl className='mt-8 grid border-y border-line md:grid-cols-3'>
          {numbers.items.map((item) => (
            <div
              key={item.label}
              className='flex flex-col-reverse justify-end gap-4 border-line py-8 md:border-l md:px-8 md:py-10 md:first:border-l-0 md:first:pl-0 [&:not(:last-child)]:border-b md:[&:not(:last-child)]:border-b-0'
            >
              <dt className='max-w-[22ch] text-[15px] leading-6 text-muted-foreground'>{item.label}</dt>
              <dd className='flex items-baseline text-foreground'>
                <span className='text-[88px] font-[480] leading-[0.9] tracking-[-0.055em] sm:text-[112px]'>
                  {item.value}
                </span>
                <span className='ml-1.5 text-[36px] font-[440] tracking-[-0.04em] text-muted-foreground sm:text-[44px]'>
                  {item.unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className='mt-4 text-[13px] text-subtle'>{numbers.note}</p>
      </div>
    </section>
  );
}

export function QuotesSection() {
  return (
    <section id={quotes.id} aria-labelledby={`${quotes.id}-title`} className='pt-32 md:pt-44'>
      <div className={`${container} grid gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-16`}>
        <h2 id={`${quotes.id}-title`} className='eyebrow lg:pt-3'>
          {quotes.eyebrow}
        </h2>
        <div className='grid gap-0'>
          {quotes.items.map((item) => (
            <figure key={item.name} className='m-0 border-t border-line py-10 first:border-t-0 first:pt-0'>
              <blockquote className='m-0'>
                <p className='heading text-[24px] leading-[1.3] tracking-[-0.025em] text-foreground sm:text-[30px]'>
                  “{item.quote}”
                </p>
              </blockquote>
              <figcaption className='mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-[14px]'>
                <span>
                  <span className='text-foreground'>{item.name}</span>
                  <span className='text-muted-foreground'>
                    , {item.title}, {item.company}
                  </span>
                </span>
                <Wordmark name={item.company} className='h-5 w-auto text-subtle' />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id={pricing.id} aria-labelledby={`${pricing.id}-title`} className='pt-32 md:pt-44'>
      <div className={container}>
        <SectionHeader id={pricing.id} eyebrow={pricing.eyebrow} title={pricing.title} body={pricing.body} split />
        <div className='panel mt-12 grid overflow-hidden md:grid-cols-3'>
          {pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col border-line p-6 sm:p-8 md:border-l md:first:border-l-0 [&:not(:last-child)]:border-b md:[&:not(:last-child)]:border-b-0 ${plan.highlighted ? 'bg-white/[0.025]' : ''}`}
            >
              {plan.highlighted && (
                <span aria-hidden='true' className='absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.45),transparent)]' />
              )}
              <div className='flex items-center justify-between gap-3'>
                <h3 className='text-[17px] font-medium text-foreground'>{plan.name}</h3>
                {plan.highlighted && (
                  <span className='rounded-full px-2.5 py-1 text-[12px] text-muted-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]'>
                    Most teams
                  </span>
                )}
              </div>
              <p className='mt-6 flex items-baseline gap-2'>
                <span className='text-[44px] font-[480] leading-none tracking-[-0.05em] text-foreground'>
                  {plan.price}
                </span>
                {plan.period && <span className='text-[14px] text-muted-foreground'>{plan.period}</span>}
              </p>
              <p className='mt-4 min-h-12 text-[15px] leading-6 text-muted-foreground'>{plan.description}</p>
              <ul className='mt-6 grid gap-3 border-t border-line pt-6 text-[14.5px] text-muted-foreground'>
                {plan.features.map((feature) => (
                  <li key={feature} className='flex gap-3'>
                    <span aria-hidden='true' className='mt-[9px] h-px w-3 shrink-0 bg-subtle' />
                    {feature}
                  </li>
                ))}
              </ul>
              <SmartLink
                href={`/#${siteConfig.cta.formId}`}
                className={`btn mt-8 w-full md:mt-auto ${plan.highlighted ? 'btn-primary' : 'btn-ghost'}`}
                aria-label={`${siteConfig.cta.primary}: ${plan.name} plan`}
              >
                {siteConfig.cta.primary}
              </SmartLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoSection() {
  return (
    <section
      id={siteConfig.cta.formId}
      aria-labelledby='demo-title'
      className='pb-32 pt-32 md:pb-44 md:pt-44'
    >
      <div className={`${container} grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-20`}>
        <div>
          <p className='eyebrow'>{demo.eyebrow}</p>
          <h2 id='demo-title' className='heading mt-4 max-w-[16ch] text-[34px] text-foreground sm:text-[44px] lg:text-[52px]'>
            {demo.title}
          </h2>
          <p className='lede mt-5 max-w-[32rem] text-[17px] leading-[1.65]'>{demo.body}</p>
          <ul className='mt-8 grid gap-3 text-[15px] text-muted-foreground'>
            {demo.points.map((point) => (
              <li key={point} className='flex items-center gap-3'>
                <span aria-hidden='true' className='h-px w-3 bg-subtle' />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className='panel p-5 sm:p-8'>
          <DemoForm />
        </div>
      </div>
    </section>
  );
}
