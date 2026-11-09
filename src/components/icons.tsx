// A small stroke icon set so EMMA ships with no icon dependency.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (d: React.ReactNode) =>
  function Icon(props: P) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        {d}
      </svg>
    );
  };

export const IconCommand = base(<><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" /><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>);
export const IconDashboard = base(<><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>);
export const IconCalendar = base(<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>);
export const IconMegaphone = base(<><path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z" /><path d="M15 9a3 3 0 010 6M18 6a7 7 0 010 12" /></>);
export const IconUsers = base(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><path d="M16 4.5a3.5 3.5 0 010 7M21.5 20a6.5 6.5 0 00-4-6" /></>);
export const IconMail = base(<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></>);
export const IconFolder = base(<><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></>);
export const IconBox = base(<><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8M12 13v8" /></>);
export const IconShield = base(<><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>);
export const IconSettings = base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>);
export const IconSend = base(<><path d="M5 12h13M13 6l6 6-6 6" /></>);
export const IconMenu = base(<><path d="M4 7h16M4 12h16M4 17h16" /></>);
export const IconClose = base(<><path d="M6 6l12 12M18 6L6 18" /></>);
export const IconCheck = base(<path d="M5 12.5l4.5 4.5L19 7.5" />);
export const IconAlert = base(<><path d="M12 3l9.5 17H2.5z" /><path d="M12 10v4M12 17.5v.5" /></>);
export const IconSearch = base(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>);
export const IconPlus = base(<path d="M12 5v14M5 12h14" />);
export const IconPen = base(<><path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>);
export const IconChart = base(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>);
export const IconTarget = base(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>);
export const IconBolt = base(<path d="M13 2L4 14h7l-1 8 9-12h-7z" />);
export const IconImage = base(<><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>);
export const IconVideo = base(<><rect x="3" y="5" width="13" height="14" rx="3" /><path d="M16 10l5-3v10l-5-3" /></>);
export const IconDoc = base(<><path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>);
export const IconSlides = base(<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v4M8 20h8" /></>);
export const IconPalette = base(<><path d="M12 3a9 9 0 100 18c1.1 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.1-2.2H17a4 4 0 004-4c0-5.5-4-10-9-10z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>);
export const IconStar = base(<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z" />);
export const IconPause = base(<><path d="M9 5v14M15 5v14" /></>);
export const IconPlay = base(<path d="M7 5l12 7-12 7z" />);
export const IconTrash = base(<><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>);
export const IconRefresh = base(<><path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" /></>);
export const IconLink = base(<><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></>);
export const IconChat = base(<><path d="M4 5h16v11H9l-5 4z" /></>);
export const IconGavel = base(<><path d="M14.5 3.5l6 6M12 6l6 6M9.5 8.5l6 6" /><path d="M13 7l-4 4M3 21l7.5-7.5" /><path d="M4 20h7" /></>);
export const IconX = base(<path d="M7 7l10 10M17 7L7 17" />);
export const IconGlobe = base(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>);
