import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import { Sparkle } from './Icons.jsx';

const [palash, charcoal, rose, natural] = products;
const items = [
  { name: 'Palash Flower', product: palash },
  { name: 'Activated Charcoal', product: charcoal },
  { name: 'Rose', product: rose },
  { name: 'Natural', product: natural },
  { name: 'Natural Crystal Alum', product: palash },
  { name: 'No White Marks', product: charcoal },
  { name: 'Long Lasting Stick', product: natural },
];

export default function ProductMarquee({ dark = false }) {
  const loop = [...items, ...items]; // duplicated for a seamless loop
  return (
    <div className={`overflow-hidden border-b py-5 ${dark ? 'border-navy-700 bg-navy-900' : 'border-line bg-white'}`}>
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {loop.map((it, i) => (
          <Link key={i} to={`/product/${it.product.slug}`} aria-hidden={i >= items.length} tabIndex={i >= items.length ? -1 : 0}
            className={`flex shrink-0 items-center gap-4 px-7 ${dark ? 'text-white hover:text-mint' : 'text-navy-900 hover:text-brand'}`}>
            <img loading="lazy" decoding="async" src={it.product.image} alt="" className="size-16 rounded-full border-[3px] border-[#EEF1F8] bg-blue-soft object-contain p-1.5" />
            <span className="whitespace-nowrap font-head text-[30px] font-semibold tracking-tight">{it.name}</span>
            <span className="ml-7 text-brand"><Sparkle /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
