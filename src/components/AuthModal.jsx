import { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Close } from './Icons.jsx';

const DEMO_OTP = '1234';
const RESEND_AFTER = 30;
const inputCls = 'min-h-12 w-full rounded-2xl border-[1.5px] border-line-strong px-4 text-[14.5px] font-normal outline-none focus:border-navy-700 transition bg-white';

function OtpBoxes({ value, onChange }) {
  const refs = useRef([]);
  const set = (i, v) => {
    const d = v.replace(/\D/g, '');
    if (d.length > 1) { onChange(d.slice(0, 4)); refs.current[Math.min(3, d.length)]?.focus(); return; }
    const arr = value.padEnd(4, ' ').split('');
    arr[i] = d || ' ';
    onChange(arr.join('').replace(/\s+$/, ''));
    if (d && i < 3) refs.current[i + 1]?.focus();
  };
  return (
    <div className="flex justify-center gap-3 sm:gap-4 my-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`OTP digit ${i + 1}`}
          value={(value[i] || '').trim()}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !(value[i] || '').trim() && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          className="h-13 w-13 rounded-2xl border-[1.5px] border-line-strong bg-white text-center font-head text-2xl font-bold outline-none focus:border-navy-700 focus:ring-4 focus:ring-blue-soft sm:h-14 sm:w-14"
        />
      ))}
    </div>
  );
}

