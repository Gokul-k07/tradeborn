import { contactDelivery } from './contactConfig'
import { cleanEnquiry, validateEnquiry, type Enquiry } from './enquiry'

export type DeliveryResult = { status: 'accepted' } | { status: 'preview' }
export async function deliverEnquiry(data: Enquiry, source: 'contact' | 'onboarding', submissionId: string, signal: AbortSignal): Promise<DeliveryResult> {
  if (Object.keys(validateEnquiry(data)).length) throw new Error('Please check the enquiry details before submitting.')
  if (!contactDelivery.endpoint) return { status: 'preview' }
  const response = await fetch(contactDelivery.endpoint, {
    method: 'POST', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...cleanEnquiry(data), source, submissionId }),
  })
  if (response.status === 429) throw new Error('The enquiry service is busy or rate-limited. Please wait before trying again.')
  if (!response.ok) throw new Error('The enquiry service returned an error. Acceptance was not confirmed. Your details are still here.')
  // A SPA fallback, redirect, empty response or generic HTTP 200 must never look like delivery.
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) throw new Error('The service returned an unexpected response. Acceptance could not be confirmed.')
  const result: unknown = await response.json()
  if (!result || typeof result !== 'object' || !('ok' in result) || result.ok !== true) throw new Error('The service did not confirm acceptance. Please check the configuration before retrying.')
  return { status: 'accepted' }
}
