import { useState } from 'react';
import { getProductById } from '../../data/products.js';
import { Stars } from '../Reviews.jsx';
import { useStore } from '../../context/StoreContext.jsx';

const PER_PAGE = 3;

/** Customer reviews with rating summary + distribution bars + pagination (phitku style). */
export default function ReviewsBlock({ reviews }) {
  const { notify } = useStore();
  const [page, setPage] = useState(0);
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => {
    const c = reviews.filter((r) => r.rating === s).length;
    return { s, c, pct: total ? Math.round((c / total) * 100) : 0 };
  });
  const pages = Math.ceil(total / PER_PAGE);
  const shown = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section id="product-reviews" className="py-10">
      <div className="container-x">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="eyebrow">Customer reviews</span>
            <h2 className="h2">Loved by our <span className="text-brand">community</span></h2>
          </div>
          <button className="btn-navy" onClick={() => notify('Review form coming soon (demo)')}>Write a review</button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
          <div className="flex h-fit flex-col gap-5 rounded-[28px] border border-line bg-white p-7 lg:sticky lg:top-[100px]">
            <div className="flex items-end gap-3">
              <b className="font-head text-6xl font-bold leading-none">{avg.toFixed(1)}</b>
              <span className="pb-1 text-muted-2">out of 5</span>
            </div>
            <Stars value={avg} size={22} />
            <span className="text-sm text-muted-2">Based on {total} sample reviews</span>
            <div className="flex flex-col gap-2.5">
              {dist.map((d) => (
                <div key={d.s} className="flex items-center gap-3 text-sm">
                  <span className="w-6 font-semibold">{d.s}★</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#EEF1F8]"><span className="block h-full rounded-full bg-[#F2A93B]" style={{ width: `${d.pct}%` }} /></span>
                  <span className="w-16 text-right text-muted-2">{d.pct}% ({d.c})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {shown.map((r, k) => {
              const p = getProductById(r.productId);
              return (
                <article key={page * PER_PAGE + k} className="flex animate-fade-up flex-col gap-4 rounded-[28px] border border-line bg-white p-7 sm:flex-row sm:items-start">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-700 font-head font-semibold text-white">CN</span>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <b className="font-semibold">Customer name <span className="ml-1 text-xs font-bold uppercase tracking-wide text-muted-2">· Sample</span></b>
                      <Stars value={r.rating} size={17} />
                    </div>
                    <b className="font-head text-lg font-semibold">{r.title}</b>
                    <p className="leading-relaxed text-navy-500">{r.text}</p>
                    <span className="text-[13px] text-muted-2">Variant: {p.short}</span>
                  </div>
                  <img loading="lazy" decoding="async" src={p.image} alt="" className="size-20 rounded-2xl bg-page object-contain p-1.5" />
                </article>
              );
            })}
            {pages > 1 && (
              <div className="flex gap-2">
                {Array.from({ length: pages }, (_, k) => (
                  <button key={k} onClick={() => setPage(k)} aria-current={k === page}
                    className={`size-11 rounded-full font-semibold ${k === page ? 'bg-navy-700 text-white' : 'border-[1.5px] border-line-strong bg-white'}`}>{k + 1}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
