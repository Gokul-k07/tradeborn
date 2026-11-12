export const enquiryTopics = ['General enquiry', 'Trading approach', 'Services and eligibility', 'Reporting and disclosures', 'Other'] as const
export type Enquiry = { name: string; email: string; company: string; topic: string; subject: string; message: string }
export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>
export const emptyEnquiry: Enquiry = { name: '', email: '', company: '', topic: 'General enquiry', subject: '', message: '' }

export function cleanEnquiry(data: Enquiry): Enquiry {
  return { name: data.name.trim(), email: data.email.trim(), company: data.company.trim(), topic: data.topic, subject: data.subject.trim(), message: data.message.trim() }
}

export function validateEnquiry(input: Enquiry): EnquiryErrors {
  const data = cleanEnquiry(input), errors: EnquiryErrors = {}
  const singleLine = /[\u0000-\u001f\u007f]/
  if (!data.name || data.name.length > 100 || singleLine.test(data.name)) errors.name = 'Enter your name using 1–100 characters on one line.'
  const [local = ''] = data.email.split('@')
  const emailPattern = /^[^\s@<>(),;:"\\[\]]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)+$/i
  if (data.email.length > 254 || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !emailPattern.test(data.email)) errors.email = 'Enter a valid email address, such as name@example.com.'
  if (data.company.length > 120 || singleLine.test(data.company)) errors.company = 'Use up to 120 characters on one line for the business name.'
  if (!enquiryTopics.some(topic => topic === data.topic)) errors.topic = 'Choose an enquiry topic from the list.'
  if (data.subject.length < 2 || data.subject.length > 140 || singleLine.test(data.subject)) errors.subject = 'Enter a subject using 2–140 characters on one line.'
  if (data.message.length < 10 || data.message.length > 3000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data.message)) errors.message = 'Enter a message using 10–3,000 characters.'
  return errors
}

export function resolveDelivery(raw: string | undefined, origin: string) {
  if (!raw?.trim()) return { endpoint: null, invalid: false } as const
  try {
    raw=raw.trim()
    // Public HTTPS endpoints or same-origin paths. HTTP is limited to local development.
    if (!/^https:\/\//i.test(raw) && !/^\/(?!\/)/.test(raw)) throw new Error('Unsupported endpoint')
    const url = new URL(raw.trim(), origin)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && url.origin === origin
    if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.hash) throw new Error('Unsafe endpoint')
    return { endpoint: url.href, invalid: false } as const
  } catch { return { endpoint: null, invalid: true } as const }
}

