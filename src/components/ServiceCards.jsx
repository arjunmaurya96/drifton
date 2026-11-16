import { Truck, Cash, Lock, Return } from './Icons.jsx';

const services = [
  { title: 'Free delivery', sub: 'On every combo of 2', Icon: Truck },
  { title: 'Cash on delivery', sub: 'Pay when it arrives', Icon: Cash },
  { title: 'Secure payments', sub: 'Safe & secure checkout', Icon: Lock },
  { title: '48-hour returns', sub: 'On unopened products', Icon: Return },
];

export default function ServiceCards() {
  return (
    <section className="pt-10">
      <div className="container-x grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map(({ title, sub, Icon }) => (
          <div key={title} className="lift flex items-center gap-4 rounded-[20px] border border-line bg-white px-5 py-5">
            <span className="flex size-[50px] shrink-0 items-center justify-center rounded-2xl bg-blue-soft text-navy-700"><Icon /></span>
            <span>
              <b className="block font-head text-lg font-semibold">{title}</b>
              <small className="text-sm text-muted-2">{sub}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
