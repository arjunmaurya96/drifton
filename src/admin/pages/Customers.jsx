import { useMemo, useState } from 'react';
import { useAdmin } from '../store.jsx';
import { ORDER_STATUSES } from '../data.js';
import { Badge, Btn, Card, Drawer, Empty, Field, Icon, PageHeader, Toolbar, fmtDate, fmtDateTime, inr, inputCls } from '../ui.jsx';

export default function Customers() {
  const { data, update } = useAdmin();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [trackingMap, setTrackingMap] = useState({});

  // Aggregate customers with their full orders
  const rows = useMemo(() => {
    return data.customers.map((c) => {
      // Find all orders matching this customer by phone, email, or customer name
      const orders = data.orders.filter((o) =>
        (o.phone && o.phone === c.phone) ||
        (o.email && o.email.toLowerCase() === (c.email || '').toLowerCase()) ||
        o.customerId === c.id
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const validOrders = orders.filter((o) => o.status !== 'Cancelled');
      const totalSticks = validOrders.reduce((s, o) => s + (o.sticks || 0), 0);
      const spent = validOrders.reduce((s, o) => s + (o.total || 0), 0);
      const hasCod = orders.some((o) => o.payment === 'COD');
      const hasPrepaid = orders.some((o) => o.payment && o.payment !== 'COD');
      const latestOrder = orders[0];

      // Favorite variant
      const variantCounts = {};
      validOrders.forEach((o) => (o.items || []).forEach((it) => {
        variantCounts[it.name] = (variantCounts[it.name] || 0) + it.qty;
      }));
      const favVariant = Object.entries(variantCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      return {
        ...c,
        orders,
        validOrders,
        count: orders.length,
        spent,
        totalSticks,
        favVariant,
        hasCod,
        hasPrepaid,
        lastDate: latestOrder?.date,
        latestOrderId: latestOrder?.id,
        latestStatus: latestOrder?.status,
        fullAddress: c.address ? `${c.address}${c.pin ? ` - ${c.pin}` : ''}` : c.city || '—',
      };
    }).filter((c) => {
      if (tab === 'repeat' && c.count <= 1) return false;
      if (tab === 'single' && c.count !== 1) return false;
      if (tab === 'cod' && !c.hasCod) return false;
      if (tab === 'prepaid' && !c.hasPrepaid) return false;

      if (!q) return true;
      const term = q.toLowerCase();
      const orderIds = c.orders.map((o) => o.id).join(' ').toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(term) ||
        (c.phone || '').includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.city || '').toLowerCase().includes(term) ||
        (c.fullAddress || '').toLowerCase().includes(term) ||
        orderIds.includes(term)
      );
    }).sort((a, b) => b.spent - a.spent);
  }, [data.customers, data.orders, q, tab]);

  const activeCustomer = rows.find((x) => x.id === openId) || data.customers.find((x) => x.id === openId);
  const selected = useMemo(() => {
    if (!activeCustomer) return null;
    return rows.find((x) => x.id === activeCustomer.id) || {
      ...activeCustomer,
      orders: data.orders.filter((o) => o.phone === activeCustomer.phone || o.customerId === activeCustomer.id),
      spent: 0,
      count: 0,
      totalSticks: 0,
    };
  }, [activeCustomer, rows, data.orders]);

  const totalSpentAll = useMemo(() => rows.reduce((s, c) => s + c.spent, 0), [rows]);
  const repeatCount = useMemo(() => data.customers.filter((c) => {
    const ords = data.orders.filter((o) => o.phone === c.phone || o.customerId === c.id);
    return ords.length > 1;
  }).length, [data.customers, data.orders]);

  const chips = [
    ['all', 'All Users', data.customers.length],
    ['repeat', 'Repeat Buyers', repeatCount],
    ['single', 'Single Order', Math.max(0, data.customers.length - repeatCount)],
  ];

  return (
    <>
      <PageHeader
        title="Users & Customer Details"
        sub="Sabhi registered customers aur unke saare orders ki complete details yahan dekhein."
      />

      {/* Overview Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Card className="p-4 sm:p-5">
          <span className="text-[12.5px] font-medium text-muted-2 sm:text-[13px]">Total Customers / Users</span>
          <b className="mt-2 block font-head text-[22px] font-bold text-navy-900 sm:text-[26px]">{data.customers.length}</b>
          <span className="text-[12px] text-muted-2">DriftOn store buyers</span>
        </Card>
        <Card className="p-4 sm:p-5">
          <span className="text-[12.5px] font-medium text-muted-2 sm:text-[13px]">Repeat Buyers (Bar-bar lene wale)</span>
          <b className="mt-2 block font-head text-[22px] font-bold text-brand sm:text-[26px]">{repeatCount}</b>
          <span className="text-[12px] text-muted-2">2 ya zyada orders wale</span>
        </Card>
        <Card className="p-4 sm:p-5">
          <span className="text-[12.5px] font-medium text-muted-2 sm:text-[13px]">Total Orders Placed</span>
          <b className="mt-2 block font-head text-[22px] font-bold text-navy-900 sm:text-[26px]">{data.orders.length}</b>
          <span className="text-[12px] text-muted-2">All time customer orders</span>
        </Card>
        <Card className="p-4 sm:p-5">
          <span className="text-[12.5px] font-medium text-muted-2 sm:text-[13px]">Total Revenue</span>
          <b className="mt-2 block font-head text-[22px] font-bold text-[#17703D] sm:text-[26px]">{inr(totalSpentAll)}</b>
          <span className="text-[12px] text-muted-2">Total sales from users</span>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="overflow-hidden shadow-sm">
        <Toolbar
          q={q}
          setQ={setQ}
          placeholder="Search by Name, Phone, Email, Address, Order #..."
          chips={chips}
          active={tab}
          setActive={setTab}
        />

        {rows.length === 0 ? (
          <Empty icon={Icon.users} text="No customers found" sub="Customers appear here after their first order. Try a different name, phone or email." />
        ) : (
          <>
          {/* mobile cards */}
          <ul className="flex flex-col gap-2.5 bg-[#F6F7FB] p-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <button onClick={() => setOpenId(r.id)} className="flex w-full items-start gap-3 rounded-2xl border border-[#E6E9F2] bg-white p-3.5 text-left">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF0FF] font-head text-[13px] font-bold text-[#2647B8]">
                    {r.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5"><b className="text-[15px]">{r.name}</b>
                      {r.count > 1 && <span className="rounded-full bg-[#E5F5EC] px-2 py-0.5 text-[10.5px] font-bold text-[#17703D]">Repeat ({r.count})</span>}</span>
                    <span className="block text-[13px] text-muted-2">{r.phone || '—'}{r.email ? ` · ${r.email}` : ''}</span>
                    <span className="mt-1.5 flex items-center justify-between text-[13px]">
                      <span className="text-muted">{r.count} order{r.count !== 1 ? 's' : ''}{r.latestOrderId ? ` · last #${r.latestOrderId}` : ''}</span>
                      <b className="text-[#17703D]">{inr(r.spent)}</b>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Customer / User</th>
                  <th className="px-3 py-3.5 font-semibold">Contact & Address</th>
                  <th className="px-3 py-3.5 font-semibold">Orders Count</th>
                  <th className="px-3 py-3.5 font-semibold">Total Spent</th>
                  <th className="px-3 py-3.5 font-semibold">Latest Order</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F5]">
                {rows.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => setOpenId(r.id)}
                    className="cursor-pointer transition hover:bg-[#FAFBFD]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF0FF] font-head text-[13px] font-bold text-[#2647B8]">
                          {r.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <b className="font-semibold text-navy-900">{r.name}</b>
                            {r.count > 1 && (
                              <span className="rounded-full bg-[#E5F5EC] px-2 py-0.5 text-[10.5px] font-bold text-[#17703D]">
                                Repeat ({r.count})
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] text-muted-2">
                            Customer since {fmtDate(r.joined)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-navy-900">{r.phone || '—'}</span>
                        {r.email && <span className="text-[12px] text-muted-2 truncate max-w-[180px]">{r.email}</span>}
                        <span className="text-[12px] text-muted truncate max-w-[200px]">{r.fullAddress}</span>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-navy-900">{r.count}</span>
                        <span className="text-xs text-muted-2">order{r.count !== 1 ? 's' : ''} ({r.totalSticks} sticks)</span>
                      </div>
                    </td>

                    <td className="px-3 py-4 font-bold text-[#17703D]">
                      {inr(r.spent)}
                    </td>

                    <td className="px-3 py-4">
                      {r.latestOrderId ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-navy-900">#{r.latestOrderId}</span>
                            <Badge tone={r.latestStatus}>{r.latestStatus}</Badge>
                          </div>
                          <span className="text-[12px] text-muted-2">{r.lastDate ? fmtDate(r.lastDate) : '—'}</span>
                        </div>
                      ) : (
                        <span className="text-muted-2">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[13px] font-bold text-navy-700 group-hover:underline">
                        All Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>

      {/* Customer Full 360-degree Details Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setOpenId(null)}
        title={selected ? selected.name : ''}
        sub={selected && `Customer Profile · Joined ${fmtDate(selected.joined)}`}
      >
        {selected && (
          <div className="flex flex-col gap-6">
            {/* Customer Contact & Profile Card */}
            <section className="rounded-2xl border border-[#EEF0F5] bg-[#F8F9FC] p-4.5">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E6E9F2]">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 font-head text-[16px] font-bold text-white">
                  {selected.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] font-bold text-navy-900 truncate">{selected.name}</h3>
                  <p className="text-[12.5px] text-muted-2 truncate">{selected.email || 'No email provided'}</p>
                </div>
              </div>

              {/* Direct Quick Action Buttons */}
              <div className="mt-3.5 flex flex-wrap gap-2">
                {selected.phone && (
                  <>
                    <a
                      href={`tel:${selected.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-navy-900 hover:bg-[#F3F5FA]"
                    >
                      <Icon.phone size={14} /> Call ({selected.phone})
                    </a>
                    <a
                      href={`https://wa.me/91${selected.phone}?text=Hello%20${encodeURIComponent(selected.name)},%20greetings%20from%20DriftOn!`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#E5F5EC] px-3.5 py-2 text-[13px] font-semibold text-[#17703D] hover:bg-[#D4EEDB]"
                    >
                      💬 WhatsApp
                    </a>
                  </>
                )}
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-navy-900 hover:bg-[#F3F5FA]"
                  >
                    <Icon.mail size={14} /> Email
                  </a>
                )}
              </div>

              {/* Delivery Address */}
              <div className="mt-4 border-t border-[#E6E9F2] pt-3 text-[13.5px]">
                <span className="block text-[11.5px] font-bold uppercase tracking-wider text-muted-2 mb-1">
                  Primary Delivery Address
                </span>
                <p className="font-medium text-navy-900 leading-snug">
                  {selected.address || selected.fullAddress || 'Address details in order below'}
                  {selected.pin && ` — PIN: ${selected.pin}`}
                </p>
              </div>
            </section>

            {/* Lifetime Numbers */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="p-3 text-center">
                <span className="block text-[11px] font-semibold uppercase text-muted-2">Orders</span>
                <b className="mt-1 block font-head text-[20px] font-bold">{selected.count}</b>
              </Card>
              <Card className="p-3 text-center">
                <span className="block text-[11px] font-semibold uppercase text-muted-2">Total Spent</span>
                <b className="mt-1 block font-head text-[20px] font-bold text-[#17703D]">{inr(selected.spent)}</b>
              </Card>
              <Card className="p-3 text-center">
                <span className="block text-[11px] font-semibold uppercase text-muted-2">Total Sticks</span>
                <b className="mt-1 block font-head text-[20px] font-bold">{selected.totalSticks}</b>
              </Card>
              <Card className="p-3 text-center">
                <span className="block text-[11px] font-semibold uppercase text-muted-2">Avg. Order</span>
                <b className="mt-1 block font-head text-[20px] font-bold">{inr(selected.count ? selected.spent / selected.count : 0)}</b>
              </Card>
            </div>

            {/* Complete Order History with Full Details */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-navy-900">
                  Order Details ({selected.orders.length} Orders)
                </h3>
                <span className="text-xs text-muted-2">Full itemized order breakdown</span>
              </div>

              {selected.orders.length === 0 ? (
                <p className="rounded-2xl bg-page p-6 text-center text-sm text-muted">Is customer ne abhi tak koi order place nahi kiya hai.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {selected.orders.map((o) => {
                    const currentTracking = trackingMap[o.id] !== undefined ? trackingMap[o.id] : (o.tracking || '');
                    return (
                      <div key={o.id} className="rounded-2xl border border-[#E0E4EE] bg-white p-4 shadow-sm transition">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF0F5] pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <b className="font-head text-[16px] text-navy-900">Order #{o.id}</b>
                              <Badge tone={o.status}>{o.status}</Badge>
                            </div>
                            <span className="text-[12px] text-muted-2">{fmtDateTime(o.date)}</span>
                          </div>

                          {/* Inline Status Changer */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-2">Status:</span>
                            <select
                              value={o.status}
                              onChange={(e) => update('orders', o.id, { status: e.target.value }, `Status updated to ${e.target.value}`)}
                              className="rounded-lg border border-line bg-page px-2 py-1 text-xs font-bold text-navy-900 outline-none"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="py-3">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-2 mb-2">
                            Ordered Products ({o.sticks} roll ons)
                          </span>
                          <ul className="flex flex-col gap-2">
                            {(o.items || []).map((it) => {
                              const p = data.products.find((x) => x.id === it.id);
                              return (
                                <li key={it.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8F9FC] p-2 pr-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 border border-line">
                                      <img src={p?.image || '/assets/images/cutouts/crystal.webp'} alt="" className="h-full w-auto object-contain" />
                                    </span>
                                    <div className="min-w-0">
                                      <b className="block truncate text-[13.5px] font-semibold text-navy-900">{it.name}</b>
                                      <span className="text-[12px] text-muted-2">Qty: {it.qty} {it.qty === 1 ? 'stick' : 'sticks'}</span>
                                    </div>
                                  </div>
                                  <span className="text-[13px] font-bold text-navy-900">× {it.qty}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Order Delivery Address & Tracking */}
                        <div className="rounded-xl bg-page p-3 text-[13px] text-navy-900 my-2">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-2 mb-0.5">
                            Shipped To:
                          </span>
                          <p className="font-medium">{o.address || selected.fullAddress} {o.pin ? `(PIN: ${o.pin})` : ''}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-muted-2 pt-1 border-t border-line/60">
                            <span>Phone: <b>+91 {o.phone || selected.phone}</b></span>
                            {o.email && <span>Email: <b>{o.email}</b></span>}
                          </div>
                        </div>

                        {/* Tracking Input */}
                        <div className="flex items-center gap-2 my-2.5">
                          <input
                            placeholder="Ekart tracking number..."
                            value={currentTracking}
                            onChange={(e) => setTrackingMap({ ...trackingMap, [o.id]: e.target.value })}
                            className="min-h-8 flex-1 rounded-lg border border-line bg-white px-2.5 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => update('orders', o.id, { tracking: currentTracking }, 'Tracking saved')}
                            className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700"
                          >
                            Save Tracking
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="mt-3 border-t border-[#EEF0F5] pt-2.5 text-[13px]">
                          <div className="flex justify-between text-muted-2 py-0.5">
                            <span>Subtotal</span>
                            <span>{inr(o.subtotal || o.total)}</span>
                          </div>
                          {o.delivery > 0 ? (
                            <div className="flex justify-between text-muted-2 py-0.5">
                              <span>Delivery Fee</span>
                              <span>{inr(o.delivery)}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-[#17703D] py-0.5 font-medium">
                              <span>Delivery</span>
                              <span>Free (Combo Offer)</span>
                            </div>
                          )}
                          {o.couponOff > 0 && (
                            <div className="flex justify-between text-[#17703D] py-0.5 font-medium">
                              <span>Coupon ({o.coupon})</span>
                              <span>− {inr(o.couponOff)}</span>
                            </div>
                          )}
                          {o.codFee > 0 && (
                            <div className="flex justify-between text-muted-2 py-0.5">
                              <span>COD Handling Fee</span>
                              <span>{inr(o.codFee)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[15px] font-bold text-navy-900 pt-1.5 border-t border-[#EEF0F5] mt-1">
                            <span>Total Amount ({o.payment || 'Prepaid'})</span>
                            <span>{inr(o.total)}</span>
                          </div>
                          <span className="block text-[11px] text-muted-2 text-right mt-0.5">
                            Payment Status: <b className="text-navy-900">{o.paymentStatus || (o.payment === 'COD' ? 'Pay on delivery' : 'Paid')}</b>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
