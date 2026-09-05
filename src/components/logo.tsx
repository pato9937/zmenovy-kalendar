export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="32" height="32" rx="7" fill="#09090B" />
      <rect x="5" y="7" width="22" height="20" rx="4" fill="#18181B" />
      <rect x="5" y="7" width="22" height="6" rx="4" fill="#5B8DEF" />
      <rect x="5" y="10" width="22" height="3" fill="#5B8DEF" />
      <rect x="10" y="4.5" width="2.6" height="6.2" rx="1.3" fill="#D4D4D8" />
      <rect x="19.4" y="4.5" width="2.6" height="6.2" rx="1.3" fill="#D4D4D8" />
      <rect x="8" y="15.4" width="6.6" height="4.4" rx="1.1" fill="#5B8DEF" />
      <rect x="17.4" y="15.4" width="6.6" height="4.4" rx="1.1" fill="#5B8DEF" />
      <rect x="8" y="21.2" width="6.6" height="4.4" rx="1.1" fill="#3DCF8E" />
      <rect x="17.4" y="21.2" width="6.6" height="4.4" rx="1.1" fill="#3DCF8E" />
    </svg>
  );
}
