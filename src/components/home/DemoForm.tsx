import { useId, useRef, useState } from 'react';
import { demo } from '~/content/home';
import {
  CODE_HOSTS,
  type DemoRequestResult,
  type FieldErrors,
  TEAM_SIZES,
  validateDemoRequest,
  validateEmail
} from '~/lib/demo-request';
import { requestDemo } from '~/lib/demo-request.functions';
import { siteConfig } from '~/site.config';

type Values = { email: string; company: string; teamSize: string; codeHost: string };

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; result: Extract<DemoRequestResult, { status: 'ok' | 'duplicate' }> }
  | { kind: 'rate_limited' }
  | { kind: 'network' };

const fill = (template: string, email: string) => template.replace('{email}', email);

export function DemoForm() {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Values>({
    email: '',
    company: '',
    teamSize: '',
    codeHost: ''
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // The message keeps the form's height so the page doesn't jump.
  const [formHeight, setFormHeight] = useState<number | null>(null);

  const set = (field: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const focusFirstError = (fieldErrors: FieldErrors) => {
    const first = (['email', 'company', 'teamSize', 'codeHost'] as const).find((f) => fieldErrors[f]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === 'sending') return;
    const website = new FormData(event.currentTarget).get('website');
    const check = validateDemoRequest(values);
    if (!check.ok) {
      setErrors(check.errors);
      focusFirstError(check.errors);
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const result = await requestDemo({ data: { ...values, website } });
      if (result.status === 'invalid') {
        setErrors(result.errors);
        setStatus({ kind: 'idle' });
        focusFirstError(result.errors);
      } else if (result.status === 'rate_limited') {
        setStatus({ kind: 'rate_limited' });
      } else {
        setFormHeight(formRef.current?.offsetHeight ?? null);
        setStatus({ kind: 'done', result });
        requestAnimationFrame(() => resultRef.current?.focus());
      }
    } catch {
      setStatus({ kind: 'network' });
    }
  };

  if (status.kind === 'done') {
    const copy = status.result.status === 'duplicate' ? demo.duplicate : demo.success;
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role='status'
        className='flex min-h-[452px] flex-col items-start justify-center px-2 py-10 outline-none sm:px-4'
        style={formHeight ? { minHeight: formHeight } : undefined}
      >
        <span className='flex size-10 items-center justify-center rounded-full bg-surface-4 text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]'>
          <svg width='16' height='16' viewBox='0 0 16 16' aria-hidden='true'>
            <path d='M3.5 8.4 6.6 11.5 12.5 4.8' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </span>
        <h3 className='heading mt-6 text-[28px] text-foreground'>{copy.title}</h3>
        <p className='mt-3 max-w-[30rem] text-[16px] leading-7 text-muted-foreground'>
          {fill(copy.body, status.result.email)}
        </p>
      </div>
    );
  }

  const sending = status.kind === 'sending';
  const describe = (field: keyof Values, extra?: string) =>
    [errors[field] ? `${id}-${field}-error` : null, extra].filter(Boolean).join(' ') || undefined;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className='grid gap-5' aria-label={siteConfig.cta.primary}>
      <div className='grid gap-2'>
        <label htmlFor={`${id}-email`} className='text-[14px] font-medium text-foreground'>
          {demo.fields.email.label}
        </label>
        <input
          id={`${id}-email`}
          name='email'
          type='email'
          inputMode='email'
          autoComplete='email'
          required
          placeholder={demo.fields.email.placeholder}
          value={values.email}
          onChange={(e) => set('email')(e.target.value)}
          onBlur={() => {
            if (!values.email) return;
            const message = validateEmail(values.email);
            if (message) setErrors((e) => ({ ...e, email: message }));
          }}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describe('email')}
          className='field'
        />
        <FieldError id={`${id}-email-error`} message={errors.email} />
      </div>

      <div className='grid gap-2'>
        <label htmlFor={`${id}-company`} className='text-[14px] font-medium text-foreground'>
          {demo.fields.company.label}
        </label>
        <input
          id={`${id}-company`}
          name='company'
          type='text'
          autoComplete='organization'
          required
          maxLength={120}
          placeholder={demo.fields.company.placeholder}
          value={values.company}
          onChange={(e) => set('company')(e.target.value)}
          aria-invalid={errors.company ? true : undefined}
          aria-describedby={describe('company')}
          className='field'
        />
        <FieldError id={`${id}-company-error`} message={errors.company} />
      </div>

      <Segmented
        id={`${id}-teamSize`}
        name='teamSize'
        legend={demo.fields.teamSize.label}
        hint={demo.fields.teamSize.hint}
        options={TEAM_SIZES}
        value={values.teamSize}
        onChange={set('teamSize')}
        error={errors.teamSize}
      />
      <Segmented
        id={`${id}-codeHost`}
        name='codeHost'
        legend={demo.fields.codeHost.label}
        options={CODE_HOSTS}
        value={values.codeHost}
        onChange={set('codeHost')}
        error={errors.codeHost}
      />

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden='true' className='absolute -left-[9999px] h-px w-px overflow-hidden'>
        <label>
          Website
          <input type='text' name='website' tabIndex={-1} autoComplete='off' defaultValue='' />
        </label>
      </div>

      {(status.kind === 'rate_limited' || status.kind === 'network') && (
        <p
          role='alert'
          className='rounded-xl bg-high/[0.08] px-4 py-3 text-[14px] leading-6 text-foreground shadow-[inset_0_0_0_1px_rgb(242_166_143/0.3)]'
        >
          {status.kind === 'rate_limited' ? demo.rateLimited : demo.networkError}
        </p>
      )}

      <div className='mt-1 grid gap-3'>
        <button type='submit' className='btn btn-primary w-full' disabled={sending} aria-disabled={sending}>
          {sending ? demo.submitting : siteConfig.cta.primary}
        </button>
        <p className='text-center text-[13px] text-subtle'>{demo.privacy}</p>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className='text-[13.5px] leading-5 text-high'>
      {message}
    </p>
  );
}

function Segmented({
  id,
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  error
}: {
  id: string;
  name: string;
  legend: string;
  hint?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset
      className='grid gap-2'
      aria-invalid={error ? true : undefined}
      aria-describedby={[hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined}
    >
      <legend className='mb-2 flex w-full items-baseline justify-between gap-3 text-[14px] font-medium text-foreground'>
        {legend}
        {hint && (
          <span id={`${id}-hint`} className='text-[13px] font-normal text-subtle'>
            {hint}
          </span>
        )}
      </legend>
      <div
        className={`grid gap-1 rounded-xl bg-background p-1 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)] ${
          options.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
        } ${error ? 'shadow-[inset_0_0_0_1px_rgb(242_166_143/0.6)]' : ''}`}
      >
        {options.map((option) => (
          <label key={option} className='segment'>
            <input
              type='radio'
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className='absolute inset-0 cursor-pointer opacity-0'
            />
            <span className='tabular'>{option}</span>
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}
