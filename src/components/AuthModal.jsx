import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Close } from './Icons.jsx';

const inputCls = 'min-h-12 w-full rounded-2xl border-[1.5px] border-line-strong px-4 text-[14.5px] font-normal outline-none focus:border-navy-700 transition bg-white';

export default function AuthModal() {
  const { authMode, openAuth, closeAuth, loginWithGoogle, loginWithEmail, signupWithEmail } = useStore();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);

  useEffect(() => {
    if (authMode) {
      setIsSignup(authMode === 'signup');
      setError('');
      setGoogleBusy(false);
      setFormBusy(false);
    }
  }, [authMode]);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormBusy(true);

    if (isSignup) {
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
      }
    } else {
      const res = await loginWithEmail(email, password);
      setFormBusy(false);
      if (!res.ok) {
        setError(res.error || 'Incorrect email or password.');
      }
    }
  };

  const tabCls = (active) =>
    `min-h-[42px] rounded-full text-[14px] font-semibold transition ${
      active ? 'bg-white text-navy-900 shadow-sm' : 'text-muted-2 hover:text-navy-900'
    }`;

  return (
    <div className="fixed inset-0 z-[88] flex animate-fade-in items-center justify-center bg-navy-900/60 p-4 backdrop-blur-sm" onClick={closeAuth}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isSignup ? 'Create Account' : 'Log In'}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[460px] animate-fade-up flex-col gap-4.5 rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl"
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
          <h2 className="mt-3 font-head text-[24px] font-bold text-navy-900">
            {isSignup ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="mt-1 text-[13.5px] text-muted-2">
            {isSignup
              ? 'Sign up to track live orders, download invoices, and save your address.'
              : 'Log in to view your orders, live tracking status, and account profile.'}
          </p>
        </div>

        {/* 1-Click Google Sign In */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy || formBusy}
            className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-line-strong bg-white px-4 text-[14.5px] font-semibold text-navy-900 transition hover:bg-[#F8F9FC] hover:border-navy-700 disabled:opacity-50"
          >
            <svg className="size-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}
          </button>
          {googleBusy && (
            <button
              type="button"
              onClick={() => { setGoogleBusy(false); setError('Google sign-in was cancelled.'); }}
              className="text-center text-xs text-muted-2 underline hover:text-navy-900 transition"
            >
              Cancel Google Sign-in
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[12px] uppercase font-bold tracking-wider text-muted-2">or with email</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* Tab Toggle: Log In / Sign Up */}
        <div className="grid grid-cols-2 rounded-full bg-[#F1F3F9] p-1">
          <button type="button" className={tabCls(!isSignup)} onClick={() => { setIsSignup(false); setError(''); }}>
            Log In
          </button>
          <button type="button" className={tabCls(isSignup)} onClick={() => { setIsSignup(true); setError(''); }}>
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isSignup && (
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
              autoComplete={isSignup ? 'new-password' : 'current-password'}
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
            className="btn-primary mt-1 min-h-[48px] w-full rounded-2xl text-[15px] font-semibold disabled:opacity-60"
          >
            {formBusy ? 'Please wait…' : isSignup ? 'Create Account' : 'Log In to DriftOn'}
          </button>
        </form>

        <p className="text-center text-[12px] text-muted-2">
          By signing in, you agree to our{' '}
          <a href="/terms" target="_blank" className="text-navy-900 underline">
            Terms & Conditions
          </a>.
        </p>
      </div>
    </div>
  );
}
