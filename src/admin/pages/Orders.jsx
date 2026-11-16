import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../store.jsx';
import { ORDER_STATUSES } from '../data.js';
import { Badge, Btn, Card, Drawer, Empty, Field, Icon, PageHeader, Toolbar, fmtDateTime, inputCls, inr } from '../ui.jsx';

const csv = (rows) => {
  const head = ['Order', 'Date', 'Customer', 'Phone', 'City', 'Items', 'Total', 'Payment', 'Status', 'Tracking'];
  const body = rows.map((o) => [o.id, new Date(o.date).toLocaleString('en-IN'), o.customer, o.phone, o.city, o.items.map((i) => `${i.name} x${i.qty}`).join(' + '), o.total, o.payment, o.status, o.tracking]);
  return [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
};

export default function Orders() {
  const { data, update } = useAdmin();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [tab, setTab] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [tracking, setTracking] = useState('');

  const list = useMemo(() => data.orders.filter((o) =>
    (tab === 'all' || o.status === tab) &&
    (!q || `${o.id} ${o.customer} ${o.phone} ${o.city}`.toLowerCase().includes(q.toLowerCase()))), [data.orders, q, tab]);
  const order = data.orders.find((o) => o.id === openId);
  const chips = [['all', 'All', data.orders.length], ...ORDER_STATUSES.map((s) => [s, s, data.orders.filter((o) => o.status === s).length])];

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([csv(list)], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'drifton-orders.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const open = (o) => { setOpenId(o.id); setTracking(o.tracking || ''); };
  const next = { New: 'Packed', Packed: 'Shipped', Shipped: 'Delivered' };

  return (
    <>
      <PageHeader title="Orders" sub="Track, pack and ship every order.">
        <Btn variant="ghost" onClick={exportCsv}><Icon.download size={18} /> Export CSV</Btn>
      </PageHeader>

      <Card className="overflow-hidden">
        <Toolbar q={q} setQ={setQ} placeholder="Search order ID, name, phone, city…" chips={chips} active={tab} setActive={setTab} />
        {list.length === 0 ? <Empty text="No orders match your search." /> : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2">
                  <tr><th className="px-5 py-3 font-semibold">Order</th><th className="px-3 py-3 font-semibold">Customer</th><th className="px-3 py-3 font-semibold">Items</th><th className="px-3 py-3 font-semibold">Total</th><th className="px-3 py-3 font-semibold">Payment</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-5 py-3" /></tr>
                </thead>
                <tbody>
                  {list.map((o) => (
                    <tr key={o.id} onClick={() => open(o)} className="cursor-pointer border-t border-[#EEF0F5] transition hover:bg-[#FAFBFD]">
                      <td className="px-5 py-3.5"><b>#{o.id}</b><span className="block text-[12px] text-muted-2">{fmtDateTime(o.date)}</span></td>
                      <td className="px-3 py-3.5">{o.customer}<span className="block text-[12px] text-muted-2">{o.city}</span></td>
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
            <ul className="flex flex-col divide-y divide-[#EEF0F5] md:hidden">
              {list.map((o) => (
                <li key={o.id}>
                  <button onClick={() => open(o)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                    <span className="min-w-0 flex-1">
                      <b className="block text-[14.5px]">#{o.id} · {inr(o.total)}</b>
                      <span className="block truncate text-[13px] text-muted-2">{o.customer} · {o.city} · {fmtDateTime(o.date)}</span>
                    </span>
                    <Badge>{o.status}</Badge>
                  </button>
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
            <Btn variant="ghost" onClick={() => window.print()}><Icon.print size={18} /> Print invoice</Btn>
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
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-muted-2">Customer</h3>
              <b className="text-[15px]">{order.customer}</b>
              <p className="text-[13.5px] text-muted">{order.address}</p>
              <div className="mt-3 flex gap-2">
                <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F5FA] px-3 py-1.5 text-[13px] font-semibold"><Icon.phone size={15} /> {order.phone}</a>
                <a href={`https://wa.me/91${order.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#E5F5EC] px-3 py-1.5 text-[13px] font-semibold text-[#17703D]">WhatsApp</a>
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
