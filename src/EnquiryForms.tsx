import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Plus, X } from 'lucide-react'
import { Collapse } from './Motion'
import { cleanEnquiry, emptyEnquiry, enquiryTopics, validateEnquiry, type Enquiry, type EnquiryErrors } from './enquiry'
import { contactDelivery } from './contactConfig'
import { useEnquiryDelivery, type DeliveryState } from './useEnquiryDelivery'

type Field = keyof Enquiry
const labels: Record<Field, string> = { name: 'Your name', email: 'Email address', company: 'Business name (optional)', topic: "I'm interested in", subject: 'Subject', message: 'Your message' }
const fieldId = (prefix: string, field: string) => prefix === 'contact' ? ({ name: 'fullName', topic: 'purpose' }[field] || field) : `${prefix}-${field}`
const focusField = (prefix: string, field: string) => requestAnimationFrame(() => document.getElementById(fieldId(prefix, field))?.focus())

export function DeliveryNote() {
  return <p className="delivery-note">{contactDelivery.endpoint
    ? <>Delivery is configured to <strong>{new URL(contactDelivery.endpoint).origin}</strong>. Submit only basic business enquiry information. Acceptance by the service does not confirm email delivery.</>
    : contactDelivery.invalid ? 'Preview mode: the delivery configuration is invalid. Nothing will be transmitted.' : 'Preview mode: no delivery endpoint is configured. Your enquiry will be validated here and will not be transmitted.'}</p>
}

function ErrorSummary({ errors, prefix }: { errors: Record<string, string | undefined>; prefix: string }) {
  const entries = Object.entries(errors).filter((entry): entry is [string, string] => !!entry[1])
  if (!entries.length) return null
  return <div className="form-errors" role="alert"><strong>Please check the following:</strong><ul>{entries.map(([field, message]) => <li key={field}><button type="button" onClick={() => focusField(prefix, field)}>{message}</button></li>)}</ul></div>
}

function EnquiryFields({ fields, data, errors, prefix, change, blur }: {
  fields: readonly Field[]; data: Enquiry; errors: EnquiryErrors; prefix: string
  change: (field: Field, value: string) => void; blur: (field: Field) => void
}) {
  return <>{fields.map(field => {
    const id = fieldId(prefix, field), error = errors[field]
    const common = { id, name: field, value: data[field], required: field !== 'company', 'aria-invalid': error ? true as const : undefined, 'aria-describedby': error ? `${id}-error` : undefined, onBlur: () => blur(field) }
    return <div className="form-field" key={field}><label htmlFor={id}>{labels[field]}{field !== 'company' && <span aria-hidden="true"> *</span>}</label>
      {field === 'topic' ? <div className="select-wrap"><select {...common} onChange={e => change(field, e.target.value)}>{enquiryTopics.map(topic => <option key={topic}>{topic}</option>)}</select><ChevronDown size={18} aria-hidden="true"/></div>
        : field === 'message' ? <textarea {...common} rows={4} maxLength={3000} placeholder="Tell us about your business enquiry…" onChange={e => change(field, e.target.value)}/>
        : <input {...common} type={field === 'email' ? 'email' : 'text'} maxLength={field === 'email' ? 254 : field === 'subject' ? 140 : field === 'company' ? 120 : 100} autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : field === 'company' ? 'organization' : 'off'} onChange={e => change(field, e.target.value)}/>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  })}</>
}

function Honeypot({ value, change, prefix }: { value: string; change: (value: string) => void; prefix: string }) {
  return <div className="enquiry-trap" aria-hidden="true"><label htmlFor={`${prefix}-website`}>Leave this field empty</label><input id={`${prefix}-website`} name="website" autoComplete="off" tabIndex={-1} value={value} onChange={e => change(e.target.value)}/></div>
}

function DeliveryFeedback({ state }: { state: DeliveryState }) {
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => setDismissed(false), [state.status, state.message])
  return <Collapse open={state.status !== 'idle' && !dismissed}><div className={`form-notice delivery-${state.status}`} role={state.status === 'error' ? 'alert' : 'status'}>
    {state.status !== 'sending' && state.status !== 'error' && <Check size={19} aria-hidden="true"/>}<span>{state.message}</span>
    {state.status !== 'sending' && <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss notice"><X size={15}/></button>}
  </div></Collapse>
}

