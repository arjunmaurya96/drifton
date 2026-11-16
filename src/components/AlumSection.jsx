import { Link } from 'react-router-dom';
import { Arrow, Leaf } from './Icons.jsx';

const points = [
  { n: '01', title: 'Nature-inspired mineral', text: 'A naturally occurring mineral with a rich history.' },
  { n: '02', title: 'Versatile everyday uses', text: 'Used in traditional personal care and other applications.' },
  { n: '03', title: 'Simple & timeless', text: 'A mineral that continues to be valued across generations.' },
];

export default function AlumSection() {
  return (
    <section id="alum" className="py-24">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-10 rounded-[36px] border border-line bg-white p-5 md:p-7 lg:grid-cols-[.95fr_1.05fr] lg:gap-16 lg:pr-14">
          <div className="relative h-[420px] overflow-hidden rounded-[28px] bg-[#E9ECF1] md:h-[560px]">
            <img src="/assets/images/cutouts/charcoal.png" alt="Drifton natural crystal alum stick" loading="lazy" className="mx-auto h-[82%] w-auto object-contain pt-10" />
            <span className="absolute left-5 top-5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-navy-700">Timeless mineral</span>
            <span className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3 rounded-[20px] bg-navy-900/90 px-5 py-4 text-white">
              <span>
                <small className="block text-xs font-bold uppercase tracking-widest text-mint">Drifton collection</small>
                <b className="font-head text-[19px] font-semibold">Inspired by nature</b>
              </span>
              <span className="text-mint"><Leaf size={34} sw={1.6} /></span>
            </span>
          </div>
          <div className="flex flex-col gap-6 py-5">
            <span className="self-start rounded-full bg-blue-soft px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-wider text-navy-700">Discover the goodness of alum</span>
            <h2 className="h2">The importance of <span className="text-brand">alum in everyday life</span></h2>
            <p className="text-[17px] leading-relaxed text-muted">Alum has been valued for generations for its versatile everyday uses. Discover a simple mineral with a long history of practical applications.</p>
            <div className="flex flex-col gap-3.5">
              {points.map((p) => (
                <div key={p.n} className="flex items-start gap-4 rounded-[18px] bg-page px-5 py-4">
                  <span className="flex size-[46px] shrink-0 items-center justify-center rounded-2xl bg-navy-700 font-head font-bold text-mint">{p.n}</span>
                  <span>
                    <b className="mb-1 block font-head text-lg font-semibold">{p.title}</b>
                    <span className="text-[15px] text-muted-2">{p.text}</span>
                  </span>
                </div>
              ))}
            </div>
            <Link to="/#tested" className="btn-navy self-start">Discover more <Arrow /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
