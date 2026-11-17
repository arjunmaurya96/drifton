import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { products, formatINR } from '../data/products.js';
import { business } from '../data/site.js';
import { CheckCircle, Truck, Shield } from '../components/Icons.jsx';
import InvoiceModal from '../admin/components/InvoiceModal.jsx';

export default function Profile() {
  const { user, userProfile, userOrders, updateUserProfile, logout, openAuth, authLoading } = useStore();
  const navigate = useNavigate();

  // Profile Edit State
  const [editingAddress, setEditingAddress] = useState(false);
  const [fullName, setFullName] = useState(userProfile.name || user?.displayName || '');
  const [phone, setPhone] = useState(userProfile.phone || user?.phoneNumber || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [pin, setPin] = useState(userProfile.pin || '');
  const [city, setCity] = useState(userProfile.city || '');
  const [saving, setSaving] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Active tab: 'orders' | 'address'
  const [tab, setTab] = useState('orders');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile({
      name: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pin: pin.trim(),
      city: city.trim(),
    });
    setSaving(false);
    setEditingAddress(false);
  };

  const steps = ['New', 'Packed', 'Shipped', 'Delivered'];

  if (authLoading) {
    return (
      <div className="container-x py-28 text-center text-muted">
        <span className="inline-block size-8 animate-spin rounded-full border-4 border-line border-t-navy-900" />
        <p className="mt-3 text-sm">Loading your account details…</p>
      </div>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <div className="container-x py-24 sm:py-32">
        <div className="mx-auto max-w-[500px] rounded-3xl border border-line bg-white p-8 sm:p-10 text-center shadow-sm">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-soft text-navy-900 font-head text-2xl font-bold">
            👤
          </span>
          <h1 className="mt-4 font-head text-[26px] font-bold text-navy-900">Sign in to DriftOn</h1>
          <p className="mt-2 text-[14.5px] text-muted-2 leading-relaxed">
            Please log in or create an account to view your live orders, tracking details, and saved delivery address.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => openAuth('login')}
              className="btn-primary min-h-[48px] w-full text-base"
            >
              Log In to Account
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="btn-line min-h-[48px] w-full text-base"
            >
              Create New Account
            </button>
          </div>

          <Link to="/#shop" className="mt-6 inline-block text-xs font-semibold text-navy-700 hover:underline">
            ← Continue shopping on home page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] py-10 sm:py-14">
      <div className="container-x max-w-[1100px]">
        
        {/* Top Header & Breadcrumb */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-2 mb-1">
              <Link to="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span className="text-navy-900">My Account</span>
            </div>
            <h1 className="font-head text-[28px] sm:text-[32px] font-bold text-navy-900 leading-tight">
              Welcome back, {user.displayName || userProfile.name || 'Friend'}!
            </h1>
            <p className="text-[14px] text-muted-2">Manage your orders, live shipments, and delivery addresses.</p>
          </div>

          <button
            onClick={logout}
            className="self-start sm:self-auto rounded-xl border border-line-strong bg-white px-4 py-2 text-[13.5px] font-semibold text-navy-900 hover:bg-red-50 hover:text-red-700 transition"
          >
            Log Out
          </button>
        </div>

        {/* User Card & Tab Bar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          
          {/* Left Column: Profile Card */}
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3.5 pb-5 border-b border-line">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="size-14 rounded-2xl object-cover ring-2 ring-line" />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-navy-900 font-head text-xl font-bold text-white">
                    {(user.displayName || userProfile.name || user.email || 'U')[0].toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[16px] text-navy-900">
                    {userProfile.name || user.displayName || 'Customer'}
                  </b>
                  <span className="block truncate text-[12.5px] text-muted-2">{user.email}</span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-mint-soft px-2 py-0.5 text-[10.5px] font-bold text-brand-dark">
                    Verified Customer
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="mt-4 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setTab('orders')}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition ${
                    tab === 'orders' ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-[#F3F5FA]'
                  }`}
                >
                  <span>📦 My Orders</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${tab === 'orders' ? 'bg-white/20' : 'bg-[#E6E9F2]'}`}>
                    {userOrders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('address')}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition ${
                    tab === 'address' ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-[#F3F5FA]'
                  }`}
                >
                  <span>📍 Saved Address</span>
                  <span className="text-xs text-muted-2">
                    {userProfile.address ? 'Active' : 'Add'}
                  </span>
                </button>
              </div>

              {/* Support info */}
              <div className="mt-6 rounded-2xl bg-page p-3.5 text-xs text-muted leading-relaxed">
                <b className="text-navy-900 block mb-1">Need help with an order?</b>
                Reach us directly at <a href="mailto:infodrifton@gmail.com" className="font-semibold text-brand hover:underline">infodrifton@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="flex flex-col gap-5">
            
            {/* TAB 1: MY ORDERS */}
            {tab === 'orders' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-head text-[20px] font-bold text-navy-900">
                    Order History ({userOrders.length})
                  </h2>
                  <Link to="/#shop" className="text-xs font-bold text-brand hover:underline">
                    + Shop New Variants
                  </Link>
                </div>

                {userOrders.length === 0 ? (
                  <div className="rounded-3xl border border-line bg-white p-10 text-center shadow-sm">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-page text-2xl">
                      🛍️
                    </span>
                    <h3 className="mt-3 font-head text-[18px] font-bold text-navy-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-muted-2 max-w-[340px] mx-auto">
                      You haven’t placed any orders with DriftOn yet. Experience 24h natural freshness today!
                    </p>
                    <Link to="/#shop" className="btn-primary mt-5 inline-flex">
                      Browse Deodorant Sticks
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {userOrders.map((o) => {
                      const orderStatus = o.status || 'New';
                      const isDelivered = orderStatus === 'Delivered';
                      const isShipped = orderStatus === 'Shipped';
                      const orderDate = o.date || o.createdAt;
                      const formattedDate = orderDate
                        ? new Date(orderDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent';

                      return (
                        <div key={o.id} className="rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-sm transition hover:border-slate-300">
                          
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <b className="font-head text-[17px] font-bold text-navy-900">Order #{o.id}</b>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  isDelivered ? 'bg-[#E5F5EC] text-[#17703D]' : isShipped ? 'bg-[#EFE9FF] text-[#5B3FA8]' : 'bg-[#EAF0FF] text-[#2647B8]'
                                }`}>
                                  {orderStatus}
                                </span>
                              </div>
                              <span className="text-xs text-muted-2">Placed on {formattedDate}</span>
                            </div>

                            {/* Actions: Invoice & Ekart Track */}
                            <div className="flex items-center gap-2">
                              {o.tracking && (
                                <a
                                  href={`https://www.ekartlogistics.com/shipmenttrack/${encodeURIComponent(o.tracking)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-white px-3 py-1.5 text-xs font-bold text-navy-900 hover:bg-[#F3F5FA]"
                                >
                                  <Truck size={14} /> Track ({o.tracking})
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => setInvoiceOrder(o)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-navy-700 shadow-sm"
                              >
                                View Invoice
                              </button>
                            </div>
                          </div>

                          {/* 4-Step Visual Progress Bar */}
                          <div className="my-5 px-2">
                            <ol className="flex items-center">
                              {steps.map((st, i) => {
                                const activeIndex = steps.indexOf(orderStatus);
                                const isDone = activeIndex >= i;
                                return (
                                  <li key={st} className="flex flex-1 flex-col items-center gap-1 text-center text-[11px] font-semibold">
                                    <div className="flex w-full items-center">
                                      <i className={`h-1 flex-1 ${i === 0 ? 'opacity-0' : isDone ? 'bg-brand' : 'bg-line'}`} />
                                      <span className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                                        isDone ? 'bg-brand text-white' : 'bg-[#EEF0F5] text-muted-2'
                                      }`}>
                                        {isDone ? '✓' : i + 1}
                                      </span>
                                      <i className={`h-1 flex-1 ${i === steps.length - 1 ? 'opacity-0' : activeIndex > i ? 'bg-brand' : 'bg-line'}`} />
                                    </div>
                                    <span className={isDone ? 'text-navy-900 font-bold' : 'text-muted-2'}>{st}</span>
                                  </li>
                                );
                              })}
                            </ol>
                          </div>

                          {/* Items List */}
                          <div className="rounded-2xl bg-page p-3.5">
                            <ul className="flex flex-col divide-y divide-line/60">
                              {(o.items || []).map((it, idx) => {
                                const p = products.find((x) => x.id === it.id);
                                return (
                                  <li key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-line">
                                        <img src={p?.image || '/assets/images/cutouts/crystal.webp'} alt="" className="h-full w-auto object-contain" />
                                      </span>
                                      <div>
                                        <b className="block text-[13.5px] text-navy-900 font-semibold">{it.name}</b>
                                        <span className="text-[11.5px] text-muted-2">Qty: {it.qty} {it.qty === 1 ? 'roll on' : 'roll ons'}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs font-bold text-navy-900">× {it.qty}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Summary Bottom Strip */}
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1 text-[13px]">
                            <div className="text-xs text-muted-2">
                              <span>Shipping to: <b>{o.address || userProfile.address}</b>{o.pin ? ` (PIN: ${o.pin})` : ''}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-2">
                                Payment: <b className="text-navy-900">{o.payment || 'Prepaid'}</b> ({o.paymentStatus || 'Paid'})
                              </span>
                              <b className="font-head text-[16px] text-navy-900">{formatINR(o.total)}</b>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAVED ADDRESS */}
            {tab === 'address' && (
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <h2 className="font-head text-[20px] font-bold text-navy-900">Saved Delivery Address</h2>
                    <p className="text-xs text-muted-2">This address is used for 1-click checkout and invoice generation.</p>
                  </div>
                  {!editingAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        setFullName(userProfile.name || user.displayName || '');
                        setPhone(userProfile.phone || '');
                        setAddress(userProfile.address || '');
                        setPin(userProfile.pin || '');
                        setCity(userProfile.city || '');
                        setEditingAddress(true);
                      }}
                      className="rounded-xl border border-line-strong bg-white px-3.5 py-1.5 text-xs font-bold text-navy-900 hover:bg-[#F3F5FA]"
                    >
                      Edit Address
                    </button>
                  )}
                </div>

                {editingAddress ? (
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-1 text-xs font-bold text-navy-900">
                        Full Name
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Name"
                          className="min-h-11 rounded-xl border border-line-strong px-3.5 text-sm outline-none focus:border-navy-700"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-navy-900">
                        10-Digit Mobile Number
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="min-h-11 rounded-xl border border-line-strong px-3.5 text-sm outline-none focus:border-navy-700"
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1 text-xs font-bold text-navy-900">
                      Complete Street Address (House No., Building, Area)
                      <textarea
                        rows={3}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Flat no, Street address, Landmark..."
                        className="rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-navy-700"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-1 text-xs font-bold text-navy-900">
                        6-Digit Pincode
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 110008"
                          className="min-h-11 rounded-xl border border-line-strong px-3.5 text-sm outline-none focus:border-navy-700"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-navy-900">
                        City / State
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. New Delhi, Delhi"
                          className="min-h-11 rounded-xl border border-line-strong px-3.5 text-sm outline-none focus:border-navy-700"
                        />
                      </label>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary min-h-11 rounded-xl px-6 text-sm font-semibold"
                      >
                        {saving ? 'Saving…' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAddress(false)}
                        className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-muted-2 hover:bg-page"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : userProfile.address ? (
                  <div className="rounded-2xl bg-page p-5">
                    <b className="block text-[15px] font-bold text-navy-900 mb-1">{userProfile.name || user.displayName}</b>
                    <p className="text-sm text-muted leading-relaxed">{userProfile.address}</p>
                    <p className="mt-1 text-sm font-semibold text-navy-900">
                      PIN: {userProfile.pin} {userProfile.city ? `· ${userProfile.city}` : ''}
                    </p>
                    <p className="mt-2 text-xs text-muted-2">Phone: +91 {userProfile.phone || user.phoneNumber || 'Not added'}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-page p-6 text-center text-sm text-muted">
                    No shipping address saved yet. Click <b>"Edit Address"</b> to add your home or work delivery address.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        settings={{ storeName: 'DriftOn™', legalName: 'AI Enterprises' }}
        products={products}
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
}
