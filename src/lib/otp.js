// =====================================================================
//  OTP + payment service — DEMO version (runs in the browser only).
//
//  To go live, replace these functions with calls to your backend, e.g.:
//    sendOtp   -> POST /api/otp/send   { phone }        (backend uses MSG91 / Twilio / Firebase Auth)
//    verifyOtp -> POST /api/otp/verify { phone, code }  (returns a session token)
//    createPayment -> POST /api/orders                  (backend creates a Razorpay / Cashfree order)
//  Never generate or check OTPs in the browser in production.
// =====================================================================

let demoCode = null;

export async function sendOtp(phone) {
  await new Promise((r) => setTimeout(r, 600));
  demoCode = String(Math.floor(100000 + Math.random() * 900000));
  // DEMO: the code is returned so the page can show it. A real backend sends it by SMS instead.
  return { ok: true, demoCode, phone };
}

export async function verifyOtp(phone, code) {
  await new Promise((r) => setTimeout(r, 500));
  return { ok: code === demoCode };
}

export async function createPayment({ amount, method }) {
  await new Promise((r) => setTimeout(r, 900));
  // DEMO: pretend the payment / COD order succeeded.
  return { ok: true, orderId: 'DRF' + Date.now().toString().slice(-7), amount, method };
}
