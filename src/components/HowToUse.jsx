// 3 steps with real Drifton photos, full width and full height.
// Swap any photo by changing `img` (files live in public/assets/images/).
const steps = [
  { no: 'Step 1', title: 'Nahaya', text: 'Start with a fresh shower.', img: '/assets/images/rose.jpg', pos: 'center' },
  { no: 'Step 2', title: 'Dhoya', text: 'Dip the crystal in water for a second.', img: '/assets/images/lavender-crystal.jpg', pos: 'center' },
  { no: 'Step 3', title: 'Drifton lagaya?', text: 'Glide it on clean, damp skin. Fresh all day.', img: '/assets/images/models/model-girl.jpg', pos: '62% center' },
];

export default function HowToUse() {
  return (
    <section id="how" aria-label="How to use" className="grid grid-cols-1 bg-navy-900 md:grid-cols-3">
      {steps.map((s) => (
        <div key={s.no} className="relative h-[78svh] min-h-[520px] overflow-hidden text-white md:h-[100svh] md:max-h-[900px]">
          <img src={s.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: s.pos }} />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-transparent" />
          <div className="relative flex flex-col gap-2 px-8 pt-14 lg:px-12 lg:pt-16">
            <span className="font-head text-[44px] font-bold leading-none tracking-tight lg:text-[52px]">{s.no}</span>
            <span className="font-head text-[38px] font-normal leading-tight text-mint lg:text-[46px]">{s.title}</span>
            <span className="mt-1 max-w-[360px] text-lg text-white/90">{s.text}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
