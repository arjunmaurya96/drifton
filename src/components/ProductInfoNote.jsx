import { Link } from 'react-router-dom';

// "Product Information and Descriptions" (section 3 of the client's T&C), shown above "Pick your variant".
// Left: the content. Right: all 4 roll ons in one image.
const points = [
  { t: 'Packaging may vary', d: 'Actual product packaging, colour or appearance may vary slightly from website images.' },
  { t: 'Updated from time to time', d: 'Product specifications, ingredients and packaging may be updated, subject to applicable regulations.' },
  { t: 'Read before use', d: 'Please read the product label, ingredients and directions before use.' },
  { t: 'Experiences differ', d: 'Product suitability and individual experiences may vary from person to person.' },
];
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', width: 20, height: 20 };
const icons = [
  <svg key="a" {...I}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>,
  <svg key="b" {...I}><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></svg>,
  <svg key="c" {...I}><path d="M4 5h11l5 5v9a1 1 0 0 1-1 1H4z" /><path d="M8 11h8M8 15h6" /></svg>,
  <svg key="d" {...I}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M17 11a3 3 0 1 0 0-6M21.5 20a5.5 5.5 0 0 0-4-5.3" /></svg>,
];

export default function ProductInfoNote({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-[radial-gradient(120%_120%_at_0%_0%,#24408F_0%,#0F1A3C_55%,#0B1430_100%)] text-white ${className}`}>
      {/* soft glows */}
      <span aria-hidden="true" className="absolute -left-24 top-1/3 size-[420px] rounded-full bg-[#2E7FA8]/30 blur-[90px]" />
      <span aria-hidden="true" className="absolute -right-20 -top-20 size-[300px] rounded-full bg-mint/15 blur-[80px]" />

      <div className="relative grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:p-14">
        {/* products on a glowing stage */}
        <div className="relative order-2 flex items-end justify-center pt-6 lg:order-1">
          <span aria-hidden="true" className="absolute bottom-[6%] left-1/2 h-[46%] w-[88%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(123,224,166,.35),transparent)]" />
          <span aria-hidden="true" className="absolute bottom-[3%] left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-md" />
          <img src="/assets/images/hero-products/all-four.webp" alt="DriftOn Natural, Palash, Charcoal and Rose Alum Roll On" loading="lazy" decoding="async"
            className="relative w-full max-w-[520px] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.45)]" />
        </div>

        {/* content */}
        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[2px] text-mint ring-1 ring-white/15">
              <span className="size-1.5 rounded-full bg-mint" /> Product information
            </span>
            <h2 className="font-head text-[30px] font-bold leading-[1.08] tracking-tight sm:text-[42px]">
              Honest about every <span className="bg-gradient-to-r from-mint to-[#7FD3F7] bg-clip-text text-transparent">roll on.</span>
            </h2>
            <p className="max-w-[560px] text-[15px] leading-relaxed text-ondark sm:text-[16px]">
              We make reasonable efforts to ensure that product descriptions, images, ingredients, prices and other information on our website are accurate. However:
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {points.map((p, k) => (
              <li key={p.t} className="group flex gap-3.5 rounded-2xl bg-white/[.06] p-4 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[.1] hover:ring-mint/40">
                <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mint to-[#3FB27F] text-navy-900">
                  {icons[k]}
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-white text-[10.5px] font-bold text-navy-900">{k + 1}</span>
                </span>
                <span>
                  <b className="block text-[15px] font-semibold text-white">{p.t}</b>
                  <span className="text-[13.5px] leading-relaxed text-[#B7C1DF]">{p.d}</span>
                </span>
              </li>
            ))}
          </ol>

          <Link to="/terms" className="inline-flex items-center gap-2 self-start text-[14px] font-semibold text-mint hover:text-white">
            Read our full Terms &amp; Conditions <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
