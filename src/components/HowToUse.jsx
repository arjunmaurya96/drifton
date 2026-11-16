// 3 steps — the client's step images (text is part of each image), shown edge to edge.
const steps = [
  { img: '/assets/images/steps/step-1.jpg', alt: 'Step 1 — Nahaya: start with a fresh shower' },
  { img: '/assets/images/steps/step-2.jpg', alt: 'Step 2 — Dhoya: dip the crystal in water for a second' },
  { img: '/assets/images/steps/step-3.jpg', alt: 'Step 3 — Drifton lagaya? Glide it on clean, damp skin' },
];

export default function HowToUse() {
  return (
    <section id="how" aria-label="How to use" className="grid grid-cols-1 bg-white md:grid-cols-3">
      {steps.map((s) => (
        <img key={s.img} src={s.img} alt={s.alt} loading="lazy" className="block aspect-[2/3] w-full object-cover" />
      ))}
    </section>
  );
}
