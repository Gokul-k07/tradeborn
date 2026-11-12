import { useEffect, useRef, useState } from 'react'
import { contactDelivery } from './contactConfig'
import { validateEnquiry, type Enquiry } from './enquiry'

export type DeliveryState = { status: 'idle' | 'sending' | 'preview' | 'accepted' | 'error'; message: string }
const idle: DeliveryState = { status: 'idle', message: '' }

export function useEnquiryDelivery(source: 'contact' | 'onboarding') {
  const [state, setState] = useState<DeliveryState>(idle)
  const busy = useRef(false), accepted = useRef(false), alive = useRef(true)
  const controller = useRef<AbortController | null>(null)
  const submission = useRef<{ value: string; id: string } | null>(null)
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort() } }, [])

  const reset = () => {
    if (busy.current) return
    accepted.current = false
    setState(idle)
  }
  const submit = async (data: Enquiry, website: string) => {
    if (busy.current || accepted.current) return null
    if (Object.keys(validateEnquiry(data)).length) { setState({ status: 'error', message: 'Please check the enquiry details before submitting.' }); return null }
    if (website) { setState({ status: 'error', message: 'The enquiry could not be validated. Please reload the page and try again.' }); return null }
    busy.current = true
    const value = JSON.stringify(data)
    if (submission.current?.value !== value) submission.current = { value, id: crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)), n=>n.toString(16)).join('-') }
    const request = new AbortController()
    controller.current = request
    const timeout = window.setTimeout(() => request.abort(), 12000)
    setState({ status: 'sending', message: 'Submitting the enquiry. Please keep this page open.' })
    try {
      const result = contactDelivery.endpoint
        ? await (await import('./enquiryDelivery')).deliverEnquiry(data, source, submission.current.id, request.signal)
        : { status: 'preview' as const }
      if (!alive.current) return null
      accepted.current = true
      setState(result.status === 'preview'
        ? { status: 'preview', message: 'Preview validated. Nothing was transmitted. No delivery endpoint is configured.' }
        : { status: 'accepted', message: 'Enquiry accepted by the configured service. This does not confirm email delivery or create a trading account.' })
      return result.status
    } catch (error) {
      if (alive.current) setState({ status: 'error', message: request.signal.aborted
        ? 'Confirmation timed out. The service may have received the enquiry; check before retrying. Your details remain on this page.'
        : error instanceof TypeError ? 'Could not confirm acceptance. Check your connection or service configuration before retrying.'
        : error instanceof Error && error.name !== 'SyntaxError' ? error.message : 'The service returned an invalid acknowledgement. Acceptance could not be confirmed.' })
      return null
    } finally { clearTimeout(timeout); busy.current = false; controller.current = null }
  }
  return { state, submit, reset }
}
