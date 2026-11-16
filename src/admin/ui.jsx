import { useEffect } from 'react';

// ---------- formatting ----------
export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
export const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const ago = (iso) => {
  const h = Math.round((Date.now() - new Date(iso)) / 3600000);
  return h < 1 ? 'just now' : h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
};

// ---------- icons ----------
const I = ({ size = 20, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
export const Icon = {
  home: (p) => <I {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></I>,
  orders: (p) => <I {...p}><path d="M6 7h12l-1 13H7z" /><path d="M9 7a3 3 0 0 1 6 0" /></I>,
  box: (p) => <I {...p}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></I>,
  tag: (p) => <I {...p}><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.5" /></I>,
  users: (p) => <I {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M17 11a3 3 0 1 0 0-6M21.5 20a5.5 5.5 0 0 0-4-5.3" /></I>,
  inbox: (p) => <I {...p}><path d="M3 13l3-8h12l3 8v6H3z" /><path d="M3 13h5l1 2h6l1-2h5" /></I>,
  star: (p) => <I {...p}><path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" /></I>,
  gear: (p) => <I {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></I>,
  search: (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></I>,
  bell: (p) => <I {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 21h4" /></I>,
  menu: (p) => <I {...p}><path d="M4 6h16M4 12h16M4 18h16" /></I>,
  close: (p) => <I {...p}><path d="M6 6l12 12M18 6L6 18" /></I>,
  rupee: (p) => <I {...p}><path d="M6 4h12M6 9h12M14 4c3 0 3 5 0 5H6l8 11" /></I>,
  trend: (p) => <I {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></I>,
  clock: (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>,
  truck: (p) => <I {...p}><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></I>,
  logout: (p) => <I {...p}><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></I>,
  external: (p) => <I {...p}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v6H4V6h6" /></I>,
  plus: (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>,
  edit: (p) => <I {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /></I>,
  trash: (p) => <I {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></I>,
  print: (p) => <I {...p}><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></I>,
  phone: (p) => <I {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></I>,
  mail: (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></I>,
  download: (p) => <I {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></I>,
  check: (p) => <I {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></I>,
  eye: (p) => <I {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></I>,
  eyeOff: (p) => <I {...p}><path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.1 7.6C3.6 9.4 2 12 2 12s3.5 6 10 6a9.6 9.6 0 0 0 4.4-1" /></I>,
};

// ---------- building blocks ----------
export function Card({ className = '', children, ...rest }) {
  return <div className={`rounded-2xl border border-[#E6E9F2] bg-white ${className}`} {...rest}>{children}</div>;
}

export function PageHeader({ title, sub, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-head text-[24px] font-bold tracking-tight text-navy-900 sm:text-[28px]">{title}</h1>
        {sub && <p className="mt-1 text-[14.5px] text-muted-2">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

const tones = {
  New: 'bg-[#EAF0FF] text-[#2647B8]', Packed: 'bg-[#FFF4E5] text-[#9A5A00]', Shipped: 'bg-[#EFE9FF] text-[#5B3FA8]',
  Delivered: 'bg-[#E5F5EC] text-[#17703D]', Cancelled: 'bg-[#FDECEC] text-[#B42318]',
  Contacted: 'bg-[#FFF4E5] text-[#9A5A00]', Closed: 'bg-[#EEF0F4] text-[#5A6478]',
  Published: 'bg-[#E5F5EC] text-[#17703D]', Pending: 'bg-[#FFF4E5] text-[#9A5A00]', Hidden: 'bg-[#EEF0F4] text-[#5A6478]',
  Active: 'bg-[#E5F5EC] text-[#17703D]', Inactive: 'bg-[#EEF0F4] text-[#5A6478]',
};
export function Badge({ children, tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${tones[tone || children] || 'bg-[#EEF0F4] text-[#5A6478]'}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />{children}
    </span>
  );
}

export function Btn({ variant = 'primary', className = '', children, ...rest }) {
  const v = {
    primary: 'bg-navy-900 text-white hover:bg-navy-700',
    green: 'bg-brand text-white hover:bg-brand-dark',
    ghost: 'border border-[#E0E4EE] bg-white text-navy-900 hover:border-navy-700',
    danger: 'border border-[#F5C2C2] bg-white text-[#B42318] hover:bg-[#FDECEC]',
  }[variant];
  return <button type="button" className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-semibold transition disabled:opacity-50 ${v} ${className}`} {...rest}>{children}</button>;
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand' : 'bg-[#D3D8E4]'}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export const inputCls = 'min-h-11 w-full rounded-xl border border-[#E0E4EE] bg-white px-3.5 text-[14.5px] text-navy-900 outline-none transition placeholder:text-muted-2 focus:border-navy-700 focus:ring-4 focus:ring-blue-soft';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-semibold text-navy-900">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-muted-2">{hint}</span>}
    </label>
  );
}

// search + filter chips row
export function Toolbar({ q, setQ, placeholder, chips, active, setActive }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#EEF0F5] p-4 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative w-full lg:max-w-[340px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2"><Icon.search size={18} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-10`} />
      </label>
      {chips && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
          {chips.map(([k, label, n]) => (
            <button key={k} type="button" onClick={() => setActive(k)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${active === k ? 'bg-navy-900 text-white' : 'bg-[#F3F5FA] text-navy-500 hover:bg-[#E8ECF5]'}`}>
              {label}{n != null && <span className={`rounded-full px-1.5 text-[11px] ${active === k ? 'bg-white/20' : 'bg-white'}`}>{n}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Empty({ text = 'Nothing here yet.' }) {
  return <div className="px-6 py-16 text-center text-[14.5px] text-muted-2">{text}</div>;
}

// right-side panel for details / editing
export function Drawer({ open, onClose, title, sub, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <div className={`fixed inset-0 z-[70] transition ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-navy-900/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside role="dialog" aria-label={title}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF0F5] px-5 py-4 sm:px-6">
          <div><h2 className="font-head text-[19px] font-bold">{title}</h2>{sub && <p className="text-[13px] text-muted-2">{sub}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="flex size-9 items-center justify-center rounded-xl hover:bg-[#F3F5FA]"><Icon.close /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap gap-2 border-t border-[#EEF0F5] px-5 py-4 sm:px-6">{footer}</div>}
      </aside>
    </div>
  );
}

// smooth area chart (pure SVG)
export function AreaChart({ points, height = 220 }) {
  const W = 640, H = height, pad = 28;
  const max = Math.max(...points.map((p) => p.v), 1) * 1.15;
  const x = (i) => pad + (i * (W - pad * 2)) / (points.length - 1);
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${d} L${x(points.length - 1)},${H - pad} L${x(0)},${H - pad} Z`;
  const ticks = [0, 0.5, 1].map((t) => max * t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue chart">
      <defs>
        <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1F9254" stopOpacity=".28" /><stop offset="100%" stopColor="#1F9254" stopOpacity="0" /></linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad} x2={W - pad} y1={y(t)} y2={y(t)} stroke="#EEF0F5" />
          <text x={pad} y={y(t) - 5} fontSize="10" fill="#8A93AB">{t >= 1000 ? `₹${(t / 1000).toFixed(1)}k` : `₹${Math.round(t)}`}</text>
        </g>
      ))}
      <path d={area} fill="url(#ag)" />
      <path d={d} fill="none" stroke="#1F9254" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p, i) => (i % Math.ceil(points.length / 7) === 0 || i === points.length - 1) && (
        <text key={i} x={x(i)} y={H - 8} fontSize="10" fill="#8A93AB" textAnchor="middle">{p.label}</text>
      ))}
      <circle cx={x(points.length - 1)} cy={y(points[points.length - 1].v)} r="4.5" fill="#fff" stroke="#1F9254" strokeWidth="2.5" />
    </svg>
  );
}
