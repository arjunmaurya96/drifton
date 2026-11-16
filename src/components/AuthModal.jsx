import { useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Close } from './Icons.jsx';

const input = 'min-h-12 rounded-2xl border-[1.5px] border-line-strong px-3.5 text-[15px] font-normal outline-none focus:border-navy-700';

export default function AuthModal() {
  const { authMode, openAuth, closeAuth, notify } = useStore();

  useEffect(() => {
    if (!authMode) return;
    const onKey = (e) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authMode, closeAuth]);

  if (!authMode) return null;
  const signup = authMode === 'signup';

  const submit = (e) => {
    e.preventDefault();
    // TODO: connect to your auth API
    closeAuth();
    notify(signup ? 'Account created (demo)' : 'Logged in (demo)');
  };

  const tab = (on) => `min-h-[42px] rounded-full text-[14.5px] font-semibold text-navy-900 ${on ? 'bg-white shadow-sm' : ''}`;

  return (
    <div className="fixed inset-0 z-[80] flex animate-fade-in items-center justify-center bg-navy-900/55 p-5" onClick={closeAuth}>
      <form
        role="dialog" aria-modal="true" aria-label={signup ? 'Sign up' : 'Log in'}
        onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="relative flex w-full max-w-[440px] flex-col gap-4 rounded-[28px] bg-white px-8 py-8 shadow-2xl"
      >
        <button type="button" className="icon-btn absolute right-3.5 top-3.5" onClick={closeAuth} aria-label="Close"><Close /></button>
        <img src="/assets/images/logo.webp" alt="Drifton" className="h-9 w-auto self-start" />
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[28px] font-bold">{signup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-[15px] text-muted-2">{signup ? 'Sign up to track orders, save favourites and earn referral rewards.' : 'Log in to see your orders, wishlist and rewards.'}</p>
        </div>
        <div className="grid grid-cols-2 rounded-full bg-[#F1F3F9] p-1">
          <button type="button" className={tab(!signup)} onClick={() => openAuth('login')}>Log in</button>
          <button type="button" className={tab(signup)} onClick={() => openAuth('signup')}>Sign up</button>
        </div>
        {signup && <label className="flex flex-col gap-1.5 text-sm font-semibold">Full name<input className={input} placeholder="Your name" required /></label>}
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Email or mobile<input className={input} placeholder="you@example.com" required /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Password<input type="password" className={input} placeholder="••••••••" required /></label>
        <button className="btn-primary rounded-2xl">{signup ? 'Create account' : 'Log in'}</button>
        <p className="text-center text-sm text-muted-2">By continuing you agree to our Terms and Privacy Policy.</p>
      </form>
    </div>
  );
}
