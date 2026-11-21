import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../store.jsx';
import { ORDER_STATUSES } from '../data.js';
import { business } from '../../data/site.js';
import { Badge, Btn, Card, Empty, Field, Icon, PageHeader, Toolbar, fmtDate, fmtDateTime, inr, inputCls } from '../ui.jsx';
import InvoiceModal from '../components/InvoiceModal.jsx';

/**
 * Dedicated Full-Page Customer Dashboard
 * Displays complete 360-degree client information, contact channels,
 * lifetime value metrics, and itemized purchase history ("kya kya liya hai").
 */
function CustomerDashboard({ customer, onBack, onUpdateOrder, products, onOpenInvoice }) {
  const [trackingMap, setTrackingMap] = useState({});
  const [visibleCount, setVisibleCount] = useState(3);

  const visibleOrders = customer.orders.slice(0, visibleCount);
  const hasMore = visibleCount < customer.orders.length;
  const canShowLess = visibleCount > 3;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Navigation & Profile Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-navy-900 shadow-xs hover:border-navy-900 hover:bg-[#F3F5FA] cursor-pointer"
            title="Back to all customers"
          >
            <span className="text-lg font-bold">←</span>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-head text-[24px] sm:text-[28px] font-bold text-navy-900">
                {customer.name}
              </h1>
              <span className="rounded-lg bg-[#F1F3F9] px-2.5 py-0.5 text-xs font-mono font-bold text-navy-900">
                #{customer.id}
              </span>
            </div>
            <p className="text-[13px] text-muted-2">
              Customer since {fmtDate(customer.joined || customer.createdAt)} · {customer.count} total order{customer.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {customer.phone && (
            <>
              <a
                href={`https://wa.me/91${customer.phone}?text=Hello%20${encodeURIComponent(customer.name)},%20greetings%20from%20DriftOn!%20Regarding%20your%20order...`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 px-3.5 py-2 text-[13.5px] font-bold text-[#128C7E] hover:bg-[#25D366]/25 transition"
              >
                <span>💬 WhatsApp</span>
                <span className="font-mono text-xs">+91 {customer.phone}</span>
              </a>
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] font-semibold text-navy-900 hover:bg-[#F3F5FA] transition"
              >
                <Icon.phone size={14} /> Call
              </a>
            </>
          )}
          {customer.email && (
            <a
              href={`mailto:${customer.email}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] font-semibold text-navy-900 hover:bg-[#F3F5FA] transition"
            >
              <Icon.mail size={14} /> Email
            </a>
          )}
        </div>
      </div>

      {/* 4 Lifetime Performance Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Lifetime Spend (LTV)</span>
          <b className="mt-1 block font-head text-[26px] font-extrabold text-[#17703D]">{inr(customer.spent)}</b>
          <span className="text-xs text-muted-2">Across all valid orders</span>
        </Card>
        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Orders Placed</span>
          <b className="mt-1 block font-head text-[26px] font-bold text-navy-900">{customer.count}</b>
          <span className="text-xs text-muted-2">
            {customer.count > 1 ? '🌟 Repeat Loyal Buyer' : '🌱 Single Order Customer'}
          </span>
        </Card>
        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Roll Ons Purchased</span>
          <b className="mt-1 block font-head text-[26px] font-bold text-navy-900">{customer.totalSticks}</b>
          <span className="text-xs text-muted-2">Favorite: <b className="text-navy-900">{customer.favVariant || 'Natural'}</b></span>
        </Card>
        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Avg. Order Value (AOV)</span>
          <b className="mt-1 block font-head text-[26px] font-bold text-navy-900">
            {inr(customer.count ? Math.round(customer.spent / customer.count) : 0)}
          </b>
          <span className="text-xs text-muted-2">Per checkout session</span>
        </Card>
      </div>

      {/* Main Dashboard Layout: Profile on Left, Complete Order History on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Client Details, Address, Behavior */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          {/* Client Profile Card */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-line">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 font-head text-[18px] font-bold text-white shadow-md">
                {customer.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'U'}
              </span>
              <div className="min-w-0 flex-1">
                <b className="block text-[17px] font-bold text-navy-900 truncate">{customer.name}</b>
                <span className="text-[13px] text-muted-2 block truncate">{customer.email || 'No email provided'}</span>
                <span className="text-[13px] font-mono font-semibold text-navy-900 block mt-0.5">
                  {customer.phone ? `+91 ${customer.phone}` : 'No phone provided'}
                </span>
              </div>
            </div>

            {/* Address Details */}
            <div>
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted-2 mb-1 block">
                Primary Shipping Address
              </span>
              <div className="rounded-xl bg-[#F8F9FC] p-3 text-[13.5px] text-navy-900 border border-line">
                <p className="font-medium leading-relaxed">
                  {customer.address || customer.fullAddress || 'Address specified in individual orders.'}
                </p>
                {customer.pin && (
                  <p className="mt-1 text-xs text-muted font-semibold">
                    PIN Code: <span className="font-mono text-navy-900">{customer.pin}</span>
                  </p>
                )}
                {customer.city && (
                  <p className="text-xs text-muted">
                    City / Region: <span className="font-medium text-navy-900">{customer.city}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Buying Preferences */}
            <div className="pt-1 flex flex-col gap-2.5 text-[13px]">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted-2">
                Customer Persona & Stats
              </span>
              <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-2">
                <span className="text-muted">Payment Preference:</span>
                <span className="font-semibold text-navy-900">
                  {customer.hasPrepaid && customer.hasCod ? 'Mixed (Prepaid & COD)' : customer.hasPrepaid ? '100% Prepaid / UPI' : customer.hasCod ? 'Cash on Delivery (COD)' : 'Prepaid'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-2">
                <span className="text-muted">Preferred Variant:</span>
                <span className="font-semibold text-brand-dark">{customer.favVariant || 'Natural'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-2">
                <span className="text-muted">Customer Segment:</span>
                <Badge tone={customer.count > 1 ? 'Active' : 'New'}>
                  {customer.count > 1 ? 'Repeat Buyer' : 'New Customer'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Last Active Order:</span>
                <span className="font-medium text-navy-900">
                  {customer.lastDate ? fmtDateTime(customer.lastDate) : '—'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Complete Orders History ("Kya Kya Liya Hai") */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-head text-[19px] font-bold text-navy-900">
                Purchase History ({customer.orders.length} Orders)
              </h2>
              <p className="text-[13px] text-muted-2">
                Detailed item breakdown, quantities, payments, and Ekart tracking numbers.
              </p>
            </div>
          </div>

          {customer.orders.length === 0 ? (
            <Card className="p-8 text-center">
              <Empty
                icon={Icon.orders}
                text="No orders placed yet"
                sub="This user hasn't made any purchases so far."
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleOrders.map((o) => {
                const currentTracking = trackingMap[o.id] !== undefined ? trackingMap[o.id] : (o.tracking || '');
                return (
                  <Card key={o.id} className="p-5 shadow-xs overflow-hidden border border-[#E0E4EE]">
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F5] pb-3.5">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <b className="font-head text-[17px] font-bold text-navy-900">Order #{o.id}</b>
                          <Badge tone={o.status}>{o.status}</Badge>
                        </div>
                        <span className="text-[12.5px] text-muted-2">{fmtDateTime(o.date)}</span>
                      </div>

                      {/* Quick Order Actions: Invoice & Live Status Dropdown */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(o)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-white px-3 py-1.5 text-xs font-bold text-navy-900 hover:border-navy-900 hover:bg-[#F3F5FA] transition cursor-pointer"
                          title="Print Professional GST Tax Invoice"
                        >
                          <Icon.print size={14} /> Tax Invoice
                        </button>
                        <div className="flex items-center gap-1.5 bg-page px-2.5 py-1 rounded-xl border border-line">
                          <span className="text-[11.5px] font-bold text-muted-2 uppercase">Status:</span>
                          <select
                            value={o.status}
                            onChange={(e) => onUpdateOrder(o.id, { status: e.target.value }, `Order #${o.id} status updated to ${e.target.value}`)}
                            className="bg-transparent text-xs font-bold text-navy-900 outline-none cursor-pointer"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items ("Kya Kya Liya Hai") */}
                    <div className="py-4">
                      <span className="block text-[12px] font-bold uppercase tracking-wider text-muted-2 mb-2.5">
                        Items Purchased ({o.sticks || (o.items || []).reduce((s, it) => s + (it.qty || 1), 0)} roll ons)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(o.items || []).map((it, idx) => {
                          const p = products.find((x) => x.id === it.id);
                          return (
                            <div key={idx} className="flex items-center gap-3 rounded-xl bg-[#F8F9FC] p-2.5 border border-line">
                              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white p-1 border border-line shadow-xs">
                                <img
                                  src={p?.image || '/assets/images/cutouts/crystal.webp'}
                                  alt=""
                                  className="h-full w-auto object-contain"
                                />
                              </span>
                              <div className="min-w-0 flex-1">
                                <b className="block text-[13.5px] font-bold text-navy-900 truncate">
                                  {it.name || p?.name || 'DriftOn Roll On'}
                                </b>
                                <span className="text-[12px] text-muted-2 block">
                                  Quantity: <b className="text-navy-900">{it.qty} {it.qty === 1 ? 'stick' : 'sticks'}</b>
                                </span>
                              </div>
                              <span className="font-head text-[14px] font-bold text-navy-900">
                                × {it.qty}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Shipping Address & Ekart Tracking Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-page p-3 text-[12.5px] border border-line">
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-2 mb-0.5">
                          Delivery Address:
                        </span>
                        <p className="font-medium text-navy-900">
                          {o.address || customer.fullAddress || '—'}
                          {o.pin ? ` (PIN: ${o.pin})` : ''}
                        </p>
                        <p className="mt-1 text-xs text-muted-2">
                          Phone: <b>+91 {o.phone || customer.phone}</b>
                        </p>
                      </div>

                      <div className="flex flex-col justify-between">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-2 mb-1">
                          Ekart Courier Tracking:
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            placeholder="Enter Ekart tracking number..."
                            value={currentTracking}
                            onChange={(e) => setTrackingMap({ ...trackingMap, [o.id]: e.target.value })}
                            className="min-h-8 flex-1 rounded-lg border border-line bg-white px-2.5 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateOrder(o.id, { tracking: currentTracking }, `Tracking saved for #${o.id}`)}
                            className="btn-navy min-h-8 px-3 text-xs font-semibold"
                          >
                            Save
                          </button>
                        </div>
                        {currentTracking && (
                          <a
                            href={business.trackUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11.5px] font-semibold text-brand underline mt-1"
                          >
                            Track on Ekart →
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-3.5 border-t border-[#EEF0F5] pt-3 text-[13px]">
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
                        <div className="flex justify-between text-[#17703D] py-0.5 font-semibold">
                          <span>Delivery</span>
                          <span>Free (Combo Offer)</span>
                        </div>
                      )}
                      {o.couponOff > 0 && (
                        <div className="flex justify-between text-[#17703D] py-0.5 font-semibold">
                          <span>Coupon Applied ({o.coupon})</span>
                          <span>− {inr(o.couponOff)}</span>
                        </div>
                      )}
                      {o.codFee > 0 && (
                        <div className="flex justify-between text-muted-2 py-0.5">
                          <span>COD Handling Fee</span>
                          <span>{inr(o.codFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[15.5px] font-extrabold text-navy-900 pt-1.5 border-t border-[#EEF0F5] mt-1">
                        <span>Total Paid ({o.payment || 'Prepaid'})</span>
                        <span className="text-[#17703D]">{inr(o.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px] text-muted-2 mt-1">
                        <span>Payment Mode: <b>{o.payment || 'Easebuzz UPI / Card'}</b></span>
                        <span>
                          Payment Status: <b className="text-navy-900">{o.paymentStatus || (o.payment === 'COD' ? 'Pay on delivery' : 'Paid')}</b>
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Progressive Order Pagination: 3 orders initially, then Show More (+3) */}
              {customer.orders.length > 3 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-xs mt-2">
                  <div className="text-xs text-muted-2 font-medium">
                    Showing <b className="text-navy-900 font-bold">{visibleOrders.length}</b> of <b className="text-navy-900 font-bold">{customer.orders.length}</b> orders placed by this customer
                  </div>
                  <div className="flex items-center gap-2">
                    {canShowLess && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(3)}
                        className="rounded-xl border border-line bg-page px-3.5 py-2 text-xs font-bold text-navy-900 hover:bg-[#EEF1F8] transition cursor-pointer"
                      >
                        Show Less (First 3)
                      </button>
                    )}
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 3)}
                        className="btn-navy min-h-9 px-4 text-xs font-bold shadow-xs hover:scale-102 active:scale-98 transition-transform cursor-pointer"
                      >
                        Show More Orders (+3) ↓
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { data, update } = useAdmin();
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

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

  // Determine active customer for the dedicated dashboard page
  const activeId = paramId || openId;
  const selected = useMemo(() => {
    if (!activeId) return null;
    const found = rows.find((x) => x.id === activeId) || data.customers.find((x) => x.id === activeId);
    if (!found) return null;
    return rows.find((x) => x.id === found.id) || {
      ...found,
      orders: data.orders.filter((o) => o.phone === found.phone || o.customerId === found.id),
      spent: 0,
      count: 0,
      totalSticks: 0,
    };
  }, [activeId, rows, data.customers, data.orders]);

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

  // If a customer is selected, render the Dedicated Full-Page Customer Dashboard!
  if (selected) {
    return (
      <>
        <CustomerDashboard
          customer={selected}
          onBack={() => {
            setOpenId(null);
            navigate('/admin/customers');
          }}
          onUpdateOrder={(orderId, patch, msg) => update('orders', orderId, patch, msg)}
          products={data.products}
          onOpenInvoice={(order) => setInvoiceOrder(order)}
        />
        {/* Professional Tax Invoice Modal */}
        <InvoiceModal
          order={invoiceOrder}
          settings={data.settings}
          products={data.products}
          open={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Customers & Users"
        sub="360° buyer profiles, lifetime order history, delivery addresses and customer analytics."
      />

      {/* Top Level Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Total Customers</span>
          <b className="mt-1 block font-head text-[24px] font-bold text-navy-900">{data.customers.length}</b>
          <span className="text-xs text-muted-2">Registered buyer profiles</span>
        </Card>
        <Card className="p-4">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Repeat Buyers</span>
          <b className="mt-1 block font-head text-[24px] font-bold text-brand-dark">{repeatCount}</b>
          <span className="text-xs text-muted-2">
            {data.customers.length ? `${Math.round((repeatCount / data.customers.length) * 100)}% retention rate` : '0%'}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Total Customer Revenue</span>
          <b className="mt-1 block font-head text-[24px] font-bold text-[#17703D]">{inr(totalSpentAll)}</b>
          <span className="text-xs text-muted-2">All-time lifetime revenue</span>
        </Card>
        <Card className="p-4">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-2">Avg. Spend per User</span>
          <b className="mt-1 block font-head text-[24px] font-bold text-navy-900">
            {inr(data.customers.length ? Math.round(totalSpentAll / data.customers.length) : 0)}
          </b>
          <span className="text-xs text-muted-2">Average customer value</span>
        </Card>
      </div>

      {/* Toolbar: Search & Segment Filter Tabs */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-[420px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2">
            <Icon.search size={16} />
          </span>
          <input
            type="search"
            placeholder="Search by name, phone, email, city, order ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`${inputCls} pl-10`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F0F2F6] p-1">
          {chips.map(([id, label, cnt]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                tab === id ? 'bg-white text-navy-900 shadow-xs' : 'text-muted-2 hover:text-navy-900'
              }`}
            >
              {label} ({cnt})
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table / List */}
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <Empty
            icon={Icon.users}
            text="No customers match your filter"
            sub="Try searching for a different name, phone number or address."
          />
        ) : (
          <>
            {/* Mobile View */}
            <ul className="divide-y divide-[#EEF0F5] md:hidden">
              {rows.map((r) => (
                <li
                  key={r.id}
                  onClick={() => navigate(`/admin/customers/${r.id}`)}
                  className="flex flex-col gap-2 p-4 transition hover:bg-[#F8F9FC] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 font-head text-xs font-bold text-white">
                        {r.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                      </span>
                      <div className="min-w-0">
                        <b className="block text-[14px] text-navy-900 font-bold truncate">{r.name}</b>
                        <span className="text-xs text-muted-2 block">{r.phone || r.email || '—'}</span>
                      </div>
                    </div>
                    <b className="text-[14px] font-bold text-[#17703D]">{inr(r.spent)}</b>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-2 pt-1 border-t border-[#F0F2F6]">
                    <span>{r.count} order{r.count !== 1 ? 's' : ''} ({r.totalSticks} roll ons)</span>
                    <span className="text-brand font-bold">Open Full Dashboard →</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[840px] text-left text-[14px]">
                <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-3 py-3 font-semibold">Contact & Address</th>
                    <th className="px-3 py-3 font-semibold">Orders & Units</th>
                    <th className="px-3 py-3 font-semibold">Total Spend</th>
                    <th className="px-3 py-3 font-semibold">Latest Order</th>
                    <th className="px-5 py-3 text-right">Customer Dashboard</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/admin/customers/${r.id}`)}
                      className="group border-t border-[#EEF0F5] hover:bg-[#FAFBFD] cursor-pointer transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 font-head text-[13px] font-bold text-white shadow-xs">
                            {r.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                          </span>
                          <div className="min-w-0">
                            <b className="block text-[14.5px] font-bold text-navy-900 group-hover:text-brand transition">
                              {r.name}
                            </b>
                            <span className="text-[12px] text-muted-2">Joined {fmtDate(r.joined || r.createdAt)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex flex-col gap-0.5 text-[13px]">
                          <span className="font-semibold text-navy-900">{r.phone || '—'}</span>
                          {r.email && <span className="text-[12px] text-muted-2 truncate max-w-[190px]">{r.email}</span>}
                          <span className="text-[12px] text-muted truncate max-w-[210px]">{r.fullAddress}</span>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-navy-900">
                            {r.count} order{r.count !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-muted-2">{r.totalSticks} total roll ons</span>
                        </div>
                      </td>

                      <td className="px-3 py-4 font-extrabold text-[#17703D] text-[15px]">
                        {inr(r.spent)}
                      </td>

                      <td className="px-3 py-4">
                        {r.latestOrderId ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-navy-900">#{r.latestOrderId}</span>
                              <Badge tone={r.latestStatus}>{r.latestStatus}</Badge>
                            </div>
                            <span className="text-[12px] text-muted-2">
                              {r.lastDate ? fmtDate(r.lastDate) : '—'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-2">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-page px-3 py-1.5 text-[12.5px] font-bold text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition shadow-2xs">
                          Open Dashboard →
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

      {/* Professional Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        settings={data.settings}
        products={data.products}
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </>
  );
}
