/** The scythe: a crescent blade off the top of a curved snath, with a grip. */
export function ReaperMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M24 3.5C22 12.5 16 22 8 30" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24.4 3C16 .8 6.6 5 3 17.5 7.4 10.2 14.6 7.4 22.8 9.2c.4-2.2.9-4.2 1.6-6.2Z" fill="var(--red)" />
      <path d="m14.6 19.8 3.8 2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
