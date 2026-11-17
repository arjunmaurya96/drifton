import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../store.jsx';
import { AreaChart, Badge, Card, Icon, LOW_STOCK, PageHeader, STATUS_COLOR, ago, inr } from '../ui.jsx';
import { TOPIC_LABEL } from '../data.js';
import { products as siteProducts } from '../../data/products.js';

const DAY = 86400000;
const slugOf = (id) => siteProducts.find((p) => p.id === id)?.slug || '';
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Last 7 days' },
  { id: 'month', label: 'Last 30 days' },
  { id: 'year', label: 'Last 12 months' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
];

// ---------- small pieces ----------
function TodayCard({ to, label, value, note, Ico, tint, ink, alert }) {
  return (
    <Link to={to} className={`group flex flex-col rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(15,26,60,.35)] sm:p-5 ${alert ? 'border-[#FFD8A8]' : 'border-[#E6E9F2]'}`}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-muted-2">{label}</span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: tint, color: ink }}><Ico size={20} /></span>
      </span>
      <b className="mt-2 block font-head text-[26px] font-bold leading-tight sm:text-[30px]" style={alert ? { color: ink } : undefined}>{value}</b>
      <span className="mt-0.5 flex items-center justify-between gap-2 text-[12.5px] text-muted-2">
        <span>{note}</span><span className="font-semibold text-navy-700 opacity-0 transition group-hover:opacity-100">Open →</span>
      </span>
    </Link>
  );
}

