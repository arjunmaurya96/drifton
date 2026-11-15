// Inline stroke icons (no icon library needed)
const base = (size, sw = 1.8) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: sw,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
});

export const Search = ({ size = 21 }) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
export const Heart = ({ size = 20, filled = false }) => (
  <svg {...base(size, 1.9)} fill={filled ? '#E0475E' : 'none'} stroke={filled ? '#E0475E' : 'currentColor'}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
  </svg>
);
export const Bag = ({ size = 22 }) => (<svg {...base(size)}><path d="M5 7h14l-1.2 11.2a2 2 0 01-2 1.8H8.2a2 2 0 01-2-1.8L5 7z" /><path d="M9 7V6a3 3 0 016 0v1" /></svg>);
export const Arrow = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ChevronLeft = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M15 6l-6 6 6 6" /></svg>);
export const ChevronRight = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M9 6l6 6-6 6" /></svg>);
export const ChevronDown = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M6 9l6 6 6-6" /></svg>);
export const Close = ({ size = 20 }) => (<svg {...base(size, 2)}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Check = ({ size = 18, sw = 2.2 }) => (<svg {...base(size, sw)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const CheckCircle = ({ size = 22 }) => (<svg {...base(size, 2)}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>);
export const Shield = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z" /><path d="M9 12l2 2 4-4" /></svg>);
export const Truck = ({ size = 23 }) => (<svg {...base(size)}><path d="M2 6h11v10H2zM13 9h4.5L21 12.5V16h-8" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>);
export const Cash = ({ size = 23 }) => (<svg {...base(size)}><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /><path d="M6 9.5v5M18 9.5v5" /></svg>);
export const Lock = ({ size = 23 }) => (<svg {...base(size)}><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 018 0v3" /></svg>);
export const Return = ({ size = 23 }) => (<svg {...base(size)}><path d="M4 12a8 8 0 0113.7-5.6L20 8.5" /><path d="M20 4v4.5h-4.5" /><path d="M20 12a8 8 0 01-13.7 5.6L4 15.5" /><path d="M4 20v-4.5h4.5" /></svg>);
export const Leaf = ({ size = 22, sw = 1.8 }) => (<svg {...base(size, sw)}><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" /><path d="M5 19l7-7" /></svg>);
export const Gem = ({ size = 42 }) => (<svg {...base(size, 1.4)}><path d="M12 2.5l6.5 3.8v11.4L12 21.5l-6.5-3.8V6.3z" /><path d="M12 2.5v6.3M5.5 6.3L12 8.8l6.5-2.5M12 8.8v12.7" /></svg>);
export const Flask = ({ size = 42 }) => (<svg {...base(size, 1.4)}><path d="M9.5 3h5M10.5 3v6L5 19a1.5 1.5 0 001.3 2h11.4a1.5 1.5 0 001.3-2l-5.5-10V3" /><path d="M4 4l16 16" /></svg>);
export const Flower = ({ size = 42 }) => (<svg {...base(size, 1.4)}><circle cx="12" cy="12" r="2.6" /><circle cx="12" cy="6.2" r="3" /><circle cx="12" cy="17.8" r="3" /><circle cx="6.2" cy="12" r="3" /><circle cx="17.8" cy="12" r="3" /></svg>);
export const Users = ({ size = 24 }) => (<svg {...base(size, 1.9)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.8c1.8.7 3 2.4 3.5 5.2" /></svg>);
export const Box = ({ size = 24 }) => (<svg {...base(size, 1.9)}><path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z" /><path d="M3 7.5L12 12l9-4.5M12 12v9" /></svg>);
export const Clock = ({ size = 24 }) => (<svg {...base(size, 1.9)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const Award = ({ size = 24 }) => (<svg {...base(size, 1.9)}><circle cx="12" cy="9" r="6" /><path d="M9 14.5L7.5 21l4.5-2.5 4.5 2.5L15 14.5" /><path d="M9.5 9l1.8 1.8L14.5 7.6" /></svg>);
export const Drop = ({ size = 34 }) => (<svg {...base(size, 2)}><path d="M12 3c3 4 6 7 6 10.5A6 6 0 016 13.5C6 10 9 7 12 3z" /><path d="M9.5 13.5l2 2 3.5-3.5" /></svg>);
export const Play = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>);
export const Pause = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1" /><rect x="13.5" y="5" width="4" height="14" rx="1" /></svg>);
export const Plus = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M12 5v14M5 12h14" /></svg>);
export const Minus = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M5 12h14" /></svg>);
export const Star = ({ size = 19 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>);
export const Sparkle = ({ size = 22 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" /></svg>);
export const Quote = ({ size = 34 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 18v-5.5C4 8.4 6.2 6 9.5 5.5V8c-1.8.5-2.7 1.8-2.7 3.8H10V18H4zm10 0v-5.5c0-4.1 2.2-6.5 5.5-7V8c-1.8.5-2.7 1.8-2.7 3.8H20V18h-6z" /></svg>);
export const Menu = ({ size = 22 }) => (<svg {...base(size, 2)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const Pin = ({ size = 18 }) => (<svg {...base(size, 2)}><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const Trash = ({ size = 18 }) => (<svg {...base(size, 1.9)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" /></svg>);
