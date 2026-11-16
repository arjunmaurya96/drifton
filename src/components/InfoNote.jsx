import { Link } from 'react-router-dom';

// Light-blue note boxes the client asked for.
const box = 'rounded-2xl border-[1.5px] border-[#6AAED0] bg-[#EEF6F9] text-navy-900';

export function ImagesNote({ className = '' }) {
  return (
    <div className={`${box} px-5 py-4 sm:px-6 ${className}`}>
      <b className="block font-head text-[15px] font-semibold sm:text-base">Note:</b>
      <p className="mt-1 text-[14px] leading-relaxed sm:text-[15px]">
        The Product images shown are for illustrative purposes only. Actual products may vary slightly in color, design, or packaging.
      </p>
    </div>
  );
}

export function TaxNote({ className = '' }) {
  return (
    <p className={`${box} px-4 py-3 text-[14px] leading-relaxed ${className}`}>
      Taxes included. Discounts and <Link to="/terms" className="font-semibold underline underline-offset-2">shipping</Link> calculated at checkout.
    </p>
  );
}
