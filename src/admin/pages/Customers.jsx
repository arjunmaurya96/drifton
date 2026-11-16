import { useMemo, useState } from 'react';
import { useAdmin } from '../store.jsx';
import { Badge, Card, Drawer, Empty, Icon, PageHeader, Toolbar, fmtDate, fmtDateTime, inr } from '../ui.jsx';

export default function Customers() {
  const { data } = useAdmin();
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  const rows = useMemo(() => data.customers.map((c) => {
    const orders = data.orders.filter((o) => o.customerId === c.id && o.status !== 'Cancelled');
    return { ...c, orders, count: orders.length, spent: orders.reduce((s, o) => s + o.total, 0), last: orders[0]?.date };
  }).filter((c) => c.count > 0 && (!q || `${c.name} ${c.phone} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.spent - a.spent), [data, q]);
  const c = rows.find((x) => x.id === openId);

  return (
    <>
      <PageHeader title="Customers" sub={`${rows.length} customers have ordered from DriftOn.`} />
      <Card className="overflow-hidden">
        <Toolbar q={q} setQ={setQ} placeholder="Search name, phone, email, city…" />
        {rows.length === 0 ? <Empty text="No customers found." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2"><tr><th className="px-5 py-3 font-semibold">Customer</th><th className="px-3 py-3 font-semibold">City</th><th className="px-3 py-3 font-semibold">Orders</th><th className="px-3 py-3 font-semibold">Total spent</th><th className="px-3 py-3 font-semibold">Last order</th><th className="px-5 py-3" /></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer border-t border-[#EEF0F5] hover:bg-[#FAFBFD]">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EAF0FF] text-[12px] font-bold text-[#2647B8]">{r.name.split(' ').map((x) => x[0]).join('')}</span>
                        <span><b className="block">{r.name}</b><span className="text-[12px] text-muted-2">{r.phone}</span></span>
                        {i < 3 && <Badge tone="Delivered">Top</Badge>}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-muted">{r.city}</td>
                    <td className="px-3 py-3.5">{r.count}</td>
                    <td className="px-3 py-3.5 font-semibold">{inr(r.spent)}</td>
                    <td className="px-3 py-3.5 text-muted">{r.last ? fmtDate(r.last) : '—'}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-navy-700">View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer open={!!c} onClose={() => setOpenId(null)} title={c?.name} sub={c && `Customer since ${fmtDate(c.joined)}`}>
        {c && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4"><span className="text-[12.5px] text-muted-2">Orders</span><b className="block font-head text-[22px]">{c.count}</b></Card>
              <Card className="p-4"><span className="text-[12.5px] text-muted-2">Total spent</span><b className="block font-head text-[22px]">{inr(c.spent)}</b></Card>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F5FA] px-3 py-2 text-[13px] font-semibold"><Icon.phone size={15} /> {c.phone}</a>
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F5FA] px-3 py-2 text-[13px] font-semibold"><Icon.mail size={15} /> Email</a>
              <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#E5F5EC] px-3 py-2 text-[13px] font-semibold text-[#17703D]">WhatsApp</a>
            </div>
            <div>
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-muted-2">Order history</h3>
              <ul className="flex flex-col divide-y divide-[#EEF0F5] rounded-2xl border border-[#EEF0F5]">
                {c.orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
                    <span><b>#{o.id}</b><span className="block text-[12px] text-muted-2">{fmtDateTime(o.date)} · {o.sticks} roll ons</span></span>
                    <span className="flex items-center gap-2"><b>{inr(o.total)}</b><Badge>{o.status}</Badge></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
