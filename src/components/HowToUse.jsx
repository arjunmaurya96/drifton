import { Link } from 'react-router-dom';

// 3 steps — the client's step images, edge to edge. Each one opens a product page.
const steps = [
  { img: '/assets/images/steps/step-1.jpg', alt: 'Step 1 — Nahaya: start with a fresh shower', to: '/product/rose-alum-stick' },
  { img: '/assets/images/steps/step-2.jpg', alt: 'Step 2 — Dhoya: dip the crystal in water for a second', to: '/product/natural-alum-stick' },
  { img: '/assets/images/steps/step-3.jpg', alt: 'Step 3 — Drifton lagaya? Glide it on clean, damp skin', to: '/product/palash-alum-stick' },
];

export default function HowToUse() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-white">
      <div className="container-x flex flex-col items-center gap-3 py-14 text-center sm:py-16">
        <span className="eyebrow flex items-center gap-3 before:h-0.5 before:w-8 before:bg-brand after:h-0.5 after:w-8 after:bg-brand">3 simple steps</span>
        <h2 id="how-title" className="font-serif text-[52px] leading-none text-navy-900 sm:text-[72px]">How to <span className="text-brand">use</span></h2>
        <p className="max-w-[460px] text-[17px] text-muted">Nahaya, dhoya, Drifton lagaya. Fresh all day in under 10 seconds.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {steps.map((s) => (
          <Link key={s.img} to={s.to} className="block overflow-hidden">
            <img src={s.img} alt={s.alt} loading="lazy" className="block aspect-[2/3] w-full object-cover" />
          </Link>
        ))}
      </div>
    </section>
  );
}
