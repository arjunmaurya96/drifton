import { useState } from 'react';
import { sampleReviews, getProductById } from '../data/products.js';
import { ChevronLeft, ChevronRight, Quote, Star } from './Icons.jsx';

export function Stars({ value = 5, size = 19 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-[#F2A93B]' : 'text-line-strong'}><Star size={size} /></span>
      ))}
    </span>
  );
}

// Home page review carousel (SAMPLE reviews from data/products.js)
export default function Reviews() {
  const [start, setStart] = useState(0);
  const n = sampleReviews.length;
  const visible = [0, 1, 2].map((k) => ({ ...sampleReviews[(start + k) % n], key: (start + k) % n }));

  return (
    <section id="reviews" className="border-y border-line bg-white py-24">
      <div className="container-x">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-3">
            <span className="eyebrow">Reviews</span>
            <h2 className="h2">What our <span className="text-brand">community</span> says</h2>
          </div>
          <div className="flex gap-2">
            <button className="icon-btn-outline size-12" onClick={() => setStart((start + n - 1) % n)} aria-label="Previous reviews"><ChevronLeft /></button>
            <button className="icon-btn size-12 bg-navy-700 text-white hover:bg-navy-900" onClick={() => setStart((start + 1) % n)} aria-label="Next reviews"><ChevronRight /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const p = getProductById(r.productId);
            return (
              <article key={r.key} className="lift flex animate-fade-up flex-col gap-5 rounded-[28px] border border-line bg-page p-7">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} />
                  <span className="rounded-full border border-[#E0E4EF] bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-muted-2">Sample review</span>
                </div>
                <span className="text-[#C9D3F0]"><Quote /></span>
                <div className="flex flex-1 flex-col gap-2">
                  <b className="font-head text-xl font-semibold">{r.title}</b>
                  <p className="text-[17px] leading-relaxed text-navy-500">{r.text}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[#E0E4EF] pt-4">
                  <span className="flex items-center gap-3">
                    <span className="flex size-[46px] items-center justify-center rounded-full bg-navy-700 font-head font-semibold text-white">CN</span>
                    <span>
                      <b className="block text-[15.5px] font-semibold">Customer name</b>
                      <small className="text-[13.5px] text-muted-2">{p.name}</small>
                    </span>
                  </span>
                  <img src={p.image} alt="" className="size-[54px] rounded-2xl bg-white object-contain p-1" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
