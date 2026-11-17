import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAdmin } from '../store.jsx';
import { ORDER_STATUSES } from '../data.js';
import { Badge, Btn, Card, Check, Drawer, Empty, Field, Help, Icon, PageHeader, STATUS_COLOR, Toolbar, fmtDateTime, inputCls, inr } from '../ui.jsx';
import { printInvoices } from '../invoice.js';

const csv = (rows) => {
  const head = ['Order', 'Date', 'Customer', 'Phone', 'City', 'Items', 'Total', 'Payment', 'Status', 'Tracking'];
  const body = rows.map((o) => [o.id, new Date(o.date).toLocaleString('en-IN'), o.customer, o.phone, o.city, o.items.map((i) => `${i.name} x${i.qty}`).join(' + '), o.total, o.payment, o.status, o.tracking]);
  return [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
};

export default function Orders() {
  const { data, update, notify } = useAdmin();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [tab, setTab] = useState(params.get('tab') || 'all');
  const [sel, setSel] = useState(() => new Set());
  // links from the dashboard (?tab=New) also work when you are already on this page
  useEffect(() => { if (params.get('tab')) setTab(params.get('tab')); if (params.get('q') != null) setQ(params.get('q')); }, [params]);
  useEffect(() => setSel(new Set()), [tab, q]);
  const [openId, setOpenId] = useState(null);
  const [tracking, setTracking] = useState('');

  const list = useMemo(() => data.orders.filter((o) =>
    (tab === 'all' || o.status === tab) &&
    (!q || `${o.id} ${o.customer} ${o.phone} ${o.city}`.toLowerCase().includes(q.toLowerCase()))), [data.orders, q, tab]);
  const order = data.orders.find((o) => o.id === openId);
  const chips = [['all', 'All', data.orders.length], ...ORDER_STATUSES.map((s) => [s, s, data.orders.filter((o) => o.status === s).length, STATUS_COLOR[s]])];

  // bulk selection
  const toggle = (id, on) => setSel((cur) => { const n = new Set(cur); if (on) n.add(id); else n.delete(id); return n; });
  const allOn = list.length > 0 && list.every((o) => sel.has(o.id));
  const someOn = list.some((o) => sel.has(o.id));
  const picked = data.orders.filter((o) => sel.has(o.id));
  const bulk = (status) => {
    picked.forEach((o) => update('orders', o.id, { status }));
    notify(`${picked.length} order${picked.length > 1 ? 's' : ''} marked ${status}`);
    setSel(new Set());
  };
  const print = (orders) => { if (!printInvoices(orders, data.settings)) notify('Please allow pop-ups to print'); };

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([csv(list)], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'drifton-orders.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const open = (o) => { setOpenId(o.id); setTracking(o.tracking || ''); };
  const next = { New: 'Packed', Packed: 'Shipped', Shipped: 'Delivered' };

  return (
    <>
      <PageHeader title="Orders" sub="Every order from the website. Pack it, ship it, and mark it delivered.">
        <Btn variant="ghost" onClick={exportCsv}><Icon.download size={18} /> Export CSV</Btn>
      </PageHeader>

      <Help>
        Order steps: <b style={{ color: STATUS_COLOR.New }}>New</b> → <b style={{ color: STATUS_COLOR.Packed }}>Packed</b> → <b style={{ color: STATUS_COLOR.Shipped }}>Shipped</b> → <b style={{ color: STATUS_COLOR.Delivered }}>Delivered</b>.
        Tick the boxes to update many orders at once or print their invoices. Click an order to see full details.
      </Help>

      <Card className="overflow-hidden">
        <Toolbar q={q} setQ={setQ} placeholder="Search order ID, name, phone, city…" chips={chips} active={tab} setActive={setTab} />

        {/* bulk action bar */}
        {sel.size > 0 && (
          <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 border-b border-[#E6E9F2] bg-[#0F1A3C] px-4 py-2.5 text-white">
            <b className="mr-1 text-[14px]">{sel.size} selected</b>
            <button onClick={() => bulk('Packed')} className="rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold hover:bg-white/20">Mark Packed</button>
            <button onClick={() => bulk('Shipped')} className="rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold hover:bg-white/20">Mark Shipped</button>
            <button onClick={() => bulk('Delivered')} className="rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold hover:bg-white/20">Mark Delivered</button>
            <button onClick={() => print(picked)} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold text-navy-900 hover:bg-[#E8ECF5]"><Icon.print size={15} /> Print invoices</button>
            <button onClick={() => setSel(new Set())} className="ml-auto rounded-lg px-2 py-1.5 text-[13px] text-[#C9D1EA] hover:text-white">Clear</button>
          </div>
        )}

        {list.length === 0 ? (
          <Empty icon={Icon.orders} text={q ? 'No orders match your search.' : tab === 'all' ? 'No orders yet' : `No ${tab} orders`}
            sub={q ? 'Try a different name, phone number or order ID.' : 'New orders from the website will show up here automatically.'} />
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2">
                  <tr><th className="w-10 py-3 pl-5"><Check checked={allOn} indeterminate={!allOn && someOn} onChange={(v) => setSel(v ? new Set(list.map((o) => o.id)) : new Set())} label="Select all" /></th><th className="px-3 py-3 font-semibold">Order</th><th className="px-3 py-3 font-semibold">Customer</th><th className="px-3 py-3 font-semibold">Items</th><th className="px-3 py-3 font-semibold">Total</th><th className="px-3 py-3 font-semibold">Payment</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-5 py-3" /></tr>
                </thead>
                <tbody>
                  {list.map((o) => (
                    <tr key={o.id} onClick={() => open(o)} className={`cursor-pointer border-t border-[#EEF0F5] transition hover:bg-[#FAFBFD] ${sel.has(o.id) ? 'bg-[#F1F5FF]' : ''}`}>
                      <td className="py-3.5 pl-5"><Check checked={sel.has(o.id)} onChange={(v) => toggle(o.id, v)} label={`Select ${o.id}`} /></td>
                      <td className="px-3 py-3.5"><b>#{o.id}</b><span className="block text-[12px] text-muted-2">{fmtDateTime(o.date)}</span></td>
                      <td className="px-3 py-3.5"><b className="block font-semibold text-navy-900">{o.customer}</b><span className="block text-[12px] text-muted-2">{o.phone} {o.city ? `· ${o.city}` : ''}</span></td>
                      <td className="px-3 py-3.5 text-muted">{o.sticks} roll on{o.sticks > 1 ? 's' : ''}</td>
                      <td className="px-3 py-3.5 font-semibold">{inr(o.total)}</td>
                      <td className="px-3 py-3.5 text-muted">{o.payment}</td>
                      <td className="px-3 py-3.5"><Badge>{o.status}</Badge></td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-navy-700">View →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* mobile cards */}
            <ul className="flex flex-col gap-2.5 bg-[#F6F7FB] p-3 md:hidden">
              {list.map((o) => (
                <li key={o.id} className={`rounded-2xl border bg-white ${sel.has(o.id) ? 'border-navy-700' : 'border-[#E6E9F2]'}`} style={{ borderLeft: `4px solid ${STATUS_COLOR[o.status]}` }}>
                  <div className="flex items-start gap-3 p-3.5">
                    <span className="pt-0.5"><Check checked={sel.has(o.id)} onChange={(v) => toggle(o.id, v)} label={`Select ${o.id}`} /></span>
                    <button onClick={() => open(o)} className="min-w-0 flex-1 text-left">
                      <span className="flex items-center justify-between gap-2"><b className="text-[14.5px]">#{o.id}</b><Badge>{o.status}</Badge></span>
                      <b className="mt-1 block text-[15px]">{o.customer}</b>
                      <span className="block text-[13px] text-muted-2">{o.phone}{o.city ? ` · ${o.city}` : ''}</span>
                      <span className="mt-1.5 flex items-center justify-between text-[13px]"><span className="text-muted">{o.sticks} roll on{o.sticks > 1 ? 's' : ''} · {o.payment}</span><b className="text-[15px]">{inr(o.total)}</b></span>
                    </button>
                  </div>
                  {next[o.status] && (
                    <button onClick={() => update('orders', o.id, { status: next[o.status] }, `Order marked ${next[o.status]}`)}
                      className="flex min-h-11 w-full items-center justify-center gap-1.5 border-t border-[#EEF0F5] text-[14px] font-semibold text-navy-900 active:bg-[#F3F5FA]">
                      Mark as {next[o.status]} <Icon.arrow size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Drawer open={!!order} onClose={() => setOpenId(null)} title={order ? `Order #${order.id}` : ''} sub={order && fmtDateTime(order.date)}
        footer={order && (
          <>
            {next[order.status] && <Btn variant="green" onClick={() => update('orders', order.id, { status: next[order.status], tracking: next[order.status] === 'Shipped' && !tracking ? `EK${Date.now().toString().slice(-10)}` : tracking }, `Order marked ${next[order.status]}`)}>Mark as {next[order.status]}</Btn>}
            <Btn variant="ghost" onClick={() => print(order)}><Icon.print size={18} /> Print invoice</Btn>
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && <Btn variant="danger" onClick={() => update('orders', order.id, { status: 'Cancelled' }, 'Order cancelled')}>Cancel</Btn>}
          </>
        )}>
        {order && (
          <div className="flex flex-col gap-5">
            {/* progress */}
            <ol className="flex items-center">
              {['New', 'Packed', 'Shipped', 'Delivered'].map((st, i, all) => {
                const done = order.status !== 'Cancelled' && all.indexOf(order.status) >= i;
                return (
                  <li key={st} className="flex flex-1 flex-col items-center gap-1.5 text-center text-[11.5px] font-semibold">
                    <span className="flex w-full items-center">
                      <i className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : done ? 'bg-brand' : 'bg-[#E0E4EE]'}`} />
                      <span className={`flex size-7 items-center justify-center rounded-full ${done ? 'bg-brand text-white' : 'bg-[#EEF0F5] text-muted-2'}`}>{done ? <Icon.check size={15} /> : i + 1}</span>
                      <i className={`h-0.5 flex-1 ${i === all.length - 1 ? 'opacity-0' : all.indexOf(order.status) > i && order.status !== 'Cancelled' ? 'bg-brand' : 'bg-[#E0E4EE]'}`} />
                    </span>
                    <span className={done ? 'text-navy-900' : 'text-muted-2'}>{st}</span>
                  </li>
                );
              })}
            </ol>
            {order.status === 'Cancelled' && <p className="rounded-xl bg-[#FDECEC] px-3.5 py-2.5 text-[13.5px] font-semibold text-[#B42318]">This order was cancelled.</p>}

            <section className="rounded-2xl border border-[#EEF0F5] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Customer Details</h3>
                <Link to={`/admin/customers?q=${encodeURIComponent(order.phone || order.customer)}`} className="text-xs font-bold text-navy-900 hover:text-brand">
                  Full Profile →
                </Link>
              </div>
              <b className="text-[15px]">{order.customer}</b>
              {order.email && <p className="text-[12.5px] text-muted-2">{order.email}</p>}
              <p className="text-[13.5px] text-muted mt-0.5">{order.address}{order.pin && ` — PIN: ${order.pin}`}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F5FA] px-3 py-1.5 text-[13px] font-semibold"><Icon.phone size={15} /> {order.phone}</a>
                <a href={`https://wa.me/91${order.phone}?text=Hello%20${encodeURIComponent(order.customer)},%20update%20for%20order%20%23${order.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#E5F5EC] px-3 py-1.5 text-[13px] font-semibold text-[#17703D]">WhatsApp</a>
                {order.email && <a href={`mailto:${order.email}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F5FA] px-3 py-1.5 text-[13px] font-semibold"><Icon.mail size={15} /> Email</a>}
              </div>
            </section>

            <section className="rounded-2xl border border-[#EEF0F5] p-4">
              <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-muted-2">Items</h3>
              <ul className="flex flex-col gap-3">
                {order.items.map((it) => {
                  const p = data.products.find((x) => x.id === it.id);
                  return (
                    <li key={it.id} className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-xl" style={{ background: p?.bg }}><img src={p?.image} alt="" className="h-9 w-auto" /></span>
                      <span className="flex-1 text-[14px] font-semibold">{it.name}</span>
                      <span className="text-[14px] text-muted">× {it.qty}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-4 flex flex-col gap-1.5 border-t border-[#EEF0F5] pt-3 text-[14px]">
                <div className="flex justify-between text-muted"><dt>Subtotal ({order.sticks} roll ons, offers applied)</dt><dd>{inr(order.subtotal)}</dd></div>
                <div className="flex justify-between text-muted"><dt>Delivery</dt><dd>{order.delivery ? inr(order.delivery) : 'Free'}</dd></div>
                {order.couponOff > 0 && <div className="flex justify-between text-muted"><dt>Coupon {order.coupon}</dt><dd>− {inr(order.couponOff)}</dd></div>}
                {order.codFee > 0 && <div className="flex justify-between text-muted"><dt>COD fee</dt><dd>{inr(order.codFee)}</dd></div>}
                <div className="flex justify-between text-[16px] font-bold"><dt>Total · {order.payment}</dt><dd>{inr(order.total)}</dd></div>
              </dl>
            </section>

            <section className="rounded-2xl border border-[#EEF0F5] p-4">
              <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-muted-2">Shipping (Ekart)</h3>
              <div className="flex gap-2">
                <Field label="Tracking number" className="flex-1"><input className={inputCls} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. EK1234567890" /></Field>
                <Btn className="mt-[26px]" onClick={() => update('orders', order.id, { tracking }, 'Tracking saved')}>Save</Btn>
              </div>
              <label className="mt-3 flex items-center gap-2 text-[13.5px]">
                <span className="font-semibold">Status</span>
                <select value={order.status} onChange={(e) => update('orders', order.id, { status: e.target.value }, `Status: ${e.target.value}`)} className="min-h-9 rounded-lg border border-[#E0E4EE] px-2 text-[13.5px]">
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </section>
          </div>
        )}
      </Drawer>
    </>
  );
}
