import { useState } from 'react';
import { Plus, Minus } from '../Icons.jsx';

export default function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="pb-12">
      <div className="container-x grid grid-cols-1 gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <span className="eyebrow">FAQ's</span>
          <h2 className="h2">Questions? <span className="text-brand">Answered.</span></h2>
          <p className="text-[17px] text-muted">Everything you need to know before your first Drifton.</p>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((f, i) => (
            <div key={f.q} className={`rounded-3xl border bg-white transition ${open === i ? 'border-navy-700' : 'border-line'}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-head text-lg font-semibold">
                {f.q}
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${open === i ? 'bg-navy-700 text-white' : 'bg-page'}`}>{open === i ? <Minus size={16} /> : <Plus size={16} />}</span>
              </button>
              {open === i && <p className="animate-fade-up px-6 pb-6 leading-relaxed text-muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
