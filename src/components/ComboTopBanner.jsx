import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { combos, formatINR, getProductById, COMBO_PRICE, UNIT_PRICE, COMBO_SAVING } from '../data/products.js';
import { Arrow } from './Icons.jsx';

/** Combo offer banner shown at the top of every inner page. The combo photo changes every few seconds. */
export default function ComboTopBanner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % combos.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section aria-label="Combo offer" className="container-wide pt-4 sm:pt-5">
      <Link to="/combo" className="group relative flex h-[230px] overflow-hidden rounded-2xl bg-navy-900 text-white sm:h-[260px] lg:h-[280px]">
        {/* combo products (cross-fade): both sticks of the combo, big, on their own colours */}
        <div className="absolute inset-y-0 right-0 w-[48%] sm:w-[52%] lg:w-[50%]">
          {combos.map((c, k) => {
            const ps = c.items.map(getProductById);
            return (
              <div key={c.id} aria-hidden={k !== i}
                className={`absolute inset-0 flex items-end justify-center gap-[3%] pb-3 transition-opacity duration-700 sm:pb-4 ${k === i ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: `linear-gradient(110deg, ${ps[0].bg}, ${ps[1].bg})` }}>
                {ps.map((p) => <img key={p.id} src={p.image} alt={k === i ? p.name : ''} className="h-[86%] w-auto max-w-[46%] object-contain" />)}
              </div>
            );
          })}
          <span className="absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-navy-900 to-transparent" />
        </div>

        <div className="relative z-[2] flex max-w-[58%] flex-col justify-center gap-2 px-5 sm:max-w-[52%] sm:gap-3 sm:px-10 lg:px-14">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-mint sm:text-xs">Combo offer</span>
          <b className="font-serif text-[30px] font-normal leading-[1.05] sm:text-[46px] lg:text-[54px]">Any 2 for {formatINR(COMBO_PRICE)}</b>
          <span className="text-[13px] text-ondark sm:text-[16px]">
            <s className="opacity-70">{formatINR(UNIT_PRICE * 2)}</s> · Save {formatINR(COMBO_SAVING)} + free delivery
          </span>
          <span className="mt-1 hidden flex-wrap gap-2 sm:flex">
            {combos.map((c, k) => (
              <span key={c.id} className={`rounded-full px-3 py-1 text-[13px] font-semibold ${k === i ? 'bg-white text-navy-900' : 'bg-white/10 text-white'}`}>{c.name}</span>
            ))}
          </span>
          <span className="mt-2 inline-flex min-h-10 items-center gap-2 self-start whitespace-nowrap rounded-full bg-mint px-4 text-[13px] font-bold uppercase tracking-wide text-navy-900 sm:min-h-11 sm:px-5 sm:text-sm">
            Shop combos <Arrow size={16} />
          </span>
        </div>
      </Link>
    </section>
  );
}
