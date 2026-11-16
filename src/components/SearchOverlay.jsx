import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { products, formatINR } from '../data/products.js';
import { Search, Close } from './Icons.jsx';

const norm = (t) => t.toLowerCase();

/** Full-width search panel under the header. Filters products as you type; Enter opens the first result. */
export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const input = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setQ('');
    setTimeout(() => input.current?.focus(), 30);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return products;
    return products.filter((p) => [p.name, p.short, p.tag, p.ingredient, p.tagline, p.description].some((f) => norm(f || '').includes(t)));
  }, [q]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (results[0]) { navigate(`/product/${results[0].slug}`); onClose(); }
  };

  return (
    <>
      <div className="fixed inset-0 z-[45] animate-fade-in bg-navy-900/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search products" className="absolute inset-x-0 top-full z-[46] animate-fade-up border-b border-line bg-white shadow-2xl">
        <div className="container-x py-6">
          <form onSubmit={submit} className="flex items-center gap-3 rounded-full border-[1.5px] border-navy-700 bg-white py-1.5 pl-5 pr-1.5">
            <span className="text-muted-2"><Search /></span>
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Palash, Charcoal, Rose, alum…"
              aria-label="Search products" className="min-w-0 flex-1 bg-transparent py-2 text-[17px] outline-none" />
            <button type="button" onClick={onClose} className="icon-btn" aria-label="Close search"><Close /></button>
          </form>

          <div className="mt-5">
            <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-2">
              {q.trim() ? `${results.length} result${results.length === 1 ? '' : 's'} for “${q.trim()}”` : 'All products'}
            </span>
            {results.length === 0 ? (
              <p className="py-6 text-muted">No products found. Try “charcoal”, “rose” or “alum”.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-2xl border border-line p-2.5 pr-4 text-navy-900 hover:border-navy-700 hover:text-navy-900">
                      <img src={p.image} alt="" className="size-16 rounded-xl object-cover" />
                      <span className="min-w-0">
                        <b className="block truncate font-head font-semibold">{p.name}</b>
                        <span className="text-sm text-muted-2">{formatINR(p.price)} <s className="ml-1">{formatINR(p.mrp)}</s></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