function useEnquiryFields(reset: () => void) {
  const [data, setData] = useState<Enquiry>({ ...emptyEnquiry })
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const change = (field: Field, value: string) => {
    const updated = { ...data, [field]: value }
    setData(updated); reset()
    if (errors[field]) setErrors(current => ({ ...current, [field]: validateEnquiry(updated)[field] }))
  }
  const blur = (field: Field) => setErrors(current => ({ ...current, [field]: validateEnquiry(data)[field] }))
  return { data, setData, errors, setErrors, change, blur }
}

export function ContactForm() {
  const delivery = useEnquiryDelivery('contact')
  const fields = useEnquiryFields(delivery.reset)
  const [website, setWebsite] = useState('')
  const sending = delivery.state.status === 'sending'
  const complete = ['preview', 'accepted'].includes(delivery.state.status)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending || complete) return
    const errors = validateEnquiry(fields.data)
    fields.setErrors(errors)
    if (Object.keys(errors).length) { focusField('contact', Object.keys(errors)[0]); return }
    await delivery.submit(cleanEnquiry(fields.data), website)
  }
  const restart = () => { fields.setData({ ...emptyEnquiry }); fields.setErrors({}); setWebsite(''); delivery.reset(); focusField('contact', 'name') }
  return <form className="contact-form" onSubmit={submit} noValidate aria-busy={sending} data-delivery-state={delivery.state.status}>
    <div className="form-top"><span>ENQUIRY / FORM 01</span><span>{contactDelivery.endpoint ? 'DELIVERY CONFIGURED' : 'PREVIEW MODE'}</span></div>
    <DeliveryNote/><ErrorSummary errors={fields.errors} prefix="contact"/>
    <fieldset disabled={sending}><legend className="sr-only">Business enquiry details</legend>
      <EnquiryFields fields={['name', 'email', 'topic', 'subject', 'message']} {...fields} prefix="contact"/>
      <Honeypot value={website} change={setWebsite} prefix="contact"/>
    </fieldset>
    <button className="form-submit" type="submit" disabled={sending || complete}>{sending ? 'Submitting…' : contactDelivery.endpoint ? 'Send enquiry' : 'Validate preview'}<ArrowUpRight size={19} aria-hidden="true"/></button>
    {complete && <button className="form-reset" type="button" onClick={restart}>Start another enquiry</button>}
    <p className="form-disclaimer">Do not include passwords, account numbers, identity documents or sensitive financial information. Read the <a href="/legal#privacy" target="_blank" rel="noopener noreferrer">privacy information (new tab)</a>. This enquiry does not create a trading account.</p>
    <DeliveryFeedback state={delivery.state}/>
  </form>
}

