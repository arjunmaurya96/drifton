import { Link } from 'react-router-dom';
import { Arrow, Gem, Flask, Leaf, Flower } from './Icons.jsx';

const cards = [
  { title: 'Ancient alum. Modern you.', text: 'Made from mineral alum, trusted for generations and shaped into a roll on for easy daily use.', tint: '#E3ECFF', ink: '#1C2E6B', Icon: Gem },
  { title: 'Clean & simple.', text: 'A short, simple formula built around one hero mineral and botanical extracts.', tint: '#DCEBFB', ink: '#1C4E8A', Icon: Flask },
  { title: 'Kind to nature.', text: 'Plant-inspired blends with a mineral at the core, made with care.', tint: '#E1F3E7', ink: '#17703D', Icon: () => <Leaf size={42} sw={1.4} /> },
  { title: 'Gentle care. Daily comfort.', text: 'Glides on clear with no white marks, and feels light on skin all day.', tint: '#FFEBD9', ink: '#A3461A', Icon: Flower },
];

export default function WhyDrifton() {
  return (
    <section id="why" className="pb-24">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[.8fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <span className="eyebrow">Why Drifton</span>
          <h2 className="h2 lg:text-[56px]">Made to keep you <span className="text-brand">naturally fresh.</span></h2>
          <p className="text-lg leading-relaxed text-muted">Know what makes Drifton different, from the mineral at its heart to the way it feels on your skin.</p>
          <Link to="/#alum" className="btn-navy self-start">Why Drifton? <Arrow /></Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {cards.map(({ title, text, tint, ink, Icon }) => (
            <div key={title} className="lift flex flex-col gap-5 rounded-[28px] border border-line bg-white p-8">
              <span className="flex size-[92px] items-center justify-center rounded-full" style={{ background: tint, color: ink }}><Icon /></span>
              <h3 className="text-[23px] font-semibold">{title}</h3>
              <p className="text-[15.5px] leading-relaxed text-muted-2">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