export default function AuthModal() {
  const { authMode, authModalReason, openAuth, closeAuth, loginWithGoogle, loginWithEmail, signupWithEmail, loginWithOtp } = useStore();
  const [tab, setTab] = useState('otp'); // 'otp' | 'password' | 'signup'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);

  useEffect(() => {
    if (authMode) {
      setTab(authMode === 'signup' ? 'signup' : 'otp');
      setError('');
      setOtpSent(false);
      setOtp('');
      setGoogleBusy(false);
      setFormBusy(false);
    }
  }, [authMode]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    if (!authMode) return;
    const onKey = (e) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authMode, closeAuth]);

  if (!authMode) return null;

  const handleGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    const res = await loginWithGoogle();
    setGoogleBusy(false);
    if (!res.ok) {
      setError(res.error || 'Google sign-in was cancelled or failed.');
    } else {
      closeAuth();
    }
  };

  const handleSendOtp = (e) => {
    e?.preventDefault();
    setError('');
    const em = email.trim();
    const ph = phone.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    const phoneValid = /^[6-9]\d{9}$/.test(ph);

    if (!emailValid && !phoneValid) {
      return setError('Please enter a valid Email address or 10-digit mobile number.');
    }
    setOtpSent(true);
    setOtp('');
    setTimer(RESEND_AFTER);
  };

  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    setError('');
    const clean = otp.trim();
    if (clean === DEMO_OTP || /^\d{4}$/.test(clean)) {
      loginWithOtp(email.trim(), phone.trim(), name.trim());
      closeAuth();
    } else {
      setError(`Please enter a valid 4-digit OTP (e.g. ${DEMO_OTP}).`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormBusy(true);

    if (tab === 'signup') {
      if (!name.trim()) {
        setFormBusy(false);
        return setError('Please enter your full name.');
      }
      if (password.length < 6) {
        setFormBusy(false);
        return setError('Password must be at least 6 characters long.');
      }
      const res = await signupWithEmail(email, password, name.trim(), phone.trim());
      setFormBusy(false);
      if (!res.ok) {
        setError(res.error || 'Could not create account. Please try again.');
      } else {
        closeAuth();
      }
    } else if (tab === 'password') {
      const res = await loginWithEmail(email, password);
      setFormBusy(false);
      if (!res.ok) {
        setError(res.error || 'Incorrect email or password.');
      } else {
        closeAuth();
      }
    }
  };

  const tabCls = (active) =>
    `min-h-[38px] px-2 rounded-full text-[13px] font-semibold transition ${
      active ? 'bg-white text-navy-900 shadow-sm' : 'text-muted-2 hover:text-navy-900'
    }`;

  return (
    <div className="fixed inset-0 z-[88] flex animate-fade-in items-center justify-center bg-navy-900/60 p-4 backdrop-blur-sm" onClick={closeAuth}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tab === 'signup' ? 'Create Account' : 'Log In'}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[460px] animate-fade-up flex-col gap-4 rounded-[28px] bg-white p-6 sm:p-7 shadow-2xl"
      >
        <button
          type="button"
          className="icon-btn absolute right-4 top-4"
          onClick={closeAuth}
          aria-label="Close"
        >
          <Close />
        </button>

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <img src="/assets/images/logo.webp" alt="Drifton" className="h-9 w-auto" />
          <h2 className="mt-2.5 font-head text-[22px] font-bold text-navy-900">
            {authModalReason === 'combo' ? 'Verify to Unlock Offer' : tab === 'signup' ? 'Create Your Account' : 'Welcome to DriftOn'}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-2">
            {authModalReason === 'combo'
              ? 'Quick 1-click verification to activate your combo discounts & deals.'
              : tab === 'signup'
              ? 'Sign up to track live orders, download invoices, and save your address.'
              : 'Sign in with Google, 4-Digit OTP, or Password.'}
          </p>
        </div>

        {authModalReason === 'combo' && (
          <div className="flex flex-col gap-1 rounded-2xl bg-gradient-to-r from-brand/15 via-blue-50 to-brand/10 border border-brand/30 p-3.5 text-center animate-fade-down shadow-xs">
            <span className="font-head text-[15px] font-extrabold text-brand-dark flex items-center justify-center gap-1.5">
              <span>🎁</span>
              <span>You're 1 Step Away From Combo Savings!</span>
            </span>
            <p className="text-[12.5px] text-navy-900 font-medium leading-snug">
              Verify with 4-Digit OTP or Google to get your 2nd roll on starting <b>₹300 onwards</b>!
            </p>
          </div>
        )}

        {/* 1-Click Google Sign In */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy || formBusy}
            className="mt-1 flex min-h-[46px] w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-line-strong bg-white px-4 text-[14px] font-semibold text-navy-900 transition hover:bg-[#F8F9FC] hover:border-navy-700 disabled:opacity-50"
          >
            <svg className="size-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}
          </button>
        </div>

        <div className="flex items-center gap-3 my-0.5">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase font-bold tracking-wider text-muted-2">or continue below</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* Tab Toggle: 4-Digit OTP / Password / Sign Up */}
        <div className="grid grid-cols-3 rounded-full bg-[#F1F3F9] p-1">
          <button type="button" className={tabCls(tab === 'otp')} onClick={() => { setTab('otp'); setError(''); }}>
            4-Digit OTP
          </button>
          <button type="button" className={tabCls(tab === 'password')} onClick={() => { setTab('password'); setError(''); }}>
            Password
          </button>
          <button type="button" className={tabCls(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); }}>
            Sign Up
          </button>
        </div>

        {/* 4-Digit OTP Flow */}
        {tab === 'otp' && (
          <div className="flex flex-col gap-3.5">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-navy-900">
                  Email or Mobile Number
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="you@example.com or 10-digit mobile"
                    value={email || phone}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d+$/.test(v)) {
                        setPhone(v);
                        setEmail('');
                      } else {
                        setEmail(v);
                        setPhone('');
                      }
                    }}
                    required
                  />
                </label>
                {error && (
                  <p role="alert" className="rounded-xl bg-[#FDECEC] px-3.5 py-2 text-[12.5px] font-semibold text-[#B42318]">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-primary mt-1 min-h-[46px] w-full rounded-2xl text-[14.5px] font-semibold"
                >
                  Send 4-Digit OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                <div className="text-center">
                  <p className="text-[13px] text-muted-2">
                    Enter the 4-digit code sent to <b className="text-navy-900">{email || `+91 ${phone}`}</b>
                  </p>
                </div>
                <OtpBoxes value={otp} onChange={setOtp} />
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="rounded-full bg-[#FFF4E5] px-2.5 py-0.5 font-semibold text-[#8A4B00]">Demo OTP: {DEMO_OTP}</span>
                  <div className="flex gap-2.5">
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="font-semibold text-navy-700 underline">Change</button>
                    {timer > 0 ? (
                      <span className="text-muted-2">Resend in {timer}s</span>
                    ) : (
                      <button type="button" onClick={handleSendOtp} className="font-semibold text-navy-700 underline">Resend OTP</button>
                    )}
                  </div>
                </div>
                {error && (
                  <p role="alert" className="rounded-xl bg-[#FDECEC] px-3.5 py-2 text-[12.5px] font-semibold text-[#B42318]">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={otp.length < 4}
                  className="btn-primary mt-1 min-h-[46px] w-full rounded-2xl text-[14.5px] font-semibold disabled:opacity-50"
                >
                  Verify 4-Digit OTP & Log In
                </button>
              </form>
            )}
          </div>
        )}

        {/* Email & Password Flow */}
        {(tab === 'password' || tab === 'signup') && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {tab === 'signup' && (
              <>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-navy-900">
                  Full Name
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-navy-900">
                  Mobile Number (optional)
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </label>
              </>
            )}

            <label className="flex flex-col gap-1 text-[13px] font-semibold text-navy-900">
              Email Address
              <input
                type="email"
                className={inputCls}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-[13px] font-semibold text-navy-900">
              Password
              <input
                type="password"
                className={inputCls}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-[#FDECEC] px-3.5 py-2 text-[12.5px] font-semibold text-[#B42318]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={formBusy || googleBusy}
              className="btn-primary mt-1 min-h-[46px] w-full rounded-2xl text-[14.5px] font-semibold disabled:opacity-60"
            >
              {formBusy ? 'Please wait…' : tab === 'signup' ? 'Create Account' : 'Log In to DriftOn'}
            </button>
          </form>
        )}

        <p className="text-center text-[11.5px] text-muted-2">
          By signing in, you agree to our{' '}
          <a href="/terms" target="_blank" className="text-navy-900 underline">
            Terms & Conditions
          </a>.
        </p>
      </div>
    </div>
  );
}
