// Vercel Serverless Function: Easebuzz Payment Initiation
// Generates secure SHA512 hash using EASEBUZZ_KEY and EASEBUZZ_SALT,
// calls Easebuzz initiateLink API, and returns access_key to checkout frontend.

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.VITE_EASEBUZZ_KEY || process.env.EASEBUZZ_KEY;
  const salt = process.env.EASEBUZZ_SALT;
  const env = process.env.VITE_EASEBUZZ_ENV || process.env.EASEBUZZ_ENV || 'test';

  if (!key || !salt || key === 'test_easebuzz_dummy') {
    return res.status(400).json({ error: 'Easebuzz keys not configured' });
  }

  try {
    const { amount, txnid, customer = {}, productinfo = 'Drifton' } = req.body || {};
    const firstname = (customer.name || 'Customer').split(' ')[0] || 'Customer';
    const email = (customer.email || 'customer@drifton.in').trim();
    const phone = (customer.phone || '9999999999').trim();
    const formattedAmount = Number(amount).toFixed(2);

    const udf1 = '';
    const udf2 = '';
    const udf3 = '';
    const udf4 = '';
    const udf5 = '';

    // SHA-512 Hash calculation
    // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const easebuzzUrl = env === 'prod'
      ? 'https://pay.easebuzz.in/payment/initiateLink'
      : 'https://testpay.easebuzz.in/payment/initiateLink';

    const params = new URLSearchParams({
      key,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      phone,
      email,
      surl: 'https://drifton.vercel.app/profile',
      furl: 'https://drifton.vercel.app/profile',
      hash,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    });

    const response = await fetch(easebuzzUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const json = await response.json();
    if (json && json.status === 1 && json.data) {
      return res.status(200).json({ access_key: json.data });
    }

    return res.status(400).json({ error: json?.desc || 'Easebuzz initiate failed', details: json });
  } catch (err) {
    return res.status(500).json({ error: 'Easebuzz initiation server error', message: err.message });
  }
}
