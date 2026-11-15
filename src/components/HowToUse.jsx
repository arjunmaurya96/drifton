import { ShowerScene, RinseScene, ApplyScene } from './StepIllustrations.jsx';

// To use real lifestyle photos instead of the illustrations, put them in
// public/assets/images/steps/ and set e.g. photo: '/assets/images/steps/step-1.jpg'
const steps = [
  { no: '01', title: 'Nahaya', sub: 'Start with a fresh shower.', detail: 'Use it on clean skin, ideally right after bathing.', Scene: ShowerScene, photo: null },
  { no: '02', title: 'Dhoya', sub: 'Dip the crystal in water.', detail: 'Wet the tip for a second so it glides smoothly.', Scene: RinseScene, photo: null },
  { no: '03', title: 'Drifton lagaya?', sub: 'Glide it on the underarm.', detail: 'Swipe gently a few times, let it dry, and you are set for the day.', Scene: ApplyScene, photo: null },
];

export default function HowToUse() {
  return (
    <section id="how" className="bg-white py-24">
      <div className="container-x">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="eyebrow">How to use</span>
          <h2 className="h2">3 steps. <span className="text-brand">10 seconds.</span></h2>
          <p className="max-w-[520px] text-[17px] text-muted">No sprays, no mess. Here is how to use your Drifton crystal every day.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ no, title, sub, detail, Scene, photo }) => (
            <article key={no} className="lift group relative overflow-hidden rounded-[30px] border border-line bg-page">
              <div className="relative aspect-[10/11] overflow-hidden">
                {photo ? (
                  <img src={photo} alt={sub} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <Scene />
                )}
                <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-[13px] font-bold tracking-wide text-navy-900 shadow">Step {no}</span>
              </div>
              <div className="flex flex-col gap-2 p-7">
                <h3 className="text-4xl font-semibold text-brand">{title}</h3>
                <p className="font-head text-xl font-semibold text-navy-900">{sub}</p>
                <p className="text-[15.5px] leading-relaxed text-muted-2">{detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
