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
    <section id="how" aria-labelledby="how-title" className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F7FC_100%)] pb-16 sm:pb-20">
      <div className="container-x flex flex-col items-center gap-3 py-12 text-center sm:py-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-navy-900 shadow-sm">
          <span className="size-2 rounded-full bg-brand" /> 4 simple steps
        </span>
        <h2 id="how-title" className="font-serif text-[44px] leading-none text-navy-900 sm:text-[60px]">How to <span className="text-brand">use</span></h2>
        <p className="max-w-[460px] text-[15px] text-muted sm:text-[16px]">Just like it says on the pack — fresh all day in under 10 seconds.</p>
      </div>

      {/* mobile: swipe cards · tablet: 2 per row · desktop: all 4 in one row */}
      <ol className="-mb-2 flex w-full px-3 sm:px-4 snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {steps.map((s, k) => (
          <li key={s.title} className="relative flex w-[72%] shrink-0 snap-center flex-col sm:w-auto">
            {/* dotted connector to the next step (desktop) */}
            {k < steps.length - 1 && (
              <span aria-hidden="true" className="absolute -right-5 top-[38%] z-10 hidden size-10 items-center justify-center rounded-full bg-white text-navy-900 shadow-md lg:flex">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            )}

            <div className="group flex h-full flex-col">
              <div className="relative overflow-hidden rounded-[22px] bg-[#EEF1F5] shadow-[0_18px_40px_-26px_rgba(15,26,60,.55)] transition duration-300 group-hover:-translate-y-1">
                {s.photo ? (
                  <img src={s.photo} alt={`Step ${k + 1} — ${s.title}`} loading="lazy" decoding="async" className="block aspect-[1199/1312] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <>
                    <img src={s.img} alt="" loading="lazy" decoding="async" className="block aspect-[1199/1312] w-full object-cover" style={{ objectPosition: s.pos }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/20 to-transparent" />
                    <div className="absolute left-[4%] top-[9%] flex w-[28%] flex-col items-center gap-2 text-center">
                      <span className="whitespace-nowrap rounded-full bg-[#123A7A] px-3 py-1 font-head text-[14px] font-bold text-white">Step {k + 1}</span>
                      <span className="flex aspect-square w-[80%] items-center justify-center rounded-full border-2 border-[#123A7A] bg-white text-[#123A7A] [&_svg]:h-1/2 [&_svg]:w-1/2">{icons[s.icon]}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-1 items-start gap-3 px-1 pt-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#123A7A] [&_svg]:size-5">{icons[s.icon]}</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-[1.5px] text-brand">Step {k + 1}</span>
                  <h3 className="font-head text-[17px] font-bold leading-tight text-navy-900">{s.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{s.text}</p>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* swipe hint dots (mobile) */}
      <div aria-hidden="true" className="mt-3 flex justify-center gap-1.5 sm:hidden">
        {steps.map((s) => <span key={s.title} className="h-1.5 w-5 rounded-full bg-navy-900/15" />)}
      </div>
    </section>
  );
}
