// =====================================================================
//  Packing slip / invoice — opens a print window for one or many orders.
//  Business details (name, address, GST, phone) come from Admin → Settings.
// =====================================================================
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
const date = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

function one(o, st) {
  const rows = (o.items || []).map((i, n) => `<tr><td>${n + 1}</td><td>${esc(i.name)}</td><td class="r">${esc(i.qty)}</td></tr>`).join('');
  const line = (label, v, strong) => `<tr${strong ? ' class="tot"' : ''}><td>${label}</td><td class="r">${v}</td></tr>`;
  return `
  <section class="page">
    <header>
      <div>
        <img src="${location.origin}/assets/images/logo-drifton.webp" alt="DriftOn" class="logo" />
        <p class="muted">${esc(st.legalName || '')}<br/>${esc(st.address || '')}<br/>${st.gst ? `GSTIN: <b>${esc(st.gst)}</b><br/>` : ''}${[st.phone, st.email].filter(Boolean).map(esc).join(' · ')}</p>
      </div>
      <div class="r">
        <h1>Invoice</h1>
        <p><b>${esc(o.id)}</b><br/>${date(o.date)}<br/>Payment: ${esc(o.payment || '')}${o.paymentStatus ? ` (${esc(o.paymentStatus)})` : ''}</p>
      </div>
    </header>
    <div class="box">
      <span class="label">Ship to</span>
      <b>${esc(o.customer)}</b><br/>${esc(o.address || '')}${o.pin ? ` — ${esc(o.pin)}` : ''}<br/>Mobile: ${esc(o.phone || '')}${o.email ? ` · ${esc(o.email)}` : ''}
    </div>
    <table class="items"><thead><tr><th>#</th><th>Item</th><th class="r">Qty</th></tr></thead><tbody>${rows}</tbody></table>
    <table class="sum">
      ${line(`Items (${o.sticks || ''} roll on${o.sticks === 1 ? '' : 's'}, offers applied)`, money(o.subtotal ?? o.total))}
      ${line('Delivery', o.delivery ? money(o.delivery) : 'Free')}
      ${o.couponOff > 0 ? line(`Coupon ${esc(o.coupon || '')}`, '− ' + money(o.couponOff)) : ''}
      ${o.codFee > 0 ? line('COD fee', money(o.codFee)) : ''}
      ${line('Total (incl. of all taxes)', money(o.total), true)}
    </table>
    ${o.tracking ? `<p class="muted">Ekart tracking: <b>${esc(o.tracking)}</b></p>` : ''}
    <p class="thanks">Thank you for shopping with DriftOn™</p>
  </section>`;
}

export function printInvoices(orders, settings = {}) {
  const list = (Array.isArray(orders) ? orders : [orders]).filter(Boolean);
  if (!list.length) return false;
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) return false; // pop-up blocked
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(list.length === 1 ? list[0].id : `${list.length} orders`)}</title>
  <style>
    *{box-sizing:border-box} body{margin:0;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0F1A3C}
    .page{max-width:760px;margin:0 auto;padding:36px 32px;page-break-after:always} .page:last-child{page-break-after:auto}
    header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #0F1A3C;padding-bottom:16px}
    .logo{height:34px} h1{margin:0 0 6px;font-size:22px} .r{text-align:right} .muted{color:#5A6478;font-size:12.5px;margin:8px 0 0}
    .box{margin:18px 0;padding:12px 14px;border:1px solid #E0E4EE;border-radius:10px} .label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8A93AB;margin-bottom:4px}
    table{width:100%;border-collapse:collapse} .items th{background:#F3F5FA;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.06em;padding:8px 10px} .items td{padding:9px 10px;border-bottom:1px solid #EEF0F5}
    .sum{margin:14px 0 0 auto;max-width:360px} .sum td{padding:5px 10px} .sum .tot td{border-top:2px solid #0F1A3C;font-weight:700;font-size:16px;padding-top:9px}
    .thanks{margin-top:28px;text-align:center;color:#5A6478}
    @media print{.page{padding:18px 8px}}
  </style></head><body>${list.map((o) => one(o, settings)).join('')}
  <script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`);
  w.document.close();
  return true;
}
