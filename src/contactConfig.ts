import { resolveDelivery } from './enquiry'

export const contactDelivery = resolveDelivery(import.meta.env.VITE_CONTACT_ENDPOINT, window.location.origin)
