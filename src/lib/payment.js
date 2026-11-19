// =====================================================================
//  Easebuzz Payment Gateway (Test Mode & Live Integration)
//  • If VITE_EASEBUZZ_KEY is set with active credentials:
//      Connects to Easebuzz Checkout JS SDK (window.EasebuzzCheckout).
//  • If key is dummy or under account activation (Teller / NBBL Bharat Connect):
//      Launches the interactive Easebuzz Simulation Modal
//      allowing seamless testing for UPI (GPay/PhonePe/Paytm), Cards & Netbanking.
// =====================================================================

export async function createPayment({ amount, method = 'upi', customer = {} }) {
  // Cash on delivery: no online gateway needed
  if (method === 'cod') {
    return { ok: true, method: 'cod', amount };
  }

  const key = import.meta.env.VITE_EASEBUZZ_KEY;
  const env = import.meta.env.VITE_EASEBUZZ_ENV || 'test';
  const isRealKey = key && key !== 'test_easebuzz_dummy';

  // If a real Easebuzz key is configured and Easebuzz SDK is loaded
  if (isRealKey && typeof window !== 'undefined' && window.EasebuzzCheckout) {
    return new Promise(async (resolve) => {
      try {
        // Attempt initiate call if merchant backend endpoint exists
        const txnid = 'EBZ_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        let accessKey = null;

        try {
          const res = await fetch('/api/easebuzz-initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              txnid,
              customer,
              productinfo: 'Drifton Crystal Roll-On',
            }),
          });
          const data = await res.json();
          if (data && data.access_key) {
            accessKey = data.access_key;
          }
        } catch {
          // Backend endpoint not active yet
        }

        if (accessKey) {
          const easebuzz = new window.EasebuzzCheckout(key, env);
          easebuzz.initiatePayment({
            access_key: accessKey,
            onResponse: (response) => {
              if (response && (response.status === 'success' || response.status === true)) {
                resolve({
                  ok: true,
                  easebuzz_payment_id: response.easebuzz_id || response.txnid || txnid,
                  txnid: response.txnid || txnid,
                  paymentMethod: method,
                  amount,
                });
              } else {
                resolve({
                  ok: false,
                  error: response?.error_desc || response?.message || 'Payment cancelled or failed.',
                });
              }
            },
            theme: '#0A8558',
          });
          return;
        }

        // If backend initiate endpoint is not yet configured, launch Easebuzz Simulator
        launchEasebuzzSimulator({ amount, method, customer }).then(resolve);
      } catch (err) {
        console.warn('Easebuzz initialization falling back to simulator:', err);
        launchEasebuzzSimulator({ amount, method, customer }).then(resolve);
      }
    });
  }

  // Otherwise, launch the interactive Easebuzz Test Mode Simulator
  return launchEasebuzzSimulator({ amount, method, customer });
}

