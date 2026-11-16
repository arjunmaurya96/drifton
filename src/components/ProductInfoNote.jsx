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

function Point({ p, k, align }) {
  return (
    <li className={`flex items-start gap-4 ${align === 'right' ? 'lg:flex-row-reverse lg:text-right' : ''}`}>
      <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-navy-900 shadow-[0_12px_30px_-12px_rgba(15,26,60,.35)] ring-1 ring-line">
        {icons[k]}
        <span className="absolute -top-2 left-1/2 flex h-5 -translate-x-1/2 items-center rounded-full bg-brand px-2 text-[10.5px] font-bold text-white">0{k + 1}</span>
      </span>
      <span className="pt-0.5">
        <b className="block font-head text-[17px] font-semibold text-navy-900">{p.t}</b>
        <span className="mt-1 block text-[14px] leading-relaxed text-muted">{p.d}</span>
      </span>
    </li>
  );
}

// Layout: heading on top, the 4 roll ons in the middle, 2 points on each side (like an infographic).
export default function ProductInfoNote({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#FFF8EE_0%,#FFFFFF_45%,#F1F8FC_100%)] px-5 py-10 ring-1 ring-line sm:px-10 sm:py-14 ${className}`}>
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
        <span className="eyebrow flex items-center gap-2.5 before:h-0.5 before:w-6 before:bg-brand after:h-0.5 after:w-6 after:bg-brand">Product information</span>
        <h2 className="font-serif text-[36px] leading-[1.05] text-navy-900 sm:text-[52px]">Honest about every <span className="italic text-brand">roll on</span></h2>
        <p className="text-[15px] leading-relaxed text-muted sm:text-[16px]">We make reasonable efforts to ensure that product descriptions, images, ingredients, prices and other information on our website are accurate. However:</p>
      </div>

      <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-10">
        <ol className="order-2 flex flex-col gap-8 lg:order-1">
          {points.slice(0, 2).map((p, k) => <Point key={p.t} p={p} k={k} align="right" />)}
        </ol>
        <div className="relative order-1 flex items-end justify-center lg:order-2">
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#FFE7C7_0%,#FDEFF4_55%,transparent_100%)]" />
          <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-5 w-[80%] -translate-x-1/2 rounded-[50%] bg-navy-900/20 blur-md" />
          <img src="/assets/images/hero-products/all-four.webp" alt="DriftOn Natural, Palash, Charcoal and Rose Alum Roll On" loading="lazy" decoding="async"
            className="relative w-full max-w-[460px] object-contain" />
        </div>
        <ol className="order-3 flex flex-col gap-8">
          {points.slice(2).map((p, k) => <Point key={p.t} p={p} k={k + 2} align="left" />)}
        </ol>
      </div>

      <div className="mt-10 flex justify-center">
        <Link to="/terms" className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-navy-900 px-5 text-[14px] font-semibold text-navy-900 hover:bg-navy-900 hover:text-white">
          Read our full Terms &amp; Conditions <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
