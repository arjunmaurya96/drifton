import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';

export default function ReferEarn() {
  const { notify } = useStore();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try { await navigator.clipboard.writeText('DRIFTON100'); } catch {}
    setCopied(true);
    notify('Referral code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="refer" className="pb-8 pt-14 sm:pb-10">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-10 rounded-[32px] bg-navy-900 px-7 py-10 text-white md:flex-row md:items-center md:px-14 md:py-14">
          <div className="flex max-w-[600px] flex-col gap-4">
            <span className="self-start rounded-full bg-white/10 px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-widest">Rewards are better when shared</span>
            <h2 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">Refer a friend.<br /><span className="text-mint">Earn rewards.</span></h2>
            <p className="text-[17px] leading-relaxed text-ondark">Share the goodness of Drifton with your friends. Invite them to shop and enjoy exciting rewards.</p>
          </div>
          <div className="flex w-full flex-col gap-3.5 rounded-[22px] bg-white p-5 md:w-auto md:min-w-[320px]">
            <small className="text-xs font-bold uppercase tracking-widest text-muted-2">Your referral code</small>
            <div className="flex items-center justify-between gap-4 rounded-2xl border-[1.5px] border-dashed border-[#B8C2E0] py-3 pl-4 pr-3">
              <b className="font-head text-[26px] font-bold tracking-wide text-navy-700">DRIFTON100</b>
              <button className="btn-primary min-h-11 px-4" onClick={copy}>{copied ? 'Copied!' : 'Copy code'}</button>
            </div>
            <span className="text-sm text-muted">Share your code with friends and family</span>
          </div>
        </div>
      </div>
    </section>
  );
}
