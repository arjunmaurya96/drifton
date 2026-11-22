import { useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../store.jsx';
import { Badge, Btn, Card, Drawer, Empty, Field, Help, Icon, PageHeader, Toggle, inputCls, fmtDate, fmtDateTime, inr } from '../ui.jsx';

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getCouponStatus(c) {
  if (!c.active) return { tone: 'Inactive', label: 'Paused' };
  const now = Date.now();
  if (c.validFrom) {
    const fromTime = new Date(c.validFrom).getTime();
    if (!isNaN(fromTime) && now < fromTime) {
      return { tone: 'Scheduled', label: 'Scheduled' };
    }
  }
  if (c.validUntil) {
    const untilTime = new Date(c.validUntil).getTime();
    if (!isNaN(untilTime) && now > untilTime) {
      return { tone: 'Expired', label: 'Expired' };
    }
  }
  if (!c.validFrom && !c.validUntil) {
    return { tone: 'Active', label: 'Unlimited' };
  }
  return { tone: 'Active', label: 'Active' };
}

// =====================================================================
//  Dedicated Full-Page Coupon Analytics & Usage Dashboard
//  • Date filters: All time, Today, Last Week (7d), Last Month (30d), Last Year, Custom Date Range
//  • Date-wise breakdown table: Daily redemptions, discount given, order revenue
//  • Detailed itemized customer and order list with search & CSV export
// =====================================================================
function CouponAnalytics({ coupon, orders = [], onBack, onEdit }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // All orders where this coupon code was applied
  const couponOrders = useMemo(() => {
    const targetCode = (coupon.code || '').trim().toUpperCase();
    return orders.filter((o) => (o.coupon || '').trim().toUpperCase() === targetCode);
  }, [orders, coupon.code]);

  // Filter orders by selected time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return couponOrders.filter((o) => {
      const oTime = new Date(o.date || o.createdAt || 0).getTime();
      if (isNaN(oTime)) return true;

      if (filter === 'today') {
        return oTime >= todayStart;
      }
      if (filter === 'week') {
        const weekAgo = Date.now() - 7 * 86400000;
        return oTime >= weekAgo;
      }
      if (filter === 'month') {
        const monthAgo = Date.now() - 30 * 86400000;
        return oTime >= monthAgo;
      }
      if (filter === 'year') {
        const yearAgo = Date.now() - 365 * 86400000;
        return oTime >= yearAgo;
      }
      if (filter === 'custom') {
        if (customFrom) {
          const fromTime = new Date(customFrom).setHours(0, 0, 0, 0);
          if (oTime < fromTime) return false;
        }
        if (customTo) {
          const toTime = new Date(customTo).setHours(23, 59, 59, 999);
          if (oTime > toTime) return false;
        }
        return true;
      }
      return true;
    });
  }, [couponOrders, filter, customFrom, customTo]);

  // Search filtered orders by customer name, order id, phone, email
  const searchedOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredOrders;
    return filteredOrders.filter((o) => {
      return (
        (o.id || '').toLowerCase().includes(q) ||
        (o.customer || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q) ||
        (o.email || '').toLowerCase().includes(q)
      );
    });
  }, [filteredOrders, search]);

  // Aggregated KPIs
  const totalUses = filteredOrders.length;
  const uniqueCustomers = new Set(filteredOrders.map((o) => (o.phone || o.email || o.customer || '').trim())).size;
  const totalDiscount = filteredOrders.reduce((sum, o) => sum + (Number(o.couponOff) || Number(coupon.off) || 0), 0);
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Date-wise grouping for the breakdown table
  const dailyBreakdown = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((o) => {
      const d = new Date(o.date || o.createdAt || 0);
      const key = isNaN(d.getTime()) ? 'Unknown' : d.toISOString().slice(0, 10);
      const displayDate = isNaN(d.getTime()) ? 'Unknown Date' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      if (!map.has(key)) {
        map.set(key, { key, displayDate, count: 0, discount: 0, revenue: 0, customers: new Set() });
      }
      const item = map.get(key);
      item.count += 1;
      item.discount += (Number(o.couponOff) || Number(coupon.off) || 0);
      item.revenue += (Number(o.total) || 0);
      item.customers.add((o.phone || o.email || o.customer || '').trim());
    });

    const list = Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
    const maxCount = Math.max(...list.map((x) => x.count), 1);
    return list.map((item) => ({ ...item, pct: Math.round((item.count / maxCount) * 100) }));
  }, [filteredOrders, coupon.off]);

  const copyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Date & Time', 'Customer', 'Phone', 'Email', 'Items', 'Coupon Code', 'Discount (INR)', 'Order Total (INR)', 'Payment', 'Status'];
    const rows = filteredOrders.map((o) => [
      o.id || '',
      new Date(o.date || o.createdAt || 0).toLocaleString('en-IN'),
      o.customer || '',
      o.phone || '',
      o.email || '',
      (o.items || []).map((i) => `${i.name || i.id} x${i.qty}`).join('; '),
      coupon.code,
      o.couponOff || coupon.off,
      o.total,
      o.payment || '',
      o.status || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coupon_${coupon.code}_usage_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const st = getCouponStatus(coupon);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Top Navigation & Coupon Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-navy-900 shadow-xs hover:border-navy-900 hover:bg-[#F3F5FA] cursor-pointer"
            title="Back to all coupons"
          >
            <span className="text-lg font-bold">←</span>
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-xl border border-dashed border-navy-700/50 bg-[#F3F5FA] px-3.5 py-1.5 font-mono text-[18px] sm:text-[20px] font-black text-navy-900 shadow-xs">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="rounded-lg bg-white border border-line px-2.5 py-1 text-xs font-semibold text-navy-700 hover:bg-[#EEF1F8] cursor-pointer"
              >
                {copied ? '✓ Copied' : 'Copy code'}
              </button>
              <Badge tone={st.tone}>{st.label}</Badge>
              <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
                ₹{coupon.off} FLAT OFF
              </span>
            </div>
            <p className="mt-1 text-[13px] text-muted-2">
              {coupon.note ? `Campaign: ${coupon.note} · ` : ''}
              {coupon.validFrom || coupon.validUntil ? (
                <span>
                  Active period: {coupon.validFrom ? fmtDateTime(coupon.validFrom) : 'Immediate'} to {coupon.validUntil ? fmtDateTime(coupon.validUntil) : 'Lifetime'}
                </span>
              ) : (
                <span className="font-semibold text-emerald-700">∞ Unlimited validity (Never expires)</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Btn variant="ghost" onClick={onEdit}>
              <Icon.edit size={16} /> Edit coupon
            </Btn>
          )}
          {filteredOrders.length > 0 && (
            <Btn variant="green" onClick={exportCSV}>
              <Icon.download size={16} /> Export CSV
            </Btn>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="flex flex-col gap-1 p-4 shadow-xs">
          <span className="text-[12px] font-bold text-muted-2 uppercase tracking-wide">Total Redemptions</span>
          <b className="font-head text-[24px] sm:text-[28px] font-bold text-navy-900">{totalUses}</b>
          <span className="text-[11.5px] text-muted-2">orders applied this coupon</span>
        </Card>

        <Card className="flex flex-col gap-1 p-4 shadow-xs">
          <span className="text-[12px] font-bold text-muted-2 uppercase tracking-wide">Unique Customers</span>
          <b className="font-head text-[24px] sm:text-[28px] font-bold text-navy-900">{uniqueCustomers}</b>
          <span className="text-[11.5px] text-muted-2">distinct buyers</span>
        </Card>

        <Card className="flex flex-col gap-1 p-4 shadow-xs">
          <span className="text-[12px] font-bold text-muted-2 uppercase tracking-wide">Discount Given</span>
          <b className="font-head text-[24px] sm:text-[28px] font-bold text-[#166534]">{inr(totalDiscount)}</b>
          <span className="text-[11.5px] text-muted-2">total customer savings</span>
        </Card>

        <Card className="flex flex-col gap-1 p-4 shadow-xs">
          <span className="text-[12px] font-bold text-muted-2 uppercase tracking-wide">Total Order Revenue</span>
          <b className="font-head text-[24px] sm:text-[28px] font-bold text-brand-dark">{inr(totalRevenue)}</b>
          <span className="text-[11.5px] text-muted-2">sales driven by coupon</span>
        </Card>
      </div>

      {/* Date Filters Bar (All Time, Today, Last Week, Last Month, Last Year, Custom) */}
      <Card className="flex flex-col gap-3 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-navy-900 mr-1.5 flex items-center gap-1">
              <Icon.clock size={15} /> Filter Period:
            </span>
            {[
              { id: 'all', label: 'All time' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Last Week (7 days)' },
              { id: 'month', label: 'Last Month (30 days)' },
              { id: 'year', label: 'Last Year' },
              { id: 'custom', label: 'Custom range' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition cursor-pointer ${
                  filter === t.id
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-[#F3F5FA] text-navy-700 hover:bg-[#E7EBF5]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-muted-2">
            Showing <b>{filteredOrders.length}</b> orders
          </span>
        </div>

        {/* Custom Date Pickers */}
        {filter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3 mt-1 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-2">From:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-xl border border-line-strong bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-navy-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-2">To:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-xl border border-line-strong bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-navy-700"
              />
            </div>
            {(customFrom || customTo) && (
              <button
                type="button"
                onClick={() => {
                  setCustomFrom('');
                  setCustomTo('');
                }}
                className="text-xs font-semibold text-[#B42318] hover:underline cursor-pointer"
              >
                Clear custom dates
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Date-wise Breakdown Table ("koun se date par kitne logo ne use kiya hai") */}
      <Card className="overflow-hidden shadow-xs">
        <div className="border-b border-line bg-[#FAFBFD] px-5 py-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-head text-[15.5px] font-bold text-navy-900">Date-wise Usage Breakdown</h3>
            <p className="text-[12px] text-muted-2">Daily breakdown of redemptions, customers, discounts and sales.</p>
          </div>
          <span className="rounded-full bg-navy-900/10 px-2.5 py-0.5 text-xs font-bold text-navy-900">
            {dailyBreakdown.length} active day{dailyBreakdown.length !== 1 ? 's' : ''}
          </span>
        </div>

        {dailyBreakdown.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-2">
            No coupon usages recorded for the selected filter period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13.5px]">
              <thead className="bg-[#F8F9FC] text-[11.5px] uppercase tracking-wider text-muted-2">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Uses / Redemptions</th>
                  <th className="px-3 py-3 font-semibold">Unique Customers</th>
                  <th className="px-3 py-3 font-semibold">Discount Given</th>
                  <th className="px-5 py-3 text-right font-semibold">Order Volume & Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F5]">
                {dailyBreakdown.map((row) => (
                  <tr key={row.key} className="hover:bg-[#FAFBFD]">
                    <td className="px-5 py-3 font-bold text-navy-900">{row.displayDate}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-navy-900 min-w-6">{row.count}</span>
                        <div className="h-2 w-28 rounded-full bg-[#E6EAF5] overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted">{row.customers.size} buyers</td>
                    <td className="px-3 py-3 font-bold text-[#166534]">{inr(row.discount)}</td>
                    <td className="px-5 py-3 text-right font-bold text-navy-900">{inr(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Itemized Orders & Customers List */}
      <Card className="overflow-hidden shadow-xs">
        <div className="border-b border-line bg-[#FAFBFD] px-5 py-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-head text-[15.5px] font-bold text-navy-900">Orders Applied This Coupon</h3>
            <p className="text-[12px] text-muted-2">Detailed list of customers who used coupon {coupon.code}.</p>
          </div>
          <div className="relative w-full max-w-[280px]">
            <input
              type="text"
              placeholder="Search customer, order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line-strong bg-white px-3 py-1.5 pl-8 text-xs outline-none focus:border-navy-700"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2">
              <Icon.search size={14} />
            </span>
          </div>
        </div>

        {searchedOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-2">
            No matching orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13.5px]">
              <thead className="bg-[#F8F9FC] text-[11.5px] uppercase tracking-wider text-muted-2">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-3 py-3 font-semibold">Date & Time</th>
                  <th className="px-3 py-3 font-semibold">Customer Details</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Discount</th>
                  <th className="px-3 py-3 font-semibold">Total Paid</th>
                  <th className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F5]">
                {searchedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAFBFD]">
                    <td className="px-5 py-3 font-mono font-bold text-navy-900">{o.id}</td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {fmtDateTime(o.date || o.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <b className="block font-semibold text-navy-900">{o.customer || 'Customer'}</b>
                      <span className="block text-[11.5px] text-muted-2">
                        {o.phone ? `+91 ${o.phone}` : ''} {o.email ? `· ${o.email}` : ''}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted max-w-[200px] truncate">
                      {(o.items || []).map((i) => `${i.name || i.id} (×${i.qty})`).join(', ') || 'Roll On'}
                    </td>
                    <td className="px-3 py-3 font-bold text-[#166534]">
                      −{inr(o.couponOff || coupon.off)}
                    </td>
                    <td className="px-3 py-3 font-bold text-navy-900">
                      {inr(o.total)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Badge tone={o.status}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// =====================================================================
//  Main Offers & Coupons Admin Page
// =====================================================================
export default function Offers() {
  const { data, update, add, remove } = useAdmin();
  const [form, setForm] = useState(null);
  const [validityMode, setValidityMode] = useState('unlimited'); // 'unlimited' | 'scheduled'
  const { code: routeCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if viewing a specific coupon's analytics
  const activeViewCode = routeCode || searchParams.get('coupon') || searchParams.get('view');
  const viewingCoupon = activeViewCode
    ? data.coupons.find((c) => c.code.toUpperCase() === activeViewCode.toUpperCase()) || {
        code: activeViewCode,
        off: 0,
        active: true,
      }
    : null;

  const openNewCoupon = () => {
    setValidityMode('unlimited');
    setForm({
      code: '',
      off: '',
      note: '',
      validFrom: '',
      validUntil: '',
    });
  };

  const openEditCoupon = (c) => {
    const isScheduled = Boolean(c.validFrom || c.validUntil);
    setValidityMode(isScheduled ? 'scheduled' : 'unlimited');
    setForm({
      ...c,
      off: String(c.off),
      validFrom: toLocalInput(c.validFrom),
      validUntil: toLocalInput(c.validUntil),
    });
  };

  const saveCoupon = () => {
    const code = (form.code || '').trim();
    if (!code || !Number(form.off)) return;

    const isUnlimited = validityMode === 'unlimited';
    const patch = {
      code,
      off: Number(form.off),
      note: form.note || '',
      validFrom: !isUnlimited && form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: !isUnlimited && form.validUntil ? new Date(form.validUntil).toISOString() : null,
    };

    const exists = data.coupons.some((c) => c.code.toUpperCase() === code.toUpperCase());
    if (exists) {
      update('coupons', code, patch, `${code} updated`);
    } else {
      add('coupons', { ...patch, uses: 0, active: true }, `${code} created`);
    }
    setForm(null);
  };

  // If viewing a coupon, display full analytics dashboard
  if (viewingCoupon) {
    return (
      <CouponAnalytics
        coupon={viewingCoupon}
        orders={data.orders}
        onBack={() => {
          if (routeCode) navigate('/admin/offers');
          else setSearchParams({});
        }}
        onEdit={() => openEditCoupon(viewingCoupon)}
      />
    );
  }

  return (
    <>
      <PageHeader title="Offers & coupons" sub="Change cart offers, unlimited/scheduled coupon codes, and view usage analytics." />
      <Help>
        Coupons support <b>special characters</b> (e.g. <code>SPECIAL@50</code>, <code>DRIFT#100</code>) and <b>Unlimited (Lifetime)</b> or <b>Scheduled Date & Time</b> validity. Click <b>View</b> on any coupon to inspect detailed usage analytics and filters.
      </Help>

      {/* Cart Offers Section */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-head text-[17px] font-bold">Cart offers</h2>
          <p className="text-[13px] text-muted-2">Customize offer titles, subtitle promo text, and discount pricing shown live in cart.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.offers.map((o) => (
          <Card key={o.id} className="flex flex-col gap-3.5 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="font-mono text-xs font-bold text-brand uppercase tracking-wider">{o.id}</span>
              <Toggle checked={o.active} onChange={(v) => update('offers', o.id, { active: v }, `${o.title || o.id} ${v ? 'on' : 'off'}`)} label={o.title || o.id} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-navy-900">Offer Title / Badge</label>
              <input
                className={inputCls}
                value={o.title || ''}
                onChange={(e) => update('offers', o.id, { title: e.target.value })}
                onBlur={() => update('offers', o.id, {}, 'Title saved')}
                placeholder="e.g. ⚡ Offer 1 · 2 Roll Ons"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-navy-900">Offer Subtitle / Promo Text</label>
              <input
                className={inputCls}
                value={o.desc || ''}
                onChange={(e) => update('offers', o.id, { desc: e.target.value })}
                onBlur={() => update('offers', o.id, {}, 'Description saved')}
                placeholder="e.g. Add another Natural fresh rollon starting ₹300 onwards"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-muted-2">Price</span>
                <span className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted-2">₹</span>
                  <input
                    inputMode="numeric"
                    value={o.value}
                    onChange={(e) => update('offers', o.id, { value: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                    onBlur={() => update('offers', o.id, {}, 'Offer saved')}
                    className={`${inputCls} w-[120px] pl-7 font-semibold`}
                  />
                </span>
                <span className="text-[12px] text-muted-2">{o.unit ? o.unit.replace('₹', '').trim() : ''}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Coupons List Section */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <div>
          <h2 className="font-head text-[17px] font-bold">Coupon codes</h2>
          <p className="text-[13px] text-muted-2">Create unlimited or scheduled discount codes. Click “View” to inspect user redemptions.</p>
        </div>
        <Btn variant="green" onClick={openNewCoupon}>
          <Icon.plus size={18} /> New coupon
        </Btn>
      </div>

      <Card className="overflow-hidden">
        {data.coupons.length === 0 && (
          <Empty
            icon={Icon.tag}
            text="No coupon codes yet"
            sub="Click “New coupon” to create a discount code with unlimited or scheduled validity."
          />
        )}

        {/* Mobile cards */}
        <ul className="flex flex-col divide-y divide-[#EEF0F5] md:hidden">
          {data.coupons.map((c) => {
            const st = getCouponStatus(c);
            const isUnlimited = !c.validFrom && !c.validUntil;

            return (
              <li key={c.code} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-dashed border-navy-700/40 bg-[#F3F5FA] px-2.5 py-1 font-mono text-[13px] font-bold text-navy-900">
                      {c.code}
                    </span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <b className="text-[15px] font-bold text-brand-dark">₹{c.off} off</b>
                </div>

                <div className="text-[12.5px] text-muted">
                  {c.note && <span className="block font-medium">{c.note}</span>}
                  {isUnlimited ? (
                    <span className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-700">
                      ∞ Unlimited (Never expires)
                    </span>
                  ) : (
                    <div className="mt-1 flex flex-col gap-0.5 text-[11.5px] text-muted-2 bg-[#F8F9FC] p-2 rounded-lg border border-line">
                      {c.validFrom && <span>Starts: <b>{fmtDateTime(c.validFrom)}</b></span>}
                      {c.validUntil && <span>Expires: <b>{fmtDateTime(c.validUntil)}</b></span>}
                    </div>
                  )}
                  <span className="mt-1 block text-[11.5px] text-muted-2 font-medium">Used {c.uses || 0} times</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#F0F2F6]">
                  <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <Toggle
                      checked={c.active}
                      onChange={(v) => update('coupons', c.code, { active: v }, `${c.code} ${v ? 'active' : 'paused'}`)}
                      label={`${c.code} active`}
                    />
                    {c.active ? 'Enabled' : 'Disabled'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* View Button */}
                    <button
                      onClick={() => setSearchParams({ coupon: c.code })}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy-700/25 bg-[#F3F5FA] px-2.5 py-1 text-xs font-bold text-navy-900 hover:bg-navy-900 hover:text-white transition"
                    >
                      <Icon.eye size={14} /> View
                    </button>
                    <button
                      onClick={() => openEditCoupon(c)}
                      aria-label={`Edit ${c.code}`}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#F3F5FA]"
                    >
                      <Icon.edit size={16} />
                    </button>
                    <button
                      onClick={() => remove('coupons', c.code, `${c.code} deleted`)}
                      aria-label={`Delete ${c.code}`}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#FDECEC] hover:text-[#B42318]"
                    >
                      <Icon.trash size={16} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-3 py-3 font-semibold">Discount</th>
                <th className="px-3 py-3 font-semibold">Validity Schedule</th>
                <th className="px-3 py-3 font-semibold">Campaign Note</th>
                <th className="px-3 py-3 font-semibold">Uses</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.coupons.map((c) => {
                const st = getCouponStatus(c);
                const isUnlimited = !c.validFrom && !c.validUntil;

                return (
                  <tr key={c.code} className="border-t border-[#EEF0F5] hover:bg-[#FAFBFD]">
                    <td className="px-5 py-3.5">
                      <span className="rounded-lg border border-dashed border-navy-700/40 bg-[#F3F5FA] px-2.5 py-1 font-mono text-[13px] font-bold text-navy-900">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-bold text-navy-900">₹{c.off} off</td>
                    <td className="px-3 py-3.5">
                      {isUnlimited ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                          ∞ Unlimited (No expiry)
                        </span>
                      ) : (
                        <div className="flex flex-col text-[12px] leading-tight text-muted">
                          {c.validFrom && (
                            <span>
                              <b className="font-semibold text-navy-900">From:</b> {fmtDateTime(c.validFrom)}
                            </span>
                          )}
                          {c.validUntil && (
                            <span>
                              <b className="font-semibold text-navy-900">Until:</b> {fmtDateTime(c.validUntil)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-muted max-w-[180px] truncate">{c.note || '—'}</td>
                    <td className="px-3 py-3.5">
                      <span className="font-bold text-navy-900">{c.uses || 0}</span> <span className="text-xs text-muted-2">times</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-2">
                        <Toggle
                          checked={c.active}
                          onChange={(v) => update('coupons', c.code, { active: v }, `${c.code} ${v ? 'active' : 'paused'}`)}
                          label={`${c.code} active`}
                        />
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        {/* View Usage Button */}
                        <button
                          onClick={() => setSearchParams({ coupon: c.code })}
                          className="inline-flex items-center gap-1 rounded-lg border border-navy-700/30 bg-[#F3F5FA] px-2.5 py-1 text-xs font-bold text-navy-900 hover:bg-navy-900 hover:text-white transition cursor-pointer shadow-2xs"
                          title="View customer redemptions & date-wise filters"
                        >
                          <Icon.eye size={14} /> View
                        </button>

                        <button
                          onClick={() => openEditCoupon(c)}
                          aria-label={`Edit ${c.code}`}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#F3F5FA] hover:text-navy-900 cursor-pointer"
                        >
                          <Icon.edit size={16} />
                        </button>
                        <button
                          onClick={() => remove('coupons', c.code, `${c.code} deleted`)}
                          aria-label={`Delete ${c.code}`}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#FDECEC] hover:text-[#B42318] cursor-pointer"
                        >
                          <Icon.trash size={16} />
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Drawer: Create / Edit Coupon with Unlimited or Scheduled Validity */}
      <Drawer
        open={!!form}
        onClose={() => setForm(null)}
        title={form && data.coupons.some((c) => c.code.toUpperCase() === (form.code || '').trim().toUpperCase()) ? 'Edit coupon' : 'New coupon'}
        footer={
          <>
            <Btn variant="green" onClick={saveCoupon}>
              Save coupon
            </Btn>
            <Btn variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Btn>
          </>
        }
      >
        {form && (
          <div className="flex flex-col gap-4">
            <Field
              label="Coupon code"
              hint="Customers enter this at checkout. Special characters allowed (e.g. SPECIAL@50, DRIFT#100, SUMMER_26, SAVE-NOW!)."
            >
              <input
                className={`${inputCls} font-mono font-bold tracking-wide`}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.trimStart() })}
                placeholder="e.g. SPECIAL@50"
                required
              />
            </Field>

            <Field label="Discount amount (₹)" hint="Flat rupee discount applied to customer's order.">
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.off}
                onChange={(e) => setForm({ ...form, off: e.target.value.replace(/\D/g, '') })}
                placeholder="100"
                required
              />
            </Field>

            <Field label="Campaign note / Description" hint="For internal identification (e.g. Flash Weekend Sale, Creator code).">
              <input
                className={inputCls}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Festival Flash Sale"
              />
            </Field>

            {/* Validity Mode Selection: Unlimited vs Scheduled */}
            <div className="rounded-2xl border border-line bg-[#F8F9FC] p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <b className="text-[13.5px] font-bold text-navy-900">Validity Type</b>
                <span className="text-[12px] text-muted-2">
                  Choose whether this coupon runs forever (unlimited) or only during an active schedule.
                </span>
              </div>

              {/* 2 Segment Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#EEF1F8] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setValidityMode('unlimited');
                    setForm({ ...form, validFrom: '', validUntil: '' });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    validityMode === 'unlimited'
                      ? 'bg-white text-navy-900 shadow-xs'
                      : 'text-muted-2 hover:text-navy-900'
                  }`}
                >
                  ∞ Unlimited (Never expires)
                </button>
                <button
                  type="button"
                  onClick={() => setValidityMode('scheduled')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    validityMode === 'scheduled'
                      ? 'bg-white text-navy-900 shadow-xs'
                      : 'text-muted-2 hover:text-navy-900'
                  }`}
                >
                  ⏱ Specific Date & Time
                </button>
              </div>

              {validityMode === 'unlimited' ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                  <b>✨ Unlimited Validity:</b> This coupon has no time or date expiration. It will remain active 24/7 indefinitely until you turn it off manually.
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-1">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Valid From (Start Date & Time)" hint="Leave blank to start immediately">
                      <input
                        type="datetime-local"
                        className={inputCls}
                        value={form.validFrom || ''}
                        onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                      />
                    </Field>

                    <Field label="Valid Until (Expiry Date & Time)" hint="Leave blank for no end time">
                      <input
                        type="datetime-local"
                        className={inputCls}
                        value={form.validUntil || ''}
                        onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const nextWeek = new Date(now.getTime() + 7 * 86400000);
                        setForm({
                          ...form,
                          validFrom: toLocalInput(now.toISOString()),
                          validUntil: toLocalInput(nextWeek.toISOString()),
                        });
                      }}
                      className="text-[11.5px] font-semibold text-navy-700 bg-white border border-line px-2.5 py-1 rounded-lg hover:bg-[#EEF1F8] cursor-pointer"
                    >
                      + 7 Days from now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const nextMonth = new Date(now.getTime() + 30 * 86400000);
                        setForm({
                          ...form,
                          validFrom: toLocalInput(now.toISOString()),
                          validUntil: toLocalInput(nextMonth.toISOString()),
                        });
                      }}
                      className="text-[11.5px] font-semibold text-navy-700 bg-white border border-line px-2.5 py-1 rounded-lg hover:bg-[#EEF1F8] cursor-pointer"
                    >
                      + 30 Days from now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
