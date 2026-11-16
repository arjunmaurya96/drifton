// =====================================================================
//  Payment — DEMO (runs in the browser only, no money is taken).
//  To go live, replace createPayment with a call to your backend that creates a
//  Razorpay / Cashfree / PhonePe order and opens its checkout, e.g. POST /api/orders.
// =====================================================================
export async function createPayment({ amount, method }) {
  await new Promise((r) => setTimeout(r, 900));
  return { ok: true, orderId: 'DRF' + Date.now().toString().slice(-7), amount, method };
}
