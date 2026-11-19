import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import { Sparkle } from './Icons.jsx';

const [palash, charcoal, rose, natural] = products;

const items = [
  { text: 'Helps Reducing Sweat', product: palash },
  { text: 'Helps Reducing Odor', product: charcoal },
  { text: 'Help’s Brighter-Looking Skin', product: rose },
  { text: 'Helps Reducing Itching', product: natural },
];

export default function ProductMarquee({ dark = false }) {
  // Repeat 4 items 4 times for seamless infinite scroll
  const loop = [...items, ...items, ...items, ...items];

  return (
    <div className={`overflow-hidden border-b py-1 sm:py-1.5 ${dark ? 'border-navy-700 bg-navy-900' : 'border-line bg-white'}`}>
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]" style={{ animationDuration: '34s' }}>
        {loop.map((it, i) => (
          <Link
            key={i}
            to={`/product/${it.product.slug}`}
            aria-hidden={i >= items.length}
            tabIndex={i >= items.length ? -1 : 0}
            className={`group flex shrink-0 items-center gap-3.5 px-6 sm:gap-4.5 sm:px-8 ${
              dark ? 'text-white hover:text-mint' : 'text-navy-900 hover:text-brand'
            }`}
          >
            {/* Pure Product bottle with elegant 3D drop shadow, no circle container */}
            <img
              loading="lazy"
              decoding="async"
              src={it.product.image}
              alt={it.product.name}
              className="h-14 sm:h-16 w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(15,26,60,0.14)] transition-transform duration-300 group-hover:scale-105"
            />
            <span className="whitespace-nowrap font-head text-[20px] font-bold tracking-tight transition-colors sm:text-[25px] animate-soft-blink">
              {it.text}
            </span>
            <span className={`ml-6 sm:ml-8 ${dark ? 'text-mint/70' : 'text-brand/60'}`}>
              <Sparkle size={18} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
