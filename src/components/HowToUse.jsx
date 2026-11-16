import { Link } from 'react-router-dom';

// 3 steps — the client's step images, edge to edge. Each one opens a product page.
const steps = [
  { img: '/assets/images/steps/step-1.jpg', alt: 'Step 1 — Nahaya: start with a fresh shower', to: '/product/rose-alum-stick' },
  { img: '/assets/images/steps/step-2.jpg', alt: 'Step 2 — Dhoya: dip the crystal in water for a second', to: '/product/lavender-alum-stick' },
  { img: '/assets/images/steps/step-3.jpg', alt: 'Step 3 — Drifton lagaya? Glide it on clean, damp skin', to: '/product/palash-flower-alum-stick' },
];

export default function HowToUse() {
  return (
    <section id="how" aria-label="How to use" className="grid grid-cols-1 bg-white md:grid-cols-3">
      {steps.map((s) => (
        <Link key={s.img} to={s.to} className="block overflow-hidden">
          <img src={s.img} alt={s.alt} loading="lazy" className="block aspect-[2/3] w-full object-cover" />
        </Link>
      ))}
    </section>
  );
}
