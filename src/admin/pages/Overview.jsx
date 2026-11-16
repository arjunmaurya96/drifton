import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../store.jsx';
import { AreaChart, Badge, Card, Icon, PageHeader, ago, inr } from '../ui.jsx';
import { TOPIC_LABEL } from '../data.js';

const DAY = 86400000;

export default function Overview() {
  const { data } = useAdmin();
  const [range, setRange] = useState(30);

  const s = useMemo(() => {
    const now = Date.now();
    const live = data.orders.filter((o) => o.status !== 'Cancelled');
    const inRange = (o, from, to) => { const t = new Date(o.date).getTime(); return t > now - from * DAY && t <= now - to * DAY; };
    const cur = live.filter((o) => inRange(o, range, 0));
    const prev = live.filter((o) => inRange(o, range * 2, range));
    const sum = (a) => a.reduce((x, o) => x + o.total, 0);
    const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null); // no previous data → no % shown
    // chart: revenue per day
    const days = Array.from({ length: range }, (_, i) => {
      const d = new Date(now - (range - 1 - i) * DAY);
      const key = d.toDateString();
      return { label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), v: cur.filter((o) => new Date(o.date).toDateString() === key).reduce((x, o) => x + o.total, 0) };
    });
    // best sellers
    const units = {};
    cur.forEach((o) => o.items.forEach((it) => { units[it.id] = (units[it.id] || 0) + it.qty; }));
    const custNew = data.customers.filter((c) => new Date(c.joined).getTime() > now - range * DAY).length;
    return {
      revenue: sum(cur), revPct: pct(sum(cur), sum(prev)),
      orders: cur.length, ordPct: pct(cur.length, prev.length),
      aov: cur.length ? sum(cur) / cur.length : 0,
      custNew, days, units,
      pending: data.orders.filter((o) => ['New', 'Packed'].includes(o.status)).length,
      statusCount: ['New', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => [st, data.orders.filter((o) => o.status === st).length]),
    };
  }, [data, range]);

  const maxUnits = Math.max(...Object.values(s.units), 1);
  const stats = [
    { label: 'Revenue', value: inr(s.revenue), pct: s.revPct, Ico: Icon.rupee, tint: '#E5F5EC', ink: '#17703D' },
    { label: 'Orders', value: s.orders, pct: s.ordPct, Ico: Icon.orders, tint: '#EAF0FF', ink: '#2647B8' },
    { label: 'Avg. order value', value: inr(s.aov), Ico: Icon.trend, tint: '#EFE9FF', ink: '#5B3FA8' },
    { label: 'New customers', value: s.custNew, Ico: Icon.users, tint: '#FFF1E2', ink: '#A3461A' },
  ];

  return (
    <>
      <PageHeader title="Good to see you 👋" sub="Here is how DriftOn is doing.">
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-[#E6E9F2]">
          {[7, 30].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold ${range === r ? 'bg-navy-900 text-white' : 'text-navy-500'}`}>Last {r} days</button>
          ))}
        </div>
      </PageHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, pct, Ico, tint, ink }) => (
          <Card key={label} className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-muted-2 sm:text-[13.5px]">{label}</span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10" style={{ background: tint, color: ink }}><Ico size={19} /></span>
            </div>
            <b className="mt-3 block font-head text-[22px] font-bold tracking-tight sm:text-[28px]">{value}</b>
            {pct != null && (
              <span className={`mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold ${pct >= 0 ? 'text-[#17703D]' : 'text-[#B42318]'}`}>
                {pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}% <span className="hidden font-normal text-muted-2 sm:inline">vs previous {range} days</span>
              </span>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <div><h2 className="font-head text-[17px] font-bold">Revenue</h2><p className="text-[13px] text-muted-2">Daily sales, last {range} days</p></div>
            <b className="font-head text-[20px]">{inr(s.revenue)}</b>
          </div>
          <AreaChart points={s.days} />
        </Card>

        <Card className="p-5">
          <h2 className="font-head text-[17px] font-bold">Best sellers</h2>
          <p className="mb-4 text-[13px] text-muted-2">Roll ons sold, last {range} days</p>
          <ul className="flex flex-col gap-4">
            {data.products.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: p.bg }}><img src={p.image} alt="" className="h-9 w-auto object-contain" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-[13.5px]"><b className="truncate font-semibold">{p.short}</b><span className="text-muted-2">{s.units[p.id] || 0} sold</span></div>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-[#F0F2F7]"><i className="block h-full rounded-full" style={{ width: `${((s.units[p.id] || 0) / maxUnits) * 100}%`, background: p.accent }} /></span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-head text-[17px] font-bold">Recent orders</h2>
            <Link to="/admin/orders" className="text-[13.5px] font-semibold text-brand hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2"><tr><th className="px-5 py-2.5 font-semibold">Order</th><th className="px-3 py-2.5 font-semibold">Customer</th><th className="px-3 py-2.5 font-semibold">Total</th><th className="px-3 py-2.5 font-semibold">Status</th><th className="px-5 py-2.5 text-right font-semibold">Time</th></tr></thead>
              <tbody>
                {data.orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-[#EEF0F5]">
                    <td className="px-5 py-3 font-semibold">#{o.id}</td>
                    <td className="px-3 py-3">{o.customer}<span className="block text-[12px] text-muted-2">{o.city}</span></td>
                    <td className="px-3 py-3 font-semibold">{inr(o.total)}</td>
                    <td className="px-3 py-3"><Badge>{o.status}</Badge></td>
                    <td className="px-5 py-3 text-right text-muted-2">{ago(o.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="font-head text-[17px] font-bold">Order status</h2>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full">
              {s.statusCount.map(([st, n], i) => <i key={st} style={{ width: `${(n / data.orders.length) * 100}%`, background: ['#3B5BDB', '#F59F00', '#7950F2', '#1F9254', '#E5484D'][i] }} />)}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 text-[13.5px]">
              {s.statusCount.map(([st, n], i) => (
                <li key={st} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: ['#3B5BDB', '#F59F00', '#7950F2', '#1F9254', '#E5484D'][i] }} />{st}<b className="ml-auto">{n}</b></li>
              ))}
            </ul>
            {s.pending > 0 && <Link to="/admin/orders" className="mt-4 flex items-center justify-between rounded-xl bg-[#FFF4E5] px-3.5 py-2.5 text-[13.5px] font-semibold text-[#9A5A00]">{s.pending} orders waiting to ship <span>→</span></Link>}
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between"><h2 className="font-head text-[17px] font-bold">New enquiries</h2><Link to="/admin/enquiries" className="text-[13.5px] font-semibold text-brand hover:underline">Open →</Link></div>
            <ul className="mt-3 flex flex-col divide-y divide-[#EEF0F5]">
              {data.enquiries.filter((e) => e.status === 'New').slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EAF0FF] text-[12px] font-bold text-[#2647B8]">{e.name.split(' ').map((x) => x[0]).join('')}</span>
                  <span className="min-w-0 flex-1"><b className="block truncate text-[13.5px]">{e.name}</b><span className="text-[12px] text-muted-2">{TOPIC_LABEL[e.topic]} · {ago(e.date)}</span></span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