const stepLabels = ['Initial enquiry', 'Scope clarification', 'Review details', 'Confirmation']
const stepFields: readonly Field[][] = [['name', 'email', 'company'], ['topic', 'subject', 'message']]
export function OnboardingEnquiry({ onStepChange }: { onStepChange: (step: number) => void }) {
  const delivery = useEnquiryDelivery('onboarding')
  const fields = useEnquiryFields(delivery.reset)
  const [step, setStep] = useState(0), [website, setWebsite] = useState(''), [acknowledged, setAcknowledged] = useState(false), [ackError, setAckError] = useState('')
  const sending = delivery.state.status === 'sending'
  useEffect(() => { onStepChange(step) }, [step, onStepChange])
  const go = (next: number) => { setStep(next); requestAnimationFrame(() => document.getElementById(`enquiry-step-${next}`)?.focus({ preventScroll: true })) }
  const next = () => {
    const allErrors = validateEnquiry(fields.data)
    const errors = Object.fromEntries(stepFields[step].filter(field => allErrors[field]).map(field => [field, allErrors[field]]))
    fields.setErrors(errors)
    if (Object.keys(errors).length) { focusField('onboarding', Object.keys(errors)[0]); return }
    go(step + 1)
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending || step === 3) return
    if (step < 2) { next(); return }
    const errors = validateEnquiry(fields.data)
    fields.setErrors(errors)
    if (Object.keys(errors).length) { go(errors.name || errors.email || errors.company ? 0 : 1); focusField('onboarding', Object.keys(errors)[0]); return }
    if (!acknowledged) { setAckError('Confirm that this is a basic business enquiry before continuing.'); focusField('onboarding', 'acknowledgement'); return }
    setAckError('')
    if (await delivery.submit(cleanEnquiry(fields.data), website)) go(3)
  }
  const restart = () => { fields.setData({ ...emptyEnquiry }); fields.setErrors({}); setWebsite(''); setAcknowledged(false); setAckError(''); delivery.reset(); go(0); focusField('onboarding', 'name') }
  return <form className="journey-enquiry" noValidate onSubmit={submit} aria-busy={sending} data-delivery-state={delivery.state.status}>
    <div className="enquiry-progress"><label htmlFor="enquiry-progress">Enquiry progress <span>Step {step + 1} of 4</span></label><progress id="enquiry-progress" max={4} value={step + 1}/></div>
    <DeliveryNote/>
    <ol className="journey-timeline">{stepLabels.map((label, i) => <li key={label} className={step === i ? 'is-active' : ''}>
      <button className="journey-step-toggle" type="button" disabled={sending || i > step || (step === 3 && i !== 3)} aria-expanded={step === i} aria-current={step === i ? 'step' : undefined} aria-controls={`journey-${i}`} onClick={() => go(i)}><span className="journey-number">0{i + 1}</span><span><small className="micro">{['YOUR DETAILS', 'YOUR QUESTION', 'CHECK BEFORE SENDING', 'ENQUIRY STATUS'][i]}</small><strong>{label}</strong></span><Plus size={21} aria-hidden="true"/></button>
      <Collapse open={step === i}><div id={`journey-${i}`} className="journey-detail"><h3 className="sr-only" id={`enquiry-step-${i}`} tabIndex={-1}>{label}</h3>
        {i < 2 ? <><ErrorSummary errors={fields.errors} prefix="onboarding"/><fieldset disabled={sending}><legend className="sr-only">{label}</legend><EnquiryFields fields={stepFields[i]} {...fields} prefix="onboarding"/></fieldset><div className="enquiry-actions">{i > 0 && <button type="button" className="form-back" onClick={() => go(i - 1)}>Previous</button>}<button type="button" className="form-submit" onClick={next}>{i === 0 ? 'Continue' : 'Review enquiry'}<ArrowRight size={18}/></button></div></>
          : i === 2 ? <><p>Review only basic business enquiry information. No account is opened and no financial relationship is established by submitting.</p><dl className="enquiry-review">{(['name', 'email', 'company', 'topic', 'subject', 'message'] as Field[]).map(field => <div key={field}><dt>{labels[field]}</dt><dd>{fields.data[field].trim() || 'Not provided'}</dd></div>)}</dl><fieldset disabled={sending}><legend className="sr-only">Confirm enquiry purpose</legend><label className="enquiry-ack"><input id="onboarding-acknowledgement" type="checkbox" checked={acknowledged} required aria-invalid={ackError ? true : undefined} aria-describedby={ackError ? 'onboarding-ack-error' : undefined} onChange={e => { setAcknowledged(e.target.checked); setAckError('') }}/><span>I understand this is a business enquiry, not an application for a trading account.</span></label>{ackError && <p className="field-error" role="alert" id="onboarding-ack-error">{ackError}</p>}</fieldset><div className="enquiry-actions"><button type="button" className="form-back" disabled={sending} onClick={() => go(1)}>Previous</button><button className="form-submit" type="submit" disabled={sending}>{sending ? 'Submitting…' : contactDelivery.endpoint ? 'Send enquiry' : 'Confirm preview'}<ArrowUpRight size={18}/></button></div></>
            : <><h3>{delivery.state.status === 'accepted' ? 'Enquiry accepted.' : 'Preview complete.'}</h3><p>{delivery.state.message}</p><p>No trading account or financial relationship has been created. {delivery.state.status === 'preview' ? 'Your details were not transmitted.' : 'Email delivery is not confirmed by this acknowledgement.'}</p><button type="button" className="form-reset" onClick={restart}>Start another enquiry</button></>}
      </div></Collapse>
    </li>)}</ol>
    <Honeypot value={website} change={setWebsite} prefix="onboarding"/>
    {step !== 3 && <DeliveryFeedback state={delivery.state}/>}
    <p className="form-disclaimer">Your draft stays in memory while this page is open. Leaving the page clears it. Do not send documents or sensitive financial information. <a href="/legal#privacy" target="_blank" rel="noopener noreferrer">Read privacy information (new tab)</a>.</p>
  </form>
}
