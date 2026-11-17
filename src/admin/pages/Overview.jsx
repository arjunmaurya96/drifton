import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../store.jsx';
import { AreaChart, Badge, Card, Icon, PageHeader, ago, inr } from '../ui.jsx';
import { TOPIC_LABEL } from '../data.js';
import InvoiceModal from '../components/InvoiceModal.jsx';

const DAY = 86400000;

export default function Overview() {
  const { data, update, notify } = useAdmin();
  const [filterType, setFilterType] = useState('month'); // 'today' | 'week' | 'month' | 'year' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const navigate = useNavigate();

  // Filter orders based on selected timeframe
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return data.orders.filter((o) => {
      if (!o.date) return false;
      const t = new Date(o.date);
      if (isNaN(t.getTime())) return false;

      if (filterType === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return t >= todayStart;
      }
      if (filterType === 'week') {
        const weekStart = new Date(now.getTime() - 7 * DAY);
        return t >= weekStart;
      }
      if (filterType === 'month') {
        const monthStart = new Date(now.getTime() - 30 * DAY);
        return t >= monthStart;
      }
      if (filterType === 'year') {
        const yearStart = new Date(now.getTime() - 365 * DAY);
        return t >= yearStart;
      }
      if (filterType === 'custom') {
        const start = customStart ? new Date(customStart + 'T00:00:00') : new Date(0);
        const end = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
        return t >= start && t <= end;
      }
      return true; // 'all'
    });
  }, [data.orders, filterType, customStart, customEnd]);

  // Statistics calculation for the filtered range
  const s = useMemo(() => {
    const live = filteredOrders.filter((o) => o.status !== 'Cancelled');
    const sum = (arr) => arr.reduce((acc, o) => acc + (o.total || 0), 0);
    const revenue = sum(live);
    const orderCount = filteredOrders.length;
    const aov = live.length ? revenue / live.length : 0;

    // Units sold per product
    const units = {};
    live.forEach((o) => (o.items || []).forEach((it) => {
      units[it.id] = (units[it.id] || 0) + (it.qty || 1);
    }));

    // Status breakdown
    const statusCount = ['New', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => [
      st,
      filteredOrders.filter((o) => o.status === st).length,
    ]);

    // Graph points
    const daysCount = filterType === 'today' ? 1 : filterType === 'week' ? 7 : filterType === 'year' ? 12 : 30;
    const now = Date.now();
    const days = Array.from({ length: Math.min(daysCount, 30) }, (_, i) => {
      const d = new Date(now - (Math.min(daysCount, 30) - 1 - i) * (filterType === 'year' ? 30 * DAY : DAY));
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const daySales = live.filter((o) => {
        const od = new Date(o.date);
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
      }).reduce((acc, o) => acc + o.total, 0);
      return { label: key, v: daySales };
    });

    const pendingOrders = data.orders.filter((o) => ['New', 'Packed'].includes(o.status)).length;

    return {
      revenue,
      orderCount,
      aov,
      units,
      statusCount,
      days,
      pending: pendingOrders,
    };
  }, [filteredOrders, filterType, data.orders]);

  // Unprocessed / New incoming orders
  const newOrders = useMemo(() => {
    return data.orders.filter((o) => o.status === 'New');
  }, [data.orders]);

  const maxUnits = Math.max(...Object.values(s.units), 1);

  // Filter change with toast
  const handleFilterChange = (id, label) => {
    setFilterType(id);
    notify(`Filtered by ${label}`);
  };

  // Excel / CSV Export
  const handleExportExcel = () => {
    if (!filteredOrders.length) {
      notify('No orders found to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date & Time',
      'Customer Name',
      'Mobile Phone',
      'Email Address',
      'Delivery Address',
      'Pincode',
      'Items Ordered',
      'Total Sticks',
      'Subtotal (INR)',
      'Delivery (INR)',
      'Coupon Code',
      'Discount (INR)',
      'COD Fee (INR)',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Tracking Number'
    ];

    const rows = filteredOrders.map((o) => [
      o.id || '',
      o.date ? new Date(o.date).toLocaleString('en-IN') : '',
      o.customer || '',
      o.phone || '',
      o.email || '',
      (o.address || '').replace(/[\r\n]+/g, ' '),
      o.pin || '',
      (o.items || []).map((i) => `${i.name} (Qty: ${i.qty})`).join('; '),
      o.sticks || 0,
      o.subtotal || o.total || 0,
      o.delivery || 0,
      o.coupon || 'None',
      o.couponOff || 0,
      o.codFee || 0,
      o.total || 0,
      o.payment || '',
      o.paymentStatus || '',
      o.status || '',
      o.tracking || ''
    ]);

    // UTF-8 BOM (\uFEFF) ensures clean rendering in Microsoft Excel
    const csvContent = '\uFEFF' + [headers, ...rows]
      .map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `drifton-sales-${filterType}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify(`Exported ${filteredOrders.length} orders to Excel (.csv) successfully!`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    notify(`Searching for "${searchVal.trim()}"`);
    navigate(`/admin/customers?q=${encodeURIComponent(searchVal.trim())}`);
  };

  const filterButtons = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
    { id: 'year', label: 'Last 12 Months' },
    { id: 'all', label: 'All Time' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header & Export to Excel */}
      <PageHeader
        title="Dashboard Overview"
        sub="Real-time sales analytics, customer orders, and performance metrics."
      >
        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0F1A3C] px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#1E2D56] active:scale-95"
        >
          <Icon.download size={16} /> Export to Excel (.csv)
        </button>
      </PageHeader>

      {/* Modern Filter Segment Control */}
      <Card className="p-4 sm:p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[13px] font-semibold text-slate-700">Filter Analytics Period</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleFilterChange(btn.id, btn.label)}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                  filterType === btn.id
                    ? 'bg-white text-navy-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-white/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Picker */}
        {filterType === 'custom' && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              From:
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  notify('Start date set');
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-navy-700"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              To:
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  notify('End date set');
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-navy-700"
              />
            </label>
            <span className="text-xs text-slate-500 ml-auto">
              Found <b>{filteredOrders.length}</b> orders in selected period
            </span>
          </div>
        )}
      </Card>

      {/* 🚨 High-Priority New Orders Notification Section */}
      {newOrders.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm font-bold text-sm">
                !
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold text-amber-950">
                    New Orders Awaiting Fulfillment
                  </h2>
                  <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[11px] font-bold text-white tracking-wide">
                    {newOrders.length} NEW
                  </span>
                </div>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Pack and dispatch incoming customer orders promptly.
                </p>
              </div>
            </div>

            <Link
              to="/admin/orders?tab=New"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-sm hover:bg-amber-100/50 transition"
            >
              Manage All New Orders ({newOrders.length}) →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {newOrders.slice(0, 6).map((o) => (
              <div
                key={o.id}
                className="flex flex-col justify-between rounded-xl border border-amber-200 bg-white p-4 shadow-sm hover:border-amber-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-head text-[14px] font-bold text-navy-900">#{o.id}</span>
                    <span className="text-[11.5px] font-medium text-slate-500">{ago(o.date)}</span>
                  </div>

                  <div className="mt-2.5">
                    <b className="block text-[14px] text-slate-900">{o.customer}</b>
                    <span className="block text-xs text-slate-500">{o.phone} {o.city ? `· ${o.city}` : ''}</span>
                    <p className="mt-1 text-xs text-slate-600 truncate">
                      {(o.items || []).map((it) => `${it.name} (×${it.qty})`).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">{o.payment || 'Prepaid'}</span>
                    <b className="font-head text-[15px] font-bold text-emerald-700">{inr(o.total)}</b>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          update('orders', o.id, { status: 'Packed' }, `Order #${o.id} marked as Packed!`);
                        }}
                        className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700 transition"
                      >
                        Mark as Packed
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(o)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-slate-50 transition"
                        title="Print Tax Invoice"
                      >
                        <Icon.print size={12} /> Invoice
                      </button>
                    </div>
                    <Link
                      to={`/admin/customers?q=${encodeURIComponent(o.phone || o.customer)}`}
                      className="text-xs font-semibold text-navy-700 hover:text-brand underline"
                    >
                      Customer Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Card className="p-4 sm:p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-slate-500">
              Revenue ({filterButtons.find((b) => b.id === filterType)?.label})
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon.rupee size={18} />
            </span>
          </div>
          <b className="mt-2 block font-head text-[24px] font-bold text-slate-900 sm:text-[28px]">
            {inr(s.revenue)}
          </b>
          <span className="text-[12px] text-slate-500">Total earnings in period</span>
        </Card>

        <Card className="p-4 sm:p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-slate-500">Orders Processed</span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Icon.orders size={18} />
            </span>
          </div>
          <b className="mt-2 block font-head text-[24px] font-bold text-slate-900 sm:text-[28px]">
            {s.orderCount}
          </b>
          <span className="text-[12px] text-slate-500">Customer orders placed</span>
        </Card>

        <Card className="p-4 sm:p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-slate-500">Avg. Order Value</span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Icon.trend size={18} />
            </span>
          </div>
          <b className="mt-2 block font-head text-[24px] font-bold text-slate-900 sm:text-[28px]">
            {inr(s.aov)}
          </b>
          <span className="text-[12px] text-slate-500">Average ticket size</span>
        </Card>

        <Card className="p-4 sm:p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-slate-500">Pending Shipment</span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Icon.truck size={18} />
            </span>
          </div>
          <b className="mt-2 block font-head text-[24px] font-bold text-amber-700 sm:text-[28px]">
            {s.pending}
          </b>
          <span className="text-[12px] text-slate-500">Ready to pack or ship</span>
        </Card>
      </div>

      {/* Quick Customer Search Bar */}
      <Card className="p-4 shadow-sm border border-slate-200 bg-slate-900 text-white">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-bold">Instant Customer & Order Lookup</h3>
            <p className="text-xs text-slate-400">Search any buyer by name, phone number, email, or order ID:</p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="e.g. 9876543210, Rahul, #JSR..."
              className="min-h-10 w-full sm:w-[280px] rounded-xl bg-slate-800 border border-slate-700 px-3.5 text-xs text-white placeholder-slate-400 outline-none focus:border-white/60 focus:bg-slate-900"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
            >
              Search
            </button>
          </div>
        </form>
      </Card>

      {/* Revenue Graph & Best Sellers (Click to open live Product Page) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="p-5 shadow-sm border border-slate-200">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Revenue Performance</h2>
              <p className="text-xs text-slate-500">Sales curve for the selected period</p>
            </div>
            <b className="text-[18px] font-bold text-emerald-700">{inr(s.revenue)}</b>
          </div>
          <AreaChart points={s.days} />
        </Card>

        {/* Product Card with Click to Home Page Product */}
        <Card className="p-5 shadow-sm border border-slate-200">
          <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Products & Best Sellers</h2>
              <p className="text-xs text-slate-500">Click any product to view live on Home Page</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Units Sold</span>
          </div>

          <ul className="flex flex-col gap-3">
            {data.products.map((p) => (
              <li key={p.id}>
                <a
                  href={`/#${p.id}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => notify(`Opening Home Page for ${p.name}`)}
                  title={`Click to view ${p.name} on Home Page`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200/80 p-2.5 transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                >
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg p-1 transition group-hover:scale-105"
                    style={{ background: p.bg }}
                  >
                    <img src={p.image} alt="" className="h-full w-auto object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-1 truncate font-semibold text-slate-900 group-hover:text-navy-900">
                        {p.name} <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition">↗</span>
                      </span>
                      <b className="font-bold text-slate-900 shrink-0">{s.units[p.id] || 0} sold</b>
                    </div>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <i
                        className="block h-full rounded-full transition-all duration-500"
                        style={{ width: `${((s.units[p.id] || 0) / maxUnits) * 100}%`, background: p.accent }}
                      />
                    </span>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{inr(p.price)} per roll on</span>
                      <span className="text-brand font-semibold group-hover:underline">View on Home Page →</span>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Orders Table & Pipeline */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden shadow-sm border border-slate-200">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                Filtered Orders ({filteredOrders.length})
              </h2>
              <p className="text-xs text-slate-500">All customer orders matching current filter</p>
            </div>
            <Link
              to="/admin/customers"
              className="text-xs font-semibold text-navy-700 hover:text-brand"
            >
              View Full Customer Database →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-[13.5px]">
              <thead className="bg-slate-50 text-[11.5px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <b className="font-semibold text-slate-900">#{o.id}</b>
                      <span className="block text-[11px] text-slate-400">{ago(o.date)}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <b className="block text-[13.5px] text-slate-900">{o.customer}</b>
                      <span className="block text-xs text-slate-500">{o.phone} {o.city ? `· ${o.city}` : ''}</span>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-600">
                      {o.sticks} roll-on{o.sticks !== 1 ? 's' : ''}
                    </td>
                    <td className="px-3 py-3.5">
                      <b className="block font-bold text-slate-900">{inr(o.total)}</b>
                      <span className="block text-[11px] text-slate-400">{o.payment || 'Prepaid'}</span>
                    </td>
                    <td className="px-3 py-3.5"><Badge>{o.status}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/customers?q=${encodeURIComponent(o.phone || o.customer)}`}
                        onClick={() => notify(`Opening profile for ${o.customer}`)}
                        className="text-xs font-semibold text-navy-700 hover:underline"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Status Distribution */}
        <div className="flex flex-col gap-4">
          <Card className="p-5 shadow-sm border border-slate-200">
            <h2 className="text-[15px] font-bold text-slate-900">Order Status Pipeline</h2>
            <p className="text-xs text-slate-500 mb-3.5">Distribution across fulfillment stages</p>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
              {s.statusCount.map(([st, n], i) => (
                <i
                  key={st}
                  style={{
                    width: `${filteredOrders.length ? (n / filteredOrders.length) * 100 : 0}%`,
                    background: ['#3B5BDB', '#F59F00', '#7950F2', '#1F9254', '#E5484D'][i],
                  }}
                />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {s.statusCount.map(([st, n], i) => (
                <li key={st} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: ['#3B5BDB', '#F59F00', '#7950F2', '#1F9254', '#E5484D'][i] }}
                  />
                  <span className="font-medium text-slate-700">{st}</span>
                  <b className="ml-auto font-bold text-slate-900">{n}</b>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-[15px] font-bold text-slate-900">Customer Inquiries</h2>
              <Link to="/admin/enquiries" className="text-xs font-semibold text-navy-700 hover:underline">
                View All →
              </Link>
            </div>
            <ul className="mt-3 flex flex-col divide-y divide-slate-100">
              {data.enquiries.filter((e) => e.status === 'New').slice(0, 3).map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {e.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-xs text-slate-900">{e.name}</b>
                    <span className="text-[11px] text-slate-400">{TOPIC_LABEL[e.topic]} · {ago(e.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Professional Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        settings={data.settings}
        products={data.products}
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
}
