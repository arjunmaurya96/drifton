import { Link } from 'react-router-dom';

// "Product Information and Descriptions" (section 3 of the client's T&C), shown above "Pick your variant".
// SaaS-style layout: left = heading + 4 info cards, right = all 4 roll ons in a soft panel with small badges.
const points = [
  { t: 'Packaging may vary', d: 'Actual product packaging, colour or appearance may vary slightly from website images.', tint: '#EAF0FF', ink: '#2647B8' },
  { t: 'Updated from time to time', d: 'Product specifications, ingredients and packaging may be updated, subject to applicable regulations.', tint: '#E5F5EC', ink: '#17703D' },
  { t: 'Read before use', d: 'Please read the product label, ingredients and directions before use.', tint: '#FFF1E2', ink: '#C2410C' },
  { t: 'Experiences differ', d: 'Product suitability and individual experiences may vary from person to person.', tint: '#F6EAFE', ink: '#8B3FC2' },
];
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', width: 20, height: 20 };
const icons = [
  <svg key="a" {...I}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>,
  <svg key="b" {...I}><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></svg>,
  <svg key="c" {...I}><path d="M4 5h11l5 5v9a1 1 0 0 1-1 1H4z" /><path d="M8 11h8M8 15h6" /></svg>,
  <svg key="d" {...I}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M17 11a3 3 0 1 0 0-6M21.5 20a5.5 5.5 0 0 0-4-5.3" /></svg>,
];
const tick = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

export default function ProductInfoNote({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-line bg-white ${className}`}>
      {/* faint dotted grid background */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0F1A3C14_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(180deg,#000_0%,transparent_75%)]" />

      <div className="relative grid grid-cols-1 gap-10 p-5 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:p-12 xl:p-14">
        {/* ---------- left: text + cards ---------- */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-navy-900 shadow-sm">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-brand" /></span>
            Product information
          </span>
          <h2 className="mt-4 font-head text-[30px] font-bold leading-[1.1] tracking-tight text-navy-900 sm:text-[42px]">
            Honest about every <span className="bg-gradient-to-r from-brand to-[#2BB673] bg-clip-text text-transparent">roll on</span>
          </h2>
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-muted sm:text-[16px]">
            We make reasonable efforts to keep product descriptions, images, ingredients and prices on our website accurate. A few things to keep in mind:
          </p>

          <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {points.map((p, k) => (
              <li key={p.t} className="group flex flex-row items-start gap-3.5 rounded-2xl border border-line bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_18px_40px_-22px_rgba(15,26,60,.45)] sm:flex-col sm:gap-3 sm:p-5">
                <span className="flex shrink-0 items-center justify-between sm:w-full">
                  <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: p.tint, color: p.ink }}>{icons[k]}</span>
                  <span className="hidden font-head text-[12px] font-bold text-muted-2 sm:inline">0{k + 1}</span>
                </span>
                <span>
                  <b className="block font-head text-[16px] font-semibold text-navy-900">{p.t}</b>
                  <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{p.d}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link to="/terms" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-navy-900 px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(15,26,60,.7)] transition hover:bg-navy-700">
              Read full Terms &amp; Conditions <span aria-hidden="true">→</span>
            </Link>
            <span className="text-[13px] text-muted-2">Questions? <Link to="/contact" className="font-semibold text-navy-900 underline-offset-4 hover:underline">Contact us</Link></span>
          </div>
        </div>

        {/* ---------- right: product panel ---------- */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(160deg,#F3F7FF_0%,#FDF3F7_55%,#FFF6EA_100%)] px-6 pb-8 pt-12 ring-1 ring-line sm:px-10 sm:pt-14">
            <span aria-hidden="true" className="absolute left-1/2 top-[55%] aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-2xl" />
            <span aria-hidden="true" className="absolute bottom-6 left-1/2 h-4 w-[70%] -translate-x-1/2 rounded-[50%] bg-navy-900/20 blur-md" />
            <img src="/assets/images/hero-products/all-four.webp" alt="DriftOn Natural, Palash, Charcoal and Rose Alum Roll On" loading="lazy" decoding="async"
              className="relative mx-auto w-full max-w-[440px] object-contain" />
          </div>

          {/* floating badges */}
          <span className="absolute -top-3 left-4 flex items-center gap-2 rounded-xl border border-line bg-white/95 px-3 py-2 text-[12.5px] font-semibold text-navy-900 shadow-[0_12px_28px_-14px_rgba(15,26,60,.45)] backdrop-blur sm:left-6">
            <span className="flex size-6 items-center justify-center rounded-lg bg-mint-soft text-brand">{tick}</span> Natural alum crystal
          </span>
          <span className="absolute -bottom-4 right-4 flex items-center gap-3 rounded-xl border border-line bg-white/95 px-3.5 py-2.5 shadow-[0_12px_28px_-14px_rgba(15,26,60,.45)] backdrop-blur sm:right-6">
            <span className="flex -space-x-1.5">
              {['#F7B731', '#F48FB1', '#8E959E', '#E9E4C9'].map((c) => <span key={c} className="size-5 rounded-full ring-2 ring-white" style={{ background: c }} />)}
            </span>
            <span className="leading-tight"><b className="block font-head text-[14px] text-navy-900">4 variants</b><span className="text-[11.5px] text-muted-2">Palash · Rose · Charcoal · Natural</span></span>
          </span>
        </div>
      </div>
    </div>
  );
}
