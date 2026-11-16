import { useEffect } from 'react';
import { termsEffective, termsIntro, termsSections } from '../data/terms.js';
import { business } from '../data/site.js';
import { Close } from './Icons.jsx';

// Footer policies. All text comes from the client's Terms & Conditions (src/data/terms.js).
const pick = (...titles) => termsSections.filter((s) => titles.includes(s.title));
const contact = pick('Grievance Redressal and Customer Support');

export const policies = {
  privacy: { title: 'Privacy Policy', sections: [...pick('Privacy and Customer Information', 'Website Usage'), ...contact] },
  shipping: { title: 'Shipping Policy', sections: [...pick('Shipping and Delivery', 'Orders and Order Acceptance'), ...contact] },
  returns: { title: 'Return & Exchange', sections: [...pick('Return and Refund Policy'), ...contact] },
  terms: { title: 'Terms & Conditions', intro: termsIntro, sections: termsSections },
};

const linkify = (text) =>
  text.split(/([\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) =>
    /@/.test(part) ? <a key={i} href={`mailto:${part}`} className="font-semibold text-navy-700 underline">{part}</a> : part);

export default function PolicyModal({ id, onClose }) {
  const p = policies[id];
  useEffect(() => {
    if (!p) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [p, onClose]);
  if (!p) return null;

  return (
    <div className="fixed inset-0 z-[90] flex animate-fade-in items-end justify-center bg-navy-900/60 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={p.title} onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90svh] w-full max-w-[720px] animate-fade-up flex-col overflow-hidden rounded-t-[24px] bg-white text-navy-900 shadow-2xl sm:rounded-[24px]">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
          <div>
            <h2 className="font-head text-[20px] font-semibold sm:text-[22px]">{p.title}</h2>
            <p className="text-[12.5px] text-muted-2">DriftOn™ by {business.legalName} · Effective {termsEffective}</p>
          </div>
          <button className="icon-btn shrink-0" onClick={onClose} aria-label="Close"><Close /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-7">
          {p.intro && <p className="mb-4 text-[13.5px] leading-relaxed text-muted">{p.intro}</p>}
          <div className="flex flex-col gap-4">
            {p.sections.map((sec) => (
              <section key={sec.title}>
                <h3 className="mb-1.5 font-head text-[15px] font-semibold">{sec.title}</h3>
                <div className="flex flex-col gap-1.5 text-[13.5px] leading-relaxed text-muted">
                  {sec.blocks.map((b, i) =>
                    b.h ? <h4 key={i} className="mt-1 font-semibold text-navy-900">{b.h}</h4>
                    : b.ul ? <ul key={i} className="flex list-disc flex-col gap-0.5 pl-5">{b.ul.map((x) => <li key={x}>{linkify(x)}</li>)}</ul>
                    : <p key={i} className="break-words">{linkify(b.p)}</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="border-t border-line px-5 py-3 sm:px-7">
          <button onClick={onClose} className="btn-navy min-h-11 w-full sm:w-auto">Close</button>
        </div>
      </div>
    </div>
  );
}