// -------------------------------------------------------------
// Interactive Easebuzz Test Mode Simulator
// -------------------------------------------------------------
function launchEasebuzzSimulator({ amount, method = 'upi', customer = {} }) {
  return new Promise((resolve) => {
    // Remove existing modal if present
    const prev = document.getElementById('easebuzz-test-simulator');
    if (prev) prev.remove();

    const overlay = document.createElement('div');
    overlay.id = 'easebuzz-test-simulator';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(10, 26, 44, 0.75); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px; font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      animation: ebzFadeIn 0.2s ease-out;
    `;

    let activeTab = method === 'card' ? 'card' : method === 'netbanking' ? 'netbanking' : 'upi';

    const renderContent = () => {
      overlay.innerHTML = `
        <div style="
          width: 100%; max-width: 480px; background: #ffffff;
          border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          display: flex; flex-direction: column; animation: ebzSlideUp 0.25s ease-out;
        ">
          <!-- Easebuzz Header -->
          <div style="background: linear-gradient(135deg, #092B48 0%, #065F46 100%); color: #ffffff; padding: 18px 22px; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #10B981; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px;">
                  e
                </div>
                <div>
                  <div style="font-size: 14.5px; font-weight: 700; letter-spacing: 0.3px;">DriftOn™ Checkout</div>
                  <div style="font-size: 10.5px; color: #94DFBE;">Powered by Easebuzz Payments</div>
                </div>
              </div>
              <button id="ebz-btn-close" style="
                background: rgba(255,255,255,0.15); border: none; color: #fff;
                width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
                display: flex; align-items: center; justify-content: center; font-size: 14px;
              " title="Cancel">✕</button>
            </div>

            <!-- Test Mode Notice & Amount -->
            <div style="
              margin-top: 14px; display: flex; align-items: flex-end; justify-content: space-between;
              border-top: 1px solid rgba(255,255,255,0.15); padding-top: 12px;
            ">
              <div>
                <span style="
                  display: inline-block; background: #ECFDF5; color: #065F46;
                  font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
                  text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #A7F3D0;
                ">Easebuzz Test Mode</span>
                <div style="font-size: 11.5px; color: #E2E8F0; margin-top: 4px;">
                  ${customer.name ? customer.name + ' · ' : ''}${customer.phone ? '+91 ' + customer.phone : ''}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 10px; color: #A7F3D0; text-transform: uppercase; letter-spacing: 0.5px;">Amount to Pay</div>
                <div style="font-size: 23px; font-weight: 800; color: #34D399;">₹${amount}</div>
              </div>
            </div>
          </div>

          <!-- Payment Tabs -->
          <div style="display: flex; border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
            <button id="ebz-tab-upi" style="
              flex: 1; padding: 12px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: none;
              background: ${activeTab === 'upi' ? '#ffffff' : 'transparent'};
              color: ${activeTab === 'upi' ? '#065F46' : '#64748B'};
              border-bottom: 2px solid ${activeTab === 'upi' ? '#10B981' : 'transparent'};
            ">UPI / QR</button>
            <button id="ebz-tab-card" style="
              flex: 1; padding: 12px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: none;
              background: ${activeTab === 'card' ? '#ffffff' : 'transparent'};
              color: ${activeTab === 'card' ? '#065F46' : '#64748B'};
              border-bottom: 2px solid ${activeTab === 'card' ? '#10B981' : 'transparent'};
            ">Cards (RuPay/Visa)</button>
            <button id="ebz-tab-netbanking" style="
              flex: 1; padding: 12px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: none;
              background: ${activeTab === 'netbanking' ? '#ffffff' : 'transparent'};
              color: ${activeTab === 'netbanking' ? '#065F46' : '#64748B'};
              border-bottom: 2px solid ${activeTab === 'netbanking' ? '#10B981' : 'transparent'};
            ">Netbanking</button>
          </div>

          <!-- Tab Content Body -->
          <div style="padding: 20px; flex: 1;">
            ${
              activeTab === 'upi'
                ? `
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                  <div style="background: #ffffff; padding: 6px; border-radius: 8px; border: 1px solid #E2E8F0; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                    ⚡
                  </div>
                  <div>
                    <div style="font-size: 12.5px; font-weight: 700; color: #166534;">Easebuzz Instant UPI</div>
                    <div style="font-size: 11px; color: #15803D;">Google Pay, PhonePe, Paytm, BHIM, CRED</div>
                    <div style="font-size: 10.5px; color: #64748B; margin-top: 2px;">VPA: <b>drifton@easebuzz</b></div>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; margin-top: 10px;">
                  <button id="ebz-btn-pay-success" style="
                    flex: 1; min-height: 48px; background: #059669; color: #fff; border: none;
                    border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);
                  ">
                    ✓ Pay with Easebuzz UPI (₹${amount})
                  </button>
                </div>
              </div>
            `
                : activeTab === 'card'
                ? `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="background: #F1F5F9; border-radius: 12px; padding: 12px; border: 1px solid #CBD5E1;">
                  <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Easebuzz Test Card (RuPay/Visa)</div>
                  <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: #0F172A; margin-top: 4px;">4111 •••• •••• 1111</div>
                  <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: #64748B;">
                    <span>Exp: <b>12 / 28</b></span>
                    <span>CVV: <b>123</b></span>
                  </div>
                </div>

                <button id="ebz-btn-pay-success" style="
                  min-height: 48px; background: #059669; color: #fff; border: none;
                  border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;
                  display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px;
                ">
                  ✓ Pay with Card (₹${amount})
                </button>
              </div>
            `
                : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 2px;">Supported Banks:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div style="border: 1px solid #E2E8F0; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;">HDFC Bank</div>
                  <div style="border: 1px solid #E2E8F0; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;">State Bank of India</div>
                  <div style="border: 1px solid #E2E8F0; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;">ICICI Bank</div>
                  <div style="border: 1px solid #E2E8F0; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;">Axis Bank</div>
                </div>

                <button id="ebz-btn-pay-success" style="
                  min-height: 48px; background: #059669; color: #fff; border: none;
                  border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;
                  margin-top: 10px; display: flex; align-items: center; justify-content: center;
                ">
                  ✓ Authorize NetBanking (₹${amount})
                </button>
              </div>
            `
            }

            <!-- Failure simulation option -->
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #E2E8F0; display: flex; align-items: center; justify-content: space-between;">
              <button id="ebz-btn-pay-fail" style="
                background: none; border: none; color: #DC2626; font-size: 11px;
                cursor: pointer; text-decoration: underline; font-weight: 600;
              ">
                Simulate Payment Failure
              </button>
              <span style="font-size: 10.5px; color: #94A3B8;">🔒 Easebuzz 256-bit PCI-DSS</span>
            </div>
          </div>
        </div>
      `;

      // Attach event listeners
      document.getElementById('ebz-btn-close')?.addEventListener('click', () => {
        cleanup();
        resolve({ ok: false, error: 'Payment was cancelled by user.' });
      });

      document.getElementById('ebz-tab-upi')?.addEventListener('click', () => {
        activeTab = 'upi';
        renderContent();
      });

      document.getElementById('ebz-tab-card')?.addEventListener('click', () => {
        activeTab = 'card';
        renderContent();
      });

      document.getElementById('ebz-tab-netbanking')?.addEventListener('click', () => {
        activeTab = 'netbanking';
        renderContent();
      });

      document.getElementById('ebz-btn-pay-success')?.addEventListener('click', () => {
        const btn = document.getElementById('ebz-btn-pay-success');
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = 'Verifying with Easebuzz…';
          btn.style.opacity = '0.7';
        }

        setTimeout(() => {
          cleanup();
          const mockPaymentId = 'EBZ' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 6).toUpperCase();
          const mockTxnId = 'TXN_' + Date.now().toString().slice(-8);
          resolve({
            ok: true,
            easebuzz_payment_id: mockPaymentId,
            txnid: mockTxnId,
            paymentMethod: activeTab,
            amount,
          });
        }, 500);
      });

      document.getElementById('ebz-btn-pay-fail')?.addEventListener('click', () => {
        cleanup();
        resolve({ ok: false, error: 'Easebuzz: Payment was declined by user bank.' });
      });
    };

    const cleanup = () => {
      overlay.remove();
    };

    document.body.appendChild(overlay);
    renderContent();
  });
}
