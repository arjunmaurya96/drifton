import { useEffect } from 'react';
import { Icon, inr } from '../ui.jsx';

// Convert number to Indian currency words
export function numberToWordsINR(amount) {
  if (!amount || isNaN(amount)) return 'Zero Rupees Only';
  const val = Math.round(Number(amount));
  if (val === 0) return 'Zero Rupees Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n) => {
    if (n < 20) return single[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + single[n % 10] : '');
  };

  const convertThreeDigits = (n) => {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (h && rest) return single[h] + ' Hundred and ' + convertTwoDigits(rest);
    if (h) return single[h] + ' Hundred';
    return convertTwoDigits(rest);
  };

  let num = val;
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundreds = num;

  const parts = [];
  if (crore) parts.push(convertTwoDigits(crore) + ' Crore');
  if (lakh) parts.push(convertTwoDigits(lakh) + ' Lakh');
  if (thousand) parts.push(convertTwoDigits(thousand) + ' Thousand');
  if (hundreds) parts.push(convertThreeDigits(hundreds));

  return parts.join(' ') + ' Rupees Only';
}

export default function InvoiceModal({ order, settings = {}, products = [], open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open || !order) return null;

  // Defaults fallback
  const storeName = settings.storeName || 'DriftOn™';
  const legalName = settings.legalName || 'AI Enterprises';
  const gstNumber = settings.gst || '07ACIFA5199E1Z8';
  const businessAddress = settings.address || 'Balraj Khanna Marg, Block O, West Patel Nagar, Patel Nagar, New Delhi, Delhi, 110008';
  const businessEmail = settings.email || 'infodrifton@gmail.com';

  const orderDate = order.date ? new Date(order.date) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const invoiceNumber = `INV-${order.id}`;
  const isDelhi = (order.pin && order.pin.toString().startsWith('11')) || (order.city && order.city.toLowerCase().includes('delhi'));

  // GST Calculation (18% inclusive)
  const totalAmount = Number(order.total) || 0;
  const subtotalAmount = Number(order.subtotal) || totalAmount;
  const discountAmount = Number(order.couponOff) || 0;
  const codFee = Number(order.codFee) || 0;
  const deliveryFee = Number(order.delivery) || 0;

  const netTaxable = Math.round((totalAmount / 1.18) * 100) / 100;
  const totalTax = Math.round((totalAmount - netTaxable) * 100) / 100;
  const cgst = isDelhi ? Math.round((totalTax / 2) * 100) / 100 : 0;
  const sgst = isDelhi ? Math.round((totalTax / 2) * 100) / 100 : 0;
  const igst = !isDelhi ? totalTax : 0;

  const itemsList = (order.items && order.items.length > 0 ? order.items : [
    { id: 'natural', name: 'DriftOn Natural Crystal Roll-On', qty: order.sticks || 1 }
  ]);

  // Dedicated iframe print: sets font to Poppins, 0px top margin and perfect 1-page A4
  const handlePrint = () => {
    let frame = document.getElementById('drifton-print-frame');
    if (frame) frame.remove();

    frame = document.createElement('iframe');
    frame.id = 'drifton-print-frame';
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = 'none';
    frame.style.opacity = '0';
    document.body.appendChild(frame);

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice-${order.id}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 7mm 9mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              color: #0F1A3C;
              background: #ffffff;
              font-size: 11.5px;
              line-height: 1.4;
              padding: 0;
              margin: 0;
            }
            .invoice-wrap {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              background: #fff;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0F1A3C;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .logo-img {
              height: 38px;
              width: auto;
              display: block;
              margin-bottom: 3px;
            }
            .tagline {
              font-size: 11px;
              color: #4A5578;
              margin-top: 2px;
              font-weight: 400;
            }
            .inv-badge-wrap {
              text-align: right;
            }
            .inv-badge {
              display: inline-block;
              background: #0F1A3C;
              color: #fff;
              font-weight: 700;
              font-size: 11.5px;
              letter-spacing: 0.8px;
              padding: 4px 11px;
              border-radius: 6px;
              text-transform: uppercase;
            }
            .inv-meta {
              margin-top: 6px;
              font-size: 11.5px;
              color: #5A6382;
              line-height: 1.35;
              font-weight: 500;
            }
            .inv-meta b {
              color: #0F1A3C;
              font-weight: 700;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              background: #F8F9FC;
              border: 1px solid #E2E8F0;
              border-radius: 9px;
              padding: 9px 13px;
              margin-bottom: 9px;
            }
            .block-title {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #5A6382;
              margin-bottom: 3px;
            }
            .party-name {
              font-size: 13.5px;
              font-weight: 700;
              color: #0F1A3C;
              margin-bottom: 2px;
            }
            .party-text {
              font-size: 11.5px;
              color: #4A5578;
              line-height: 1.35;
              font-weight: 500;
            }
            .strip {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #fff;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 6px 12px;
              font-size: 11px;
              font-weight: 500;
              margin-bottom: 9px;
            }
            .table-wrap {
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 9px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
            }
            th {
              background: #0F1A3C;
              color: #ffffff;
              padding: 6.5px 10px;
              font-weight: 700;
              font-size: 10.5px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              text-align: left;
            }
            td {
              padding: 7px 10px;
              border-bottom: 1px solid #EEF0F5;
              color: #0F1A3C;
              font-weight: 500;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .calc-grid {
              display: grid;
              grid-template-columns: 1.15fr 1fr;
              gap: 11px;
              margin-bottom: 9px;
            }
            .words-box {
              background: #F8F9FC;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 8px 12px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              font-size: 11px;
            }
            .gst-box {
              background: #fff;
              border: 1px solid #E2E8F0;
              border-radius: 6px;
              padding: 6px 9px;
              margin-top: 5px;
              font-size: 10.5px;
              font-weight: 500;
            }
            .gst-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              color: #4A5578;
            }
            .summary-box {
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 8px 12px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              font-size: 11.5px;
              font-weight: 500;
            }
            .sum-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3.5px;
              color: #4A5578;
            }
            .grand-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #0F1A3C;
              color: #fff;
              border-radius: 6px;
              padding: 7px 12px;
              margin-top: 5px;
            }
            .grand-val {
              font-size: 17px;
              font-weight: 800;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px solid #E2E8F0;
              padding-top: 8px;
              font-size: 10px;
              color: #5A6382;
              font-weight: 500;
            }
            .sign-stamp {
              border: 1px dashed #A0AEC0;
              background: #F8F9FC;
              border-radius: 6px;
              padding: 4px 14px;
              text-align: center;
              font-weight: 700;
              color: #0F1A3C;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrap">
            <!-- Header -->
            <div class="header-row">
              <div>
                <img src="/assets/images/logo-drifton.webp" class="logo-img" alt="DriftOn" onerror="this.style.display='none'" />
                <div style="font-size: 12.5px; font-weight: 700; color: #0F1A3C;">Natural Crystal Deodorants</div>
                <div class="tagline">Pure Mineral Odor Protection · 100% Potassium Alum · Chemical & Aluminum Free</div>
              </div>
              <div class="inv-badge-wrap">
                <span class="inv-badge">TAX INVOICE</span>
                <div style="font-size: 9.5px; color: #5A6382; margin-top: 2.5px; text-transform: uppercase; font-weight: 600;">Original For Recipient</div>
                <div class="inv-meta">
                  <div>Invoice No: <b>${invoiceNumber}</b></div>
                  <div>Date: <b>${formattedDate}</b> at ${formattedTime}</div>
                  <div>Order Ref: <b>#${order.id}</b></div>
                </div>
              </div>
            </div>

            <!-- Party Details -->
            <div class="grid-2">
              <div>
                <div class="block-title">Sold By / Dispatched From:</div>
                <div class="party-name">${legalName}</div>
                <div class="party-text">Brand: <b>${storeName}</b></div>
                <div class="party-text">${businessAddress}</div>
                <div class="party-text" style="margin-top: 2.5px;">GSTIN: <b style="color: #0F1A3C;">${gstNumber}</b> · Delhi (Code: 07)</div>
                <div class="party-text">Email: ${businessEmail}</div>
              </div>
              <div style="border-left: 1px solid #E2E8F0; padding-left: 12px;">
                <div class="block-title">Billed To & Shipped To:</div>
                <div class="party-name">${order.customer || 'Customer'}</div>
                <div class="party-text">${order.address || 'Address on file'}${order.pin ? ', PIN: ' + order.pin : ''}</div>
                <div class="party-text" style="margin-top: 2.5px;">Phone: <b style="color: #0F1A3C;">+91 ${order.phone}</b></div>
                ${order.email ? `<div class="party-text">Email: ${order.email}</div>` : ''}
                <div class="party-text">Place of Supply: <b>${order.city || 'Delhi, India'}</b></div>
              </div>
            </div>

            <!-- Shipping Strip -->
            <div class="strip">
              <div>Courier: <b style="color: #0F1A3C;">Ekart Logistics Express</b></div>
              <div>AWB Tracking: <b style="color: #0F1A3C;">${order.tracking || 'EK' + String(order.id).padStart(8, '0')}</b></div>
              <div>Payment: <b style="color: ${order.payment === 'Cash on Delivery' ? '#D97706' : '#16A34A'};">${order.payment || 'Prepaid'}</b></div>
            </div>

            <!-- Items Table -->
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style="width: 32px; text-align: center;">#</th>
                    <th>Description of Goods</th>
                    <th style="text-align: center; width: 85px;">HSN</th>
                    <th style="text-align: center; width: 45px;">Qty</th>
                    <th style="text-align: right; width: 85px;">Unit Rate</th>
                    <th style="text-align: center; width: 55px;">GST</th>
                    <th style="text-align: right; width: 90px;">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList.map((item, idx) => {
                    const qty = Number(item.qty) || 1;
                    const itemUnitRate = 499;
                    const itemTotal = qty * itemUnitRate;
                    return `
                      <tr>
                        <td style="text-align: center; color: #5A6382;">${idx + 1}</td>
                        <td>
                          <b style="font-size: 12px;">${item.name || 'DriftOn Crystal Roll-On'}</b>
                          <div style="font-size: 10px; color: #5A6382;">Natural Mineral Deo Stick (100g)</div>
                        </td>
                        <td style="text-align: center; color: #5A6382;">33072000</td>
                        <td style="text-align: center; font-weight: 700;">${qty}</td>
                        <td style="text-align: right;">₹${itemUnitRate}</td>
                        <td style="text-align: center;">18%</td>
                        <td style="text-align: right; font-weight: 700;">₹${itemTotal}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Calculation Grid -->
            <div class="calc-grid">
              <div class="words-box">
                <div>
                  <div class="block-title">Invoice Amount in Words:</div>
                  <div style="font-weight: 700; color: #0F1A3C; font-size: 11.5px;">
                    ${numberToWordsINR(totalAmount)}
                  </div>
                </div>

                <div class="gst-box">
                  <div style="font-weight: 700; color: #5A6382; font-size: 9.5px; text-transform: uppercase; margin-bottom: 2.5px;">
                    GST Tax Breakdown (18% Included)
                  </div>
                  <div class="gst-row"><span>Taxable Value:</span><b>₹${netTaxable}</b></div>
                  ${isDelhi ? `
                    <div class="gst-row"><span>CGST (9%):</span><b>₹${cgst}</b></div>
                    <div class="gst-row"><span>SGST (9%):</span><b>₹${sgst}</b></div>
                  ` : `
                    <div class="gst-row"><span>IGST (18%):</span><b>₹${igst}</b></div>
                  `}
                  <div class="gst-row" style="border-top: 1px solid #E2E8F0; padding-top: 2px; font-weight: 700; color: #0F1A3C;">
                    <span>Total Tax:</span><b>₹${totalTax}</b>
                  </div>
                </div>
              </div>

              <div class="summary-box">
                <div>
                  <div class="sum-row"><span>Items Subtotal:</span><b style="color: #0F1A3C;">₹${subtotalAmount}</b></div>
                  ${discountAmount > 0 ? `<div class="sum-row" style="color: #16A34A;"><span>Discount (${order.coupon || 'PROMO'}):</span><b>- ₹${discountAmount}</b></div>` : ''}
                  ${codFee > 0 ? `<div class="sum-row"><span>COD Convenience Fee:</span><b style="color: #0F1A3C;">₹${codFee}</b></div>` : ''}
                  <div class="sum-row"><span>Shipping & Handling:</span><b style="color: #16A34A;">${deliveryFee > 0 ? '₹' + deliveryFee : 'FREE'}</b></div>
                </div>

                <div class="grand-box">
                  <div>
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; opacity: 0.85;">Grand Total</div>
                    <div style="font-size: 10px; opacity: 0.85;">Inclusive of all taxes</div>
                  </div>
                  <div class="grand-val">₹${totalAmount}</div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer-row">
              <div style="max-width: 60%; line-height: 1.4;">
                <b>Terms:</b> 100% Genuine Natural Crystal Deodorant. 7-day replacement for sealed items.<br/>
                Computer generated invoice. Requires no physical signature. Support: <b>${businessEmail}</b>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 10px; color: #5A6382; margin-bottom: 2px;">For ${legalName}</div>
                <div class="sign-stamp">
                  <div>DriftOn™ Certified</div>
                  <div style="font-size: 9px; font-weight: 500; color: #5A6382;">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Ensure Poppins font is loaded before opening print dialog
    const executePrint = () => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch {
        window.print();
      }
    };

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(() => {
        setTimeout(executePrint, 150);
      });
    } else {
      setTimeout(executePrint, 350);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-navy-900/60 p-2 sm:p-4 backdrop-blur-sm print:hidden">
      {/* Modal Dialog */}
      <div className="relative flex max-h-[96vh] w-full max-w-[840px] flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
        
        {/* Top Control Header */}
        <div className="flex items-center justify-between border-b border-[#EEF0F5] px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-navy-900 text-mint">
              <Icon.print size={18} />
            </span>
            <div>
              <h2 className="text-[16px] font-bold text-navy-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Tax Invoice Preview
              </h2>
              <p className="text-[12px] text-muted-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Invoice #{invoiceNumber} · Formatted in Poppins for 1-Page A4 Print & PDF
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              style={{ fontFamily: "'Poppins', sans-serif" }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-brand-dark"
            >
              <Icon.print size={16} /> Print / Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-xl text-muted-2 hover:bg-[#F3F5FA]"
              aria-label="Close"
            >
              <Icon.close size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Screen Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F6F7FB]">
          <div
            className="mx-auto w-full max-w-[760px] rounded-2xl bg-white p-6 shadow-sm border border-[#E2E8F0] text-navy-900"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {/* Header */}
            <div className="flex flex-col gap-4 border-b-2 border-navy-900 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <img
                  src="/assets/images/logo-drifton.webp"
                  alt="DriftOn"
                  className="h-9 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="mt-1 text-[13px] font-bold text-navy-900">Natural Crystal Deodorants</div>
                <p className="text-[11.5px] text-muted leading-tight font-normal">
                  Pure Mineral Odor Protection · 100% Potassium Alum · Chemical & Aluminum Free
                </p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block rounded-md bg-navy-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  TAX INVOICE
                </span>
                <div className="mt-1 text-[10px] font-semibold uppercase text-muted-2">Original For Recipient</div>
                <div className="mt-2 text-[12px] leading-tight text-muted-2">
                  <div>Invoice No: <b className="text-navy-900">{invoiceNumber}</b></div>
                  <div>Date: <b className="text-navy-900">{formattedDate}</b> at {formattedTime}</div>
                  <div>Order Ref: <b className="text-navy-900">#{order.id}</b></div>
                </div>
              </div>
            </div>

            {/* Seller & Buyer Grid */}
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8F9FC] p-3.5 sm:grid-cols-2 text-[12px]">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-2 mb-1">
                  Sold By / Dispatched From:
                </span>
                <b className="block text-[13.5px] text-navy-900">{legalName}</b>
                <span className="text-muted block text-[11.5px]">Brand: <b>{storeName}</b></span>
                <p className="text-[11.5px] text-muted leading-tight mt-0.5">{businessAddress}</p>
                <div className="mt-2 text-[11.5px] text-muted">
                  <div>GSTIN: <b className="text-navy-900">{gstNumber}</b> · Delhi (07)</div>
                  <div>Email: <b className="text-navy-900">{businessEmail}</b></div>
                </div>
              </div>

              <div className="sm:border-l sm:border-[#E2E8F0] sm:pl-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-2 mb-1">
                  Billed To & Shipped To:
                </span>
                <b className="block text-[13.5px] text-navy-900">{order.customer || 'Customer'}</b>
                <p className="text-[11.5px] text-muted leading-tight mt-0.5">
                  {order.address || 'Address on file'}
                  {order.pin ? `, PIN: ${order.pin}` : ''}
                </p>
                <div className="mt-2 text-[11.5px] text-muted">
                  <div>Phone: <b className="text-navy-900">+91 {order.phone}</b></div>
                  {order.email && <div>Email: <b className="text-navy-900">{order.email}</b></div>}
                  <div>Place of Supply: <b className="text-navy-900">{order.city || 'Delhi, India'}</b></div>
                </div>
              </div>
            </div>

            {/* Courier Strip */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-[11.5px]">
              <div>Courier: <b className="text-navy-900">Ekart Logistics Express</b></div>
              <div>AWB Tracking: <b className="text-navy-900">{order.tracking || 'EK' + String(order.id).padStart(8, '0')}</b></div>
              <div>Payment: <span className="font-semibold text-[#16A34A]">{order.payment || 'Prepaid'}</span></div>
            </div>

            {/* Table */}
            <div className="mt-3.5 overflow-hidden rounded-lg border border-[#E2E8F0]">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-navy-900 text-[10.5px] font-bold uppercase tracking-wider text-white">
                    <th className="py-2 pl-3 pr-1 text-center w-8">#</th>
                    <th className="py-2 px-2">Description of Goods</th>
                    <th className="py-2 px-2 text-center w-20">HSN</th>
                    <th className="py-2 px-2 text-center w-12">Qty</th>
                    <th className="py-2 px-2 text-right w-20">Unit Rate</th>
                    <th className="py-2 px-2 text-center w-12">GST</th>
                    <th className="py-2 pl-2 pr-3 text-right w-24">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F5]">
                  {itemsList.map((item, idx) => {
                    const qty = Number(item.qty) || 1;
                    const itemUnitRate = 499;
                    const itemTotal = qty * itemUnitRate;
                    return (
                      <tr key={idx} className="hover:bg-[#FAFBFD]">
                        <td className="py-2.5 pl-3 pr-1 text-center text-muted-2 text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <b className="block font-semibold text-navy-900">{item.name || 'DriftOn Crystal Roll-On'}</b>
                          <span className="text-[10.5px] text-muted-2">Natural Mineral Deo Stick (100g)</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-muted text-[11px]">33072000</td>
                        <td className="py-2.5 px-2 text-center font-bold text-navy-900">{qty}</td>
                        <td className="py-2.5 px-2 text-right text-muted">{inr(itemUnitRate)}</td>
                        <td className="py-2.5 px-2 text-center text-muted text-[11px]">18%</td>
                        <td className="py-2.5 pl-2 pr-3 text-right font-bold text-navy-900">{inr(itemTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calc & Totals */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3 text-[11px]">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-2 mb-1">
                    Invoice Amount in Words:
                  </span>
                  <b className="font-semibold text-navy-900 block">{numberToWordsINR(totalAmount)}</b>
                </div>

                <div className="mt-2.5 rounded-md border border-[#E2E8F0] bg-white p-2 text-[10.5px] text-muted">
                  <span className="block font-bold text-[9.5px] uppercase tracking-wider text-muted-2 mb-1">
                    GST Tax Breakdown (18% Included)
                  </span>
                  <div className="flex justify-between"><span>Taxable Value:</span><b>{inr(netTaxable)}</b></div>
                  {isDelhi ? (
                    <>
                      <div className="flex justify-between"><span>CGST (9%):</span><b>{inr(cgst)}</b></div>
                      <div className="flex justify-between"><span>SGST (9%):</span><b>{inr(sgst)}</b></div>
                    </>
                  ) : (
                    <div className="flex justify-between"><span>IGST (18%):</span><b>{inr(igst)}</b></div>
                  )}
                  <div className="flex justify-between border-t border-[#EEF0F5] pt-1 font-semibold text-navy-900 mt-0.5">
                    <span>Total Tax:</span><b>{inr(totalTax)}</b>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-white p-3 text-[12px]">
                <div className="flex flex-col gap-1.5 text-muted">
                  <div className="flex justify-between"><span>Items Subtotal:</span><b className="text-navy-900">{inr(subtotalAmount)}</b></div>
                  {discountAmount > 0 && <div className="flex justify-between text-[#16A34A]"><span>Discount:</span><b>- {inr(discountAmount)}</b></div>}
                  {codFee > 0 && <div className="flex justify-between"><span>COD Fee:</span><b className="text-navy-900">{inr(codFee)}</b></div>}
                  <div className="flex justify-between"><span>Shipping:</span><b className="text-[#16A34A]">{deliveryFee > 0 ? inr(deliveryFee) : 'FREE'}</b></div>
                </div>

                <div className="mt-2.5 flex items-center justify-between rounded-md bg-navy-900 p-2.5 text-white">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-2">Total Amount</span>
                    <span className="text-[10.5px] opacity-80">Inclusive of all taxes</span>
                  </div>
                  <b className="text-[18px] font-bold text-white">{inr(totalAmount)}</b>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between border-t border-[#E2E8F0] pt-3 text-[10.5px] text-muted-2 gap-3">
              <div>
                <b>Terms:</b> 100% Genuine Natural Crystal Deodorant. 7-day replacement for sealed items.<br/>
                Computer generated invoice. Requires no physical signature. Support: <b>${businessEmail}</b>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-muted-2 mb-1">For ${legalName}</span>
                <div className="inline-block rounded-md border border-dashed border-[#A0AEC0] bg-[#F8F9FC] px-3.5 py-1 text-center font-bold text-navy-900 text-[11px]">
                  DriftOn™ Certified
                  <div className="text-[9px] font-normal text-muted-2">Authorized Signatory</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
