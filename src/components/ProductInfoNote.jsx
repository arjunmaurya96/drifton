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
    <div className={`relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0F1A3C_0%,#1B2D63_55%,#24407F_100%)] text-white ${className}`}>
      {/* soft light + fine grid */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/2 size-[720px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,.28),transparent_62%)]" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_70%_50%,#000,transparent_75%)]" />

      <div className="relative grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-6 lg:p-12 xl:p-14">
        {/* ---------- left ---------- */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-mint" /></span>
            Product information
          </span>
          <h2 className="mt-4 font-head text-[32px] font-bold leading-[1.08] tracking-tight sm:text-[46px]">
            Honest about every <span className="bg-gradient-to-r from-mint to-[#7DD3FC] bg-clip-text text-transparent">roll on.</span>
          </h2>
          <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-ondark sm:text-[16px]">
            We keep descriptions, images, ingredients and prices accurate. A few things to know before you buy:
          </p>

          <ul className="mt-7 flex flex-col gap-2.5">
            {points.map((p, k) => (
              <li key={p.t} className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur transition duration-300 hover:border-white/25 hover:bg-white/[.1]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: p.tint, color: p.ink }}>{icons[k]}</span>
                <span className="min-w-0">
                  <b className="block font-head text-[15.5px] font-semibold text-white">{p.t}</b>
                  <span className="mt-0.5 block text-[13.5px] leading-relaxed text-ondark">{p.d}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link to="/terms" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-navy-900 transition hover:bg-mint-soft">
              Read full Terms &amp; Conditions <span aria-hidden="true">→</span>
            </Link>
            <Link to="/contact" className="text-[14px] font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline">Questions? Contact us</Link>
          </div>
        </div>

        {/* ---------- right: big product stage ---------- */}
        <div className="relative flex min-h-[300px] items-end justify-center pt-10 sm:min-h-[440px] sm:pt-0 lg:min-h-[560px]">
          {/* glow + podium */}
          <span aria-hidden="true" className="absolute left-1/2 top-[42%] aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.34),rgba(125,211,252,.12)_45%,transparent_70%)]" />
          <span aria-hidden="true" className="absolute bottom-[3%] left-1/2 h-[14%] w-[96%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.22),rgba(255,255,255,.04)_60%,transparent_72%)]" />
          <span aria-hidden="true" className="absolute bottom-[6%] left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-xl" />
          <img src="/assets/images/hero-products/all-four.webp" alt="DriftOn Natural, Palash, Charcoal and Rose Alum Roll On" loading="lazy" decoding="async"
            className="relative z-[1] mb-[9%] w-full max-w-[640px] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.35)]" />

          {/* floating badges */}
          <span className="absolute left-0 top-0 z-[2] flex sm:top-[6%] items-center gap-2 rounded-xl bg-white px-3 py-2 text-[12.5px] font-semibold text-navy-900 shadow-[0_14px_30px_-12px_rgba(0,0,0,.45)] sm:top-6">
            <span className="flex size-6 items-center justify-center rounded-lg bg-mint-soft text-brand">{tick}</span> Natural alum crystal
          </span>
          <span className="absolute right-0 top-[6%] z-[2] hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-[12.5px] font-semibold text-navy-900 shadow-[0_14px_30px_-12px_rgba(0,0,0,.45)] sm:flex">
            <span className="flex size-6 items-center justify-center rounded-lg bg-[#EAF0FF] text-[#2647B8]">{tick}</span> No white marks
          </span>
          <span className="absolute bottom-0 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-xl bg-white px-3.5 py-2.5 shadow-[0_14px_30px_-12px_rgba(0,0,0,.45)]">
            <span className="flex -space-x-1.5">
              {['#F7B731', '#3A3F48', '#F48FB1', '#E9E4C9'].map((c) => <span key={c} className="size-5 rounded-full ring-2 ring-white" style={{ background: c }} />)}
            </span>
            <span className="leading-tight"><b className="block font-head text-[14px] text-navy-900">4 variants · ₹475</b><span className="text-[11.5px] text-muted-2">Palash · Charcoal · Rose · Natural</span></span>
          </span>
        </div>
      </div>
    </div>
  );
}
