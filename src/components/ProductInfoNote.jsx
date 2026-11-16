// "Product Information and Descriptions" (section 3 of the client's T&C), shown just above the products.
const points = [
  { t: 'Packaging may vary', d: 'Actual product packaging, colour or appearance may vary slightly from website images.' },
  { t: 'Updates from time to time', d: 'Product specifications, ingredients and packaging may be updated from time to time, subject to applicable regulations.' },
  { t: 'Read before use', d: 'Customers are advised to read the product label, ingredients and directions before use.' },
  { t: 'Experiences differ', d: 'Product suitability and individual experiences may vary from person to person.' },
];

export default function ProductInfoNote({ className = '' }) {
  return (
    <div className={`overflow-hidden rounded-2xl border-[1.5px] border-[#6AAED0] bg-[#EEF6F9] ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        <div className="flex flex-col justify-center gap-2 p-5 sm:p-6 lg:border-r lg:border-[#C9E2EE]">
          <span className="text-[11.5px] font-bold uppercase tracking-[2px] text-[#2E7FA8]">Product information</span>
          <h3 className="font-head text-[19px] font-semibold leading-snug text-navy-900 sm:text-[21px]">Product information &amp; descriptions</h3>
          <p className="text-[13.5px] leading-relaxed text-navy-500">We make reasonable efforts to ensure that product descriptions, images, ingredients, prices and other information on our website are accurate. However:</p>
        </div>
        <ul className="grid grid-cols-1 gap-px bg-[#C9E2EE] sm:grid-cols-2">
          {points.map((p, k) => (
            <li key={p.t} className="flex gap-3 bg-[#EEF6F9] p-4 sm:p-5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[12.5px] font-bold text-[#2E7FA8] ring-1 ring-[#6AAED0]">{k + 1}</span>
              <span>
                <b className="block text-[14px] font-semibold text-navy-900">{p.t}</b>
                <span className="text-[13px] leading-relaxed text-navy-500">{p.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
