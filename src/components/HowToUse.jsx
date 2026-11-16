// How to use — the same 4 steps as printed on the DriftOn pack:
// 1 Clean & wash · 2 Wet the crystal · 3 Apply gently · 4 Wipe clean & store.
// Photos: our model photos for now — swap in the client's real lifestyle photos in public/assets/images/models/.
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 32 32', width: 30, height: 30 };
const icons = {
  wash: <svg {...I}><path d="M9 27v-9a7 7 0 0 1 14 0v9" /><circle cx="16" cy="9" r="4" /><path d="M23 6v3M26 8l-2 2M27 13h-3" /></svg>,
  wet: <svg {...I}><path d="M12 27V14a4 4 0 0 1 8 0v13z" /><path d="M24 6s3 3.4 3 5.5a3 3 0 0 1-6 0C21 9.4 24 6 24 6z" /><path d="M8 9l-2-2M7 14H4" /></svg>,
  apply: <svg {...I}><circle cx="13" cy="8" r="4" /><path d="M6 27v-6a7 7 0 0 1 7-7c2 0 3.6.8 4.8 2" /><path d="M17 12l6-6M21 18l5-5 2 2-5 5z" /></svg>,
  store: <svg {...I}><path d="M11 22V11a5 5 0 0 1 10 0v11" /><rect x="9.5" y="22" width="13" height="6" rx="1.5" /><path d="M5 9l1 1M27 9l-1 1M6 18h-2M28 18h-2" /></svg>,
};
// photo: a finished step image from the client (text already on it). Others use our model photos + overlay until the client sends theirs.
const steps = [
  { icon: 'wash', title: 'Clean & wash', text: 'Wash your underarms and pat them dry before you begin.', photo: '/assets/images/steps/step-1.webp' },
  { icon: 'wet', title: 'Wet the crystal', text: 'Remove the cap and dip the crystal top in water for a second.', img: '/assets/images/models/model-girls.webp', pos: '30% 40%' },
  { icon: 'apply', title: 'Apply gently', text: 'Glide it 3–4 times on clean, damp underarms. No white marks.', img: '/assets/images/models/model-girls.webp', pos: '80% 30%' },
  { icon: 'store', title: 'Wipe clean & store', text: 'Wipe the crystal dry, put the cap back and store it upright.', img: '/assets/images/models/model-couple.webp', pos: '55% 35%' },
];

export default function HowToUse() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-white pb-16 sm:pb-20">
      <div className="container-x flex flex-col items-center gap-3 py-12 text-center sm:py-14">
        <span className="eyebrow flex items-center gap-3 before:h-0.5 before:w-8 before:bg-brand after:h-0.5 after:w-8 after:bg-brand">4 simple steps</span>
        <h2 id="how-title" className="font-serif text-[48px] leading-none text-navy-900 sm:text-[68px]">How to <span className="text-brand">use</span></h2>
        <p className="max-w-[460px] text-[16px] text-muted sm:text-[17px]">Just like it says on the pack — fresh all day in under 10 seconds.</p>
      </div>
      <ol className="container-wide grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-5">
        {steps.map((s, k) => s.photo ? (
          <li key={s.title} className="overflow-hidden rounded-[28px] bg-[#EEF1F5] shadow-[0_20px_50px_-25px_rgba(15,26,60,.45)]">
            <img src={s.photo} alt={`Step ${k + 1} — ${s.title}`} loading="lazy" decoding="async" className="aspect-[1199/1312] w-full object-cover" />
          </li>
        ) : (
          <li key={s.title} className="group relative overflow-hidden rounded-[28px] bg-[#EEF1F5] shadow-[0_20px_50px_-25px_rgba(15,26,60,.45)]">
            <img src={s.img} alt="" loading="lazy" decoding="async" className="aspect-[1199/1312] w-full object-cover" style={{ objectPosition: s.pos }} />
            <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/20 to-transparent" />
            <div className="absolute left-[4%] top-[9%] flex w-[26%] flex-col items-center gap-2 text-center">
              <span className="whitespace-nowrap rounded-full bg-[#123A7A] px-3 py-1 font-head text-[16px] font-bold text-white sm:text-[20px] xl:text-[14px]">Step {k + 1}</span>
              <span className="flex aspect-square w-[78%] items-center justify-center rounded-full border-[2.5px] border-[#123A7A] bg-white text-[#123A7A] [&_svg]:h-1/2 [&_svg]:w-1/2">{icons[s.icon]}</span>
              <h3 className="font-head text-[15px] font-bold leading-tight text-[#123A7A] sm:text-[19px] xl:text-[13px]">{s.title}</h3>
              <span className="h-1 w-[80%] rounded-full bg-[#F07FA0]" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
