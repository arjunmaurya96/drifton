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
    <div className={`overflow-hidden rounded-[28px] border border-[#CFE3EE] bg-gradient-to-br from-[#F3F9FC] via-white to-[#EEF6F9] ${className}`}>
      <div className="grid grid-cols-1 items-center lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5 p-6 sm:p-9 lg:p-12">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[2px] text-[#2E7FA8] ring-1 ring-[#CFE3EE]">
            <span className="size-1.5 rounded-full bg-[#2E7FA8]" /> Product information
          </span>
          <div>
            <h2 className="font-head text-[28px] font-bold leading-tight tracking-tight text-navy-900 sm:text-[36px]">Honest about every <span className="text-brand">roll on.</span></h2>
            <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted">We make reasonable efforts to ensure that product descriptions, images, ingredients, prices and other information on our website are accurate. However:</p>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {points.map((p, k) => (
              <li key={p.t} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#E2EDF3]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FA] text-[#2E7FA8]">{icons[k]}</span>
                <span>
                  <b className="block text-[14.5px] font-semibold text-navy-900">{p.t}</b>
                  <span className="text-[13px] leading-relaxed text-muted">{p.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex h-full items-end justify-center px-6 pb-8 pt-2 sm:px-10 lg:py-12">
          <span aria-hidden="true" className="absolute inset-x-[12%] bottom-6 top-[18%] rounded-full bg-[radial-gradient(closest-side,#D6EAF5,transparent)]" />
          <img src="/assets/images/hero-products/all-four.webp" alt="DriftOn Natural, Palash, Charcoal and Rose Alum Roll On" loading="lazy" decoding="async"
            className="relative w-full max-w-[560px] object-contain" />
        </div>
      </div>
    </div>
  );
}
