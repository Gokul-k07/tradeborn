import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion, useIsPresent, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from 'motion/react'

export const editorialEase = [0.22, 1, 0.36, 1] as const

export function StorySection({ children, direction = 'up', ...props }: HTMLMotionProps<'section'> & { direction?: 'up' | 'left' | 'none' }) {
  const reduced = useReducedMotion()
  return <motion.section {...props} initial={reduced ? false : { opacity: 0, x: direction === 'left' ? -12 : 0, y: direction === 'up' ? 16 : 0 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, amount: .06 }} transition={{ duration: reduced ? 0 : .6, ease: editorialEase }}>{children}</motion.section>
}

// Replaces the panel immediately; only its new content enters. Controls never remount.
export function SwapPanel({ identity, children, ...props }: HTMLMotionProps<'div'> & { identity: string | number }) {
  const reduced = useReducedMotion()
  return <motion.div {...props} key={identity} initial={reduced ? false : { opacity: .35, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .26, ease: editorialEase }}>{children}</motion.div>
}

function CollapseBody({ children }: { children: ReactNode }) {
  const present = useIsPresent()
  return <motion.div className="motion-collapse" aria-hidden={!present || undefined} inert={!present || undefined} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ height: { duration: .32, ease: editorialEase }, opacity: { duration: .18 } }}>{children}</motion.div>
}

export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const reduced = useReducedMotion()
  if (reduced) return open ? <>{children}</> : null
  return <AnimatePresence initial={false}>{open && <CollapseBody key="content">{children}</CollapseBody>}</AnimatePresence>
}

export function MagneticButton({ children, ...props }: HTMLMotionProps<'button'>) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0), y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 350, damping: 28 }), springY = useSpring(y, { stiffness: 350, damping: 28 })
  useEffect(() => { if (reduced) { x.set(0); y.set(0) } }, [reduced, x, y])
  return <motion.button {...props} style={{ ...props.style, x: reduced ? 0 : springX, y: reduced ? 0 : springY }} onPointerMove={event => {
    if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const box = event.currentTarget.getBoundingClientRect()
    x.set(Math.max(-3, Math.min(3, (event.clientX - box.left - box.width / 2) * .04)))
    y.set(Math.max(-3, Math.min(3, (event.clientY - box.top - box.height / 2) * .04)))
  }} onPointerLeave={() => { x.set(0); y.set(0) }} onBlur={() => { x.set(0); y.set(0) }}>{children}</motion.button>
}

export function DrawPath({ d, ...props }: Omit<React.ComponentProps<typeof motion.path>, 'd'> & { d: string }) {
  const reduced = useReducedMotion()
  return <motion.path {...props} d={d} initial={reduced ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} animate={{ d }} viewport={{ once: true, amount: .15 }} transition={{ d: { duration: reduced ? 0 : .4, ease: editorialEase }, pathLength: { duration: reduced ? 0 : 1.05, ease: editorialEase } }}/>
}

export function HeroLine({ children, index }: { children: ReactNode; index: number }) {
  const reduced = useReducedMotion()
  return <span className="hero-line"><motion.span initial={reduced ? false : { y: '108%' }} animate={{ y: 0 }} transition={{ delay: reduced ? 0 : .12 + index * .1, duration: reduced ? 0 : .85, ease: editorialEase }}>{children}</motion.span></span>
}

export function MaskedText({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return <span className="editorial-mask"><motion.span initial={reduced ? false : { y: 18, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduced ? 0 : .65, ease: editorialEase }}>{children}</motion.span></span>
}

// No timer, stream or background loop: values only change in response to input.
export function ObservationTooltip({ point, value }: { point: number; value: number }) {
  return <span className="observation-tooltip" role="status" aria-live="off"><span>DEMO / OBS {String(point + 1).padStart(2, '0')}</span><strong>{value}</strong></span>
}

