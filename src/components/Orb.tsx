// EMMA's avatar: a breathing orb. Cyan core for "alive", the AI gradient ring
// for "a machine is doing the work". It pulses faster while she's busy.
export function Orb({ size = 36, busy = false, className = "" }: { size?: number; busy?: boolean; className?: string }) {
  const id = `orb-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="EMMA">
      <defs>
        <radialGradient id={`${id}-core`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="28%" stopColor="var(--accent)" />
          <stop offset="70%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="#0b1640" />
        </radialGradient>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--ai-from)" />
          <stop offset="100%" stopColor="var(--ai-to)" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="22" fill="var(--accent)" opacity="0.35" filter={`url(#${id}-glow)`}
        style={{ transformOrigin: "32px 32px", animation: `breathe ${busy ? 1.1 : 3.6}s ease-in-out infinite` }} />
      <circle cx="32" cy="32" r="27" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="2.5" strokeDasharray="120 50"
        style={{ transformOrigin: "32px 32px", animation: `spin ${busy ? 1.6 : 14}s linear infinite` }} />
      <circle cx="32" cy="32" r="19" fill={`url(#${id}-core)`} />
      <ellipse cx="26" cy="25" rx="6" ry="3.5" fill="#fff" opacity="0.35" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