function TodoRow({ to, n, text, done, color }) {
  const ok = n === 0;
  return (
    <li>
      <Link to={to} className={`flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 transition ${ok ? 'opacity-60 hover:opacity-100' : 'hover:bg-[#F6F7FB]'}`}>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${ok ? 'bg-[#E5F5EC] text-[#17703D]' : 'text-white'}`} style={ok ? undefined : { background: color }}>
          {ok ? <Icon.check size={18} /> : n}
        </span>
        <span className="min-w-0 flex-1 text-[14.5px]">{ok ? <span className="text-muted">{done}</span> : <b className="font-semibold">{text}</b>}</span>
        {!ok && <span className="text-navy-700"><Icon.arrow size={18} /></span>}
      </Link>
    </li>
  );
}

export default function Overview() {
  const { data, update, notify } = useAdmin();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchVal, setSearchVal] = useState('');

  // ---------- today ----------
  const today = useMemo(() => {
    const t0 = startOfDay().getTime(), y0 = t0 - DAY;
    const live = data.orders.filter((o) => o.status !== 'Cancelled');
    const todays = live.filter((o) => new Date(o.date).getTime() >= t0);
    const yest = live.filter((o) => { const t = new Date(o.date).getTime(); return t >= y0 && t < t0; });
    return {
      orders: todays.length,
      sales: todays.reduce((a, o) => a + (o.total || 0), 0),
      yOrders: yest.length,
      yDiff: todays.length - yest.length,
      toPack: data.orders.filter((o) => o.status === 'New'),
      toShip: data.orders.filter((o) => o.status === 'Packed').length,
      enquiries: data.enquiries.filter((e) => e.status === 'New').length,
      reviews: data.reviews.filter((r) => r.status === 'Pending').length,
      lowStock: data.products.filter((p) => p.active && p.stock <= LOW_STOCK),
    };
  }, [data]);
  const todoTotal = today.toPack.length + today.toShip + today.enquiries + today.reviews + today.lowStock.length;

  // ---------- sales report (selected period) ----------
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    const from = { today: startOfDay().getTime(), week: now - 7 * DAY, month: now - 30 * DAY, year: now - 365 * DAY }[period];
    return data.orders.filter((o) => {
      const t = new Date(o.date).getTime();
      if (Number.isNaN(t)) return false;
      if (period === 'custom') {
        const start = customStart ? new Date(`${customStart}T00:00:00`).getTime() : 0;
        const end = customEnd ? new Date(`${customEnd}T23:59:59`).getTime() : now;
        return t >= start && t <= end;
      }
      return from == null || t >= from;
    });
  }, [data.orders, period, customStart, customEnd]);

  const s = useMemo(() => {
    const live = filteredOrders.filter((o) => o.status !== 'Cancelled');
    const revenue = live.reduce((a, o) => a + (o.total || 0), 0);
    const units = {};
    live.forEach((o) => (o.items || []).forEach((it) => { units[it.id] = (units[it.id] || 0) + (it.qty || 1); }));
    const statusCount = Object.keys(STATUS_COLOR).map((st) => [st, filteredOrders.filter((o) => o.status === st).length]);

    // chart: by day (or by month for 12 months)
    const byMonth = period === 'year';
    const n = period === 'today' ? 1 : period === 'week' ? 7 : byMonth ? 12 : 30;
    const now = new Date();
    const points = Array.from({ length: Math.max(n, 2) }, (_, i) => {
      const back = Math.max(n, 2) - 1 - i;
      const d = byMonth ? new Date(now.getFullYear(), now.getMonth() - back, 1) : new Date(now.getTime() - back * DAY);
      const same = (od) => (byMonth ? od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() : od.toDateString() === d.toDateString());
      return {
        label: byMonth ? d.toLocaleDateString('en-IN', { month: 'short' }) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        v: live.filter((o) => same(new Date(o.date))).reduce((a, o) => a + (o.total || 0), 0),
      };
    });
    return { revenue, orders: live.length, aov: live.length ? revenue / live.length : 0, units, statusCount, points };
  }, [filteredOrders, period]);
  const maxUnits = Math.max(...Object.values(s.units), 1);
  const periodLabel = PERIODS.find((p) => p.id === period)?.label;

  // ---------- Excel / CSV export ----------
  const exportCsv = () => {
    if (!filteredOrders.length) return notify('No orders to export for this period.');
    const headers = ['Order ID', 'Date & Time', 'Customer Name', 'Mobile Phone', 'Email Address', 'Delivery Address', 'Pincode', 'Items Ordered', 'Total Sticks', 'Subtotal (INR)', 'Delivery (INR)', 'Coupon Code', 'Discount (INR)', 'COD Fee (INR)', 'Total Amount (INR)', 'Payment Method', 'Payment Status', 'Order Status', 'Tracking Number'];
    const rows = filteredOrders.map((o) => [
      o.id || '', o.date ? new Date(o.date).toLocaleString('en-IN') : '', o.customer || '', o.phone || '', o.email || '',
      (o.address || '').replace(/[\r\n]+/g, ' '), o.pin || '', (o.items || []).map((i) => `${i.name} (Qty: ${i.qty})`).join('; '),
      o.sticks || 0, o.subtotal || o.total || 0, o.delivery || 0, o.coupon || 'None', o.couponOff || 0, o.codFee || 0, o.total || 0,
      o.payment || '', o.paymentStatus || '', o.status || '', o.tracking || '',
    ]);
    const csv = '﻿' + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = `drifton-sales-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    notify(`Exported ${filteredOrders.length} orders`);
  };

  const search = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/admin/customers?q=${encodeURIComponent(searchVal.trim())}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader title={`${greeting()} 👋`} sub={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} — here is your store today.`} />

      {/* ================= 1. TODAY ================= */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <TodayCard to="/admin/orders" label="Today's orders" value={today.orders} Ico={Icon.orders} tint="#EAF0FF" ink="#2647B8"
          note={today.yDiff === 0 ? `Same as yesterday (${today.yOrders})` : `${today.yDiff > 0 ? '▲' : '▼'} ${Math.abs(today.yDiff)} vs yesterday`} />
        <TodayCard to="/admin/orders" label="Today's sales" value={inr(today.sales)} Ico={Icon.rupee} tint="#E5F5EC" ink="#17703D" note="Money from today's orders" />
        <TodayCard to="/admin/orders?tab=New" label="To pack" value={today.toPack.length} Ico={Icon.box} tint="#FFF1E2" ink="#C2410C" alert={today.toPack.length > 0}
          note={today.toPack.length ? 'New orders waiting' : 'Nothing to pack'} />
        <TodayCard to="/admin/enquiries" label="New enquiries" value={today.enquiries} Ico={Icon.inbox} tint="#F3EEFF" ink="#5B3FA8" alert={today.enquiries > 0}
          note={today.enquiries ? 'Waiting for a reply' : 'All replied'} />
      </div>

      {/* ================= 2. TO-DO + NEW ORDERS ================= */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card className="p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between px-1">
            <div><h2 className="font-head text-[17px] font-bold">Things to do</h2><p className="text-[12.5px] text-muted-2">Click a line to open it.</p></div>
            {todoTotal === 0 && <Badge tone="Delivered">All done</Badge>}
          </div>
          <ul className="flex flex-col">
            <TodoRow to="/admin/orders?tab=New" n={today.toPack.length} color={STATUS_COLOR.New} text={`Pack ${today.toPack.length} new order${today.toPack.length > 1 ? 's' : ''}`} done="No new orders to pack" />
            <TodoRow to="/admin/orders?tab=Packed" n={today.toShip} color={STATUS_COLOR.Packed} text={`Ship ${today.toShip} packed order${today.toShip > 1 ? 's' : ''} (add Ekart tracking)`} done="Nothing waiting to ship" />
            <TodoRow to="/admin/enquiries" n={today.enquiries} color="#7950F2" text={`Reply to ${today.enquiries} enquir${today.enquiries > 1 ? 'ies' : 'y'}`} done="All enquiries replied" />
            <TodoRow to="/admin/reviews" n={today.reviews} color="#0B7285" text={`Check ${today.reviews} new review${today.reviews > 1 ? 's' : ''}`} done="No reviews to check" />
            <TodoRow to="/admin/products" n={today.lowStock.length} color="#E5484D" text={`Refill stock: ${today.lowStock.map((p) => `${p.short || p.name} (${p.stock})`).join(', ')}`} done="Stock is fine" />
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F5] px-4 py-3.5 sm:px-5">
            <div><h2 className="font-head text-[17px] font-bold">New orders to pack</h2><p className="text-[12.5px] text-muted-2">Oldest first — pack these before the others.</p></div>
            {today.toPack.length > 0 && <Link to="/admin/orders?tab=New" className="shrink-0 text-[13px] font-semibold text-navy-700 hover:underline">See all {today.toPack.length} →</Link>}
          </div>
          {today.toPack.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#E5F5EC] text-[#17703D]"><Icon.check size={24} /></span>
              <b className="text-[15px]">All caught up</b><p className="text-[13px] text-muted-2">New orders from the website will appear here.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-[#EEF0F5]">
              {[...today.toPack].reverse().slice(0, 5).map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="min-w-0 basis-full sm:basis-auto sm:flex-1">
                    <span className="flex items-center gap-2"><b className="text-[14.5px]">#{o.id}</b><span className="text-[12px] text-muted-2">{ago(o.date)}</span></span>
                    <span className="block truncate text-[13px] text-muted">{o.customer} · {(o.items || []).map((it) => `${it.name.replace(' Alum Roll On', '')} ×${it.qty}`).join(', ')}</span>
                  </span>
                  <b className="text-[14.5px] max-sm:mr-auto">{inr(o.total)}</b>
                  <button onClick={() => update('orders', o.id, { status: 'Packed' }, `#${o.id} marked Packed`)}
                    className="min-h-10 rounded-xl bg-navy-900 px-3.5 text-[13px] font-semibold text-white hover:bg-navy-700">Mark Packed</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ================= 3. SALES REPORT ================= */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 border-t border-[#E6E9F2] pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 className="font-head text-[20px] font-bold">Sales report</h2><p className="text-[13px] text-muted-2">Choose a period to see sales, best sellers and order status.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="-mx-1 flex gap-1 overflow-x-auto rounded-xl bg-[#EEF0F5] p-1 [scrollbar-width:none]">
              {PERIODS.map((p) => (
                <button key={p.id} type="button" onClick={() => setPeriod(p.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${period === p.id ? 'bg-white text-navy-900 shadow-sm' : 'text-muted hover:text-navy-900'}`}>{p.label}</button>
              ))}
            </div>
            <button type="button" onClick={exportCsv} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E0E4EE] bg-white px-3.5 text-[13px] font-semibold hover:border-navy-700">
              <Icon.download size={16} /> Download Excel
            </button>
          </div>
        </div>

        {period === 'custom' && (
          <Card className="flex flex-wrap items-center gap-4 p-3.5">
            <label className="flex items-center gap-2 text-[13px] font-semibold">From
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded-lg border border-[#E0E4EE] px-2.5 py-1.5 text-[13px] outline-none focus:border-navy-700" /></label>
            <label className="flex items-center gap-2 text-[13px] font-semibold">To
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded-lg border border-[#E0E4EE] px-2.5 py-1.5 text-[13px] outline-none focus:border-navy-700" /></label>
            <span className="ml-auto text-[13px] text-muted-2"><b>{filteredOrders.length}</b> orders in this period</span>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[['Sales', inr(s.revenue), 'Total money (cancelled not counted)', '#17703D'], ['Orders', s.orders, 'Orders placed', '#0F1A3C'], ['Average order', inr(s.aov), 'Money per order', '#0F1A3C']].map(([l, v, n, c]) => (
            <Card key={l} className="p-4 sm:p-5">
              <span className="text-[12.5px] font-semibold text-muted-2">{l}<span className="hidden sm:inline"> · {periodLabel}</span></span>
              <b className="mt-1 block font-head text-[20px] font-bold sm:text-[26px]" style={{ color: c }}>{v}</b>
              <span className="hidden text-[12px] text-muted-2 sm:block">{n}</span>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div><h3 className="font-head text-[16px] font-bold">Sales graph</h3><p className="text-[12.5px] text-muted-2">How much you sold {period === 'year' ? 'each month' : 'each day'}</p></div>
              <b className="text-[17px] text-[#17703D]">{inr(s.revenue)}</b>
            </div>
            <AreaChart points={s.points} />
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="font-head text-[16px] font-bold">Best sellers</h3>
            <p className="mb-3 text-[12.5px] text-muted-2">Roll ons sold · click to open on the website</p>
            <ul className="flex flex-col gap-2.5">
              {[...data.products].sort((a, b) => (s.units[b.id] || 0) - (s.units[a.id] || 0)).map((p, i) => (
                <li key={p.id}>
                  <a href={`/product/${slugOf(p.id)}`} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-[#EEF0F5] p-2.5 transition hover:border-[#C9D1EA] hover:bg-[#FAFBFD]">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg p-1" style={{ background: p.bg }}><img src={p.image} alt="" className="h-full w-auto object-contain" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2 text-[13.5px]">
                        <span className="truncate font-semibold">{i === 0 && (s.units[p.id] || 0) > 0 ? '🏆 ' : ''}{p.name}</span>
                        <b className="shrink-0">{s.units[p.id] || 0} sold</b>
                      </span>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#EEF0F5]">
                        <i className="block h-full rounded-full transition-all duration-500" style={{ width: `${((s.units[p.id] || 0) / maxUnits) * 100}%`, background: p.accent }} />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-4 sm:p-5">
            <h3 className="font-head text-[16px] font-bold">Order status</h3>
            <p className="mb-3 text-[12.5px] text-muted-2">Where the orders of this period are now</p>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-[#EEF0F5]">
              {s.statusCount.map(([st, n]) => <i key={st} style={{ width: `${filteredOrders.length ? (n / filteredOrders.length) * 100 : 0}%`, background: STATUS_COLOR[st] }} />)}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[13px]">
              {s.statusCount.map(([st, n]) => (
                <li key={st}>
                  <Link to={`/admin/orders?tab=${st}`} className="flex items-center gap-2 rounded-lg bg-[#F6F7FB] px-2.5 py-2 hover:bg-[#EEF0F5]">
                    <span className="size-2 rounded-full" style={{ background: STATUS_COLOR[st] }} />{st}<b className="ml-auto">{n}</b>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-head text-[16px] font-bold">Latest enquiries</h3>
              <Link to="/admin/enquiries" className="text-[13px] font-semibold text-navy-700 hover:underline">View all →</Link>
            </div>
            {data.enquiries.filter((e) => e.status === 'New').length === 0 ? (
              <p className="py-8 text-center text-[13px] text-muted-2">No new enquiries.</p>
            ) : (
              <ul className="mt-2 flex flex-col divide-y divide-[#EEF0F5]">
                {data.enquiries.filter((e) => e.status === 'New').slice(0, 4).map((e) => (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F3EEFF] text-[12px] font-bold text-[#5B3FA8]">{(e.name || '?').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}</span>
                    <span className="min-w-0 flex-1"><b className="block truncate text-[13.5px]">{e.name}</b><span className="text-[12px] text-muted-2">{TOPIC_LABEL[e.topic] || e.topic} · {ago(e.date)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="rounded-2xl bg-[#0F1A3C] p-4 text-white sm:p-5">
            <h3 className="font-head text-[16px] font-bold">Find a customer</h3>
            <p className="mb-3 text-[12.5px] text-[#C9D1EA]">Type a name, mobile number, email or order ID.</p>
            <form onSubmit={search} className="flex gap-2">
              <input value={searchVal} onChange={(e) => setSearchVal(e.target.value)} placeholder="e.g. 9876543210 or Rahul"
                className="min-h-11 w-full min-w-0 rounded-xl border border-white/15 bg-white/10 px-3.5 text-[14px] text-white outline-none placeholder:text-[#8A93AB] focus:border-white/50" />
              <button className="shrink-0 rounded-xl bg-white px-4 text-[13.5px] font-bold text-navy-900 hover:bg-[#E8ECF5]">Search</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
