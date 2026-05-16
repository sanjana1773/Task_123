// Inline SVG illustrations for empty states.
// Pure SVG — no external assets, theme-aware via currentColor.

export const NoProjectsIllustration = ({ className = '' }) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="np-grad" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
      </linearGradient>
    </defs>
    <rect x="30" y="40" width="140" height="80" rx="10" fill="url(#np-grad)" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
    <rect x="30" y="40" width="140" height="20" rx="10" fill="currentColor" fillOpacity="0.12" />
    <circle cx="44" cy="50" r="3" fill="currentColor" fillOpacity="0.5" />
    <circle cx="54" cy="50" r="3" fill="currentColor" fillOpacity="0.35" />
    <circle cx="64" cy="50" r="3" fill="currentColor" fillOpacity="0.25" />
    <rect x="44" y="74" width="60" height="8" rx="2" fill="currentColor" fillOpacity="0.3" />
    <rect x="44" y="88" width="100" height="6" rx="2" fill="currentColor" fillOpacity="0.18" />
    <rect x="44" y="100" width="80" height="6" rx="2" fill="currentColor" fillOpacity="0.18" />
    <circle cx="160" cy="34" r="14" fill="currentColor" fillOpacity="0.15" />
    <path d="M154 34h12M160 28v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const NoTasksIllustration = ({ className = '' }) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="30" width="120" height="20" rx="6" fill="currentColor" fillOpacity="0.12" />
    <rect x="40" y="60" width="120" height="20" rx="6" fill="currentColor" fillOpacity="0.18" />
    <rect x="40" y="90" width="120" height="20" rx="6" fill="currentColor" fillOpacity="0.08" />
    <circle cx="56" cy="40" r="5" fill="currentColor" fillOpacity="0.4" />
    <circle cx="56" cy="70" r="5" fill="currentColor" fillOpacity="0.5" />
    <path d="M53.5 70l2 2 4-4" stroke="hsl(var(--card))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="56" cy="100" r="5" fill="currentColor" fillOpacity="0.3" />
    <rect x="70" y="36" width="60" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
    <rect x="70" y="66" width="80" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
    <rect x="70" y="96" width="50" height="6" rx="2" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const NoSearchIllustration = ({ className = '' }) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="85" cy="65" r="34" stroke="currentColor" strokeWidth="3" strokeOpacity="0.4" />
    <circle cx="85" cy="65" r="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
    <path d="M110 90l24 24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.5" />
    <circle cx="73" cy="60" r="3" fill="currentColor" fillOpacity="0.4" />
    <circle cx="97" cy="60" r="3" fill="currentColor" fillOpacity="0.4" />
    <path d="M76 76q9 6 18 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
);

export const InboxIllustration = ({ className = '' }) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 60l20-30h80l20 30v40a10 10 0 01-10 10H50a10 10 0 01-10-10V60z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
    <path d="M40 60h35a10 10 0 0110 10v0a10 10 0 0010 10h10a10 10 0 0010-10v0a10 10 0 0110-10h35" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
  </svg>
);
