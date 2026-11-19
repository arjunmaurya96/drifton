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
            <span className="text-sm text-muted-2">Based on {total} verified Google reviews</span>
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
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-700 font-head font-semibold text-white">
                    {(r.author || 'Customer').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <b className="font-semibold">{r.author || 'Customer'}</b>
                        <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                          Google Review
                        </span>
                      </div>
                      <Stars value={r.rating} size={17} />
                    </div>
                    <b className="font-head text-lg font-semibold">{r.title}</b>
                    <p className="leading-relaxed text-navy-500">{r.text}</p>
                    <span className="text-[13px] text-muted-2">{r.time ? `${r.time} · ` : ''}Variant: {p.short}</span>
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
