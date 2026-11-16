import { products } from '../data/products.js';

// How to use — 4 simple steps with the real products (no old step images).
const byId = (id) => products.find((p) => p.id === id);
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', width: 26, height: 26 };
const icons = {
  shower: <svg {...I}><path d="M4 20V9a5 5 0 0 1 10 0" /><path d="M10 9h8" /><path d="M12 13v1M15 13v1M18 13v1M13 17v1M16 17v1M19 17v1" /></svg>,
  drop: <svg {...I}><path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z" /><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.5" /></svg>,
  glide: <svg {...I}><path d="M4 17c4-1 6-4 8-8s4-5 8-5" /><path d="M16 4h4v4" /><circle cx="5" cy="17" r="1.5" /></svg>,
  cap: <svg {...I}><path d="M8 3h8v5H8z" /><path d="M7 8h10l-1 13H8z" /><path d="M10 13l1.5 1.5L15 11" /></svg>,
};
const steps = [
  { n: '01', id: 'natural', icon: 'shower', title: 'Start fresh', text: 'Take a shower and keep your underarms clean.' },
  { n: '02', id: 'palash', icon: 'drop', title: 'Wet the crystal', text: 'Remove the cap and dip the crystal top in water for a second.' },
  { n: '03', id: 'charcoal', icon: 'glide', title: 'Glide it on', text: 'Gently glide it 3–4 times on clean, damp underarms.' },
  { n: '04', id: 'rose', icon: 'cap', title: 'Dry & close', text: 'Let it dry, wipe the crystal and put the cap back on.' },
];

export default function HowToUse() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-white pb-16 sm:pb-20">
      <div className="container-x flex flex-col items-center gap-3 py-12 text-center sm:py-14">
        <span className="eyebrow flex items-center gap-3 before:h-0.5 before:w-8 before:bg-brand after:h-0.5 after:w-8 after:bg-brand">4 simple steps</span>
        <h2 id="how-title" className="font-serif text-[48px] leading-none text-navy-900 sm:text-[68px]">How to <span className="text-brand">use</span></h2>
        <p className="max-w-[460px] text-[16px] text-muted sm:text-[17px]">Fresh all day in under 10 seconds.</p>
      </div>
      <ol className="container-wide grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {steps.map((s, k) => {
          const p = byId(s.id);
          return (
            <li key={s.n} className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative flex h-[250px] items-end justify-center pt-6 sm:h-[280px]" style={{ background: `linear-gradient(180deg, ${p.bg} 0%, #FFFFFF 100%)` }}>
                <span className="absolute left-4 top-4 font-jost text-[52px] font-semibold leading-none text-navy-900/15">{s.n}</span>
                <span className="absolute right-4 top-4 flex size-12 items-center justify-center rounded-full bg-white text-navy-900 shadow-sm">{icons[s.icon]}</span>
                <img src={p.image} alt="" loading="lazy" decoding="async" className="h-[88%] w-auto object-contain" />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-5">
                <span className="text-[12px] font-bold uppercase tracking-[2px] text-brand">Step {k + 1}</span>
                <h3 className="font-head text-[20px] font-semibold text-navy-900">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
