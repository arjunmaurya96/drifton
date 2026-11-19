import { useEffect, useRef, useState } from 'react';
import { Users, Box, Clock, Award } from './Icons.jsx';

// Confirm these numbers with the client before going live.
const stats = [
  { value: 2700, suffix: '+', label: 'Happy customers', sub: 'Thank you for trusting Drifton', tint: '#EAF0FF', ink: '#1C2E6B', Icon: Users },
  { value: 3200, suffix: '+', label: 'Orders delivered', sub: 'Bringing care to your doorstep', tint: '#E5F5EC', ink: '#17703D', Icon: Box },
  { value: 98, suffix: '%', label: 'On-time delivery', sub: 'Committed to timely service', tint: '#FFF1E2', ink: '#A3461A', Icon: Clock },
  { value: 100, suffix: '%', label: 'Quality focus', sub: 'Quality is always our priority', tint: '#F0EBFB', ink: '#5B3FA8', Icon: Award },
];

function useCountUp(duration = 1800) {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const x = Math.min(1, (t - t0) / duration);
        setP(1 - Math.pow(1 - x, 3));
        if (x < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [duration]);
  return [ref, p];
}

export default function Stats() {
  const [ref, p] = useCountUp();
  return (
    <section ref={ref} className="pb-4 pt-3 sm:pt-4">
      <div className="container-x">
        <div className="mb-6 flex flex-col items-center gap-2 text-center sm:mb-7">
          <h2 className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 font-head text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[38px] xl:text-[44px]">
            <img
              src="/assets/images/logo-drifton.webp"
              alt="DriftOn"
              className="h-8 sm:h-10 w-auto object-contain"
            />
            <span className="text-brand">Promise:</span>
            <span>
              Why Customers{' '}
              <span className="relative inline-block bg-gradient-to-r from-brand via-brand-dark to-navy-900 bg-clip-text text-transparent">
                Choose Us.
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[3.5px] w-full rounded-full bg-gradient-to-r from-brand via-mint to-transparent"
                />
              </span>
            </span>
          </h2>
          <p className="mt-1 max-w-4xl text-center text-sm font-medium text-muted sm:text-[15.5px] sm:whitespace-nowrap">
            Quality products, reliable service and a shopping experience you can trust.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, suffix, label, sub, tint, ink, Icon }) => (
            <div key={label} className="lift flex flex-col gap-4 rounded-3xl border border-line bg-white p-7">
              <span className="flex size-[50px] items-center justify-center rounded-2xl" style={{ background: tint, color: ink }}><Icon /></span>
              <span className="flex items-baseline gap-1">
                <b className="font-head text-[46px] font-bold leading-none tracking-tight text-navy-700">{Math.round(value * p).toLocaleString('en-IN')}</b>
                <span className="font-head text-[26px] font-bold text-brand">{suffix}</span>
              </span>
              <span>
                <h3 className="mb-1 text-lg font-semibold">{label}</h3>
                <small className="text-[14.5px] text-muted-2">{sub}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
