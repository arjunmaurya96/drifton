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
  { icon: 'wet', title: 'Wet the crystal', text: 'Remove the cap and dip the crystal top in water for a second.', photo: '/assets/images/steps/step-2.webp' },
  { icon: 'apply', title: 'Apply gently', text: 'Glide it 3–4 times on clean, damp underarms. No white marks.', photo: '/assets/images/steps/step-3.webp' },
  { icon: 'store', title: 'Wipe clean & store', text: 'Wipe the crystal dry, put the cap back and store it upright.', photo: '/assets/images/steps/step-4.webp' },
];

export default function HowToUse() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-white pb-16 sm:pb-20">
      <div className="container-x flex flex-col items-center gap-3 py-12 text-center sm:py-14">
        <span className="eyebrow flex items-center gap-3 before:h-0.5 before:w-8 before:bg-brand after:h-0.5 after:w-8 after:bg-brand">4 simple steps</span>
        <h2 id="how-title" className="font-serif text-[48px] leading-none text-navy-900 sm:text-[68px]">How to <span className="text-brand">use</span></h2>
        <p className="max-w-[460px] text-[16px] text-muted sm:text-[17px]">Just like it says on the pack — fresh all day in under 10 seconds.</p>
      </div>
      <ol className="container-wide grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-10">
        {steps.map((s, k) => (
          <li key={s.title} className="relative flex flex-col">
            {/* step marker + connector line (timeline) */}
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#123A7A] font-head text-[17px] font-bold text-white ring-4 ring-[#E3ECF8]">{k + 1}</span>
              <span className="text-[12px] font-bold uppercase tracking-[2px] text-[#123A7A]">Step {k + 1}</span>
              {k % 2 === 0 && <span aria-hidden="true" className="ml-1 hidden h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,#9DB6DA_0_8px,transparent_8px_14px)] sm:block" />}
            </div>

            {/* image — every card the same size */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#EEF1F5] shadow-[0_22px_50px_-26px_rgba(15,26,60,.5)] ring-1 ring-line">
              {s.photo ? (
                <img src={s.photo} alt={`Step ${k + 1} — ${s.title}`} loading="lazy" decoding="async" className="block aspect-[1199/1312] w-full object-cover" />
              ) : (
                <>
                  <img src={s.img} alt="" loading="lazy" decoding="async" className="block aspect-[1199/1312] w-full object-cover" style={{ objectPosition: s.pos }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/20 to-transparent" />
                  <div className="absolute left-[4%] top-[9%] flex w-[28%] flex-col items-center gap-2 text-center">
                    <span className="whitespace-nowrap rounded-full bg-[#123A7A] px-3 py-1 font-head text-[16px] font-bold text-white sm:text-[20px] lg:text-[26px]">Step {k + 1}</span>
                    <span className="flex aspect-square w-[80%] items-center justify-center rounded-full border-[2.5px] border-[#123A7A] bg-white text-[#123A7A] [&_svg]:h-1/2 [&_svg]:w-1/2">{icons[s.icon]}</span>
                  </div>
                </>
              )}
            </div>

            {/* caption — same for all four */}
            <div className="mt-4 flex flex-col gap-1 px-1">
              <h3 className="font-head text-[22px] font-bold leading-tight text-navy-900 sm:text-[26px]">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted sm:text-[16px]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
