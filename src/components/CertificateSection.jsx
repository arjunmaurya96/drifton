import { useState } from 'react';
import { Arrow, Check, Close, Drop, Shield } from './Icons.jsx';

// DUMMY certificate for the design. Replace [placeholders] and the modal image with the client's real lab certificate.
const chips = ['Dermatologically tested', 'Suitable for daily use', 'Skin irritation tested'];

export default function CertificateSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="tested" className="pb-24">
      <div className="container-x">
        <div className="grid grid-cols-1 overflow-hidden rounded-[36px] border border-line bg-white lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 px-6 py-12 sm:px-14 sm:py-16">
            <span className="eyebrow">Safety &amp; quality</span>
            <h2 className="h2">Tested with care, so you can <span className="text-brand">wear it with confidence.</span></h2>
            <p className="text-[17px] leading-loose text-muted">At Drifton, trust comes first. Our crystal deodorants go through skin testing so you can enjoy natural freshness without worrying about irritation.</p>
            <div className="flex flex-wrap gap-2.5">
              {chips.map((c) => (
                <span key={c} className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-3.5 py-2 text-sm font-semibold text-brand-dark"><Check size={16} sw={2.4} />{c}</span>
              ))}
            </div>
            <b className="font-head text-[17px]">Trust Drifton. Trust your skin.</b>
            <button className="btn-navy self-start" onClick={() => setOpen(true)}>View certificate <Arrow /></button>
          </div>

          <div className="relative flex items-center justify-center bg-[#E9EEF8] px-6 py-14 sm:px-12">
            <span className="absolute right-7 top-7 flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-[13px] font-bold text-white"><Shield size={15} />Verified</span>
            <div className="w-full max-w-[420px] animate-float rounded-[10px] bg-navy-900 p-3.5 shadow-[0_40px_70px_-30px_rgba(15,26,60,.6)]">
              <div className="relative flex flex-col items-center gap-3.5 overflow-hidden rounded border-2 border-navy-700 bg-white px-7 py-8 text-center">
                <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] font-head text-7xl font-extrabold tracking-[6px] text-navy-700/[.06]">SAMPLE</span>
                <span className="flex size-[70px] items-center justify-center rounded-full border-[3px] border-brand text-brand"><Drop /></span>
                <span className="font-head text-[30px] font-bold tracking-[3px] text-navy-700">CERTIFICATE</span>
                <span className="-mt-2 text-[11px] font-semibold uppercase tracking-[2.5px] text-muted-2">of conformity</span>
                <span className="border-b-2 border-brand pb-1 font-head text-[19px] font-bold text-brand">DERMATOLOGICALLY TESTED</span>
                <span className="rounded-[10px] border-[1.5px] border-navy-700 px-4 py-3.5 text-[12.5px] leading-relaxed text-navy-500">
                  This is to certify that <strong>DRIFTON CRYSTAL DEODORANT</strong>, supplied by <strong>AI Enterprises</strong>, was tested for skin irritation as per [STANDARD] by [TESTING LAB].
                </span>
                <span className="text-xs font-bold text-navy-700">DATE OF CERTIFICATION: [DATE]</span>
                <span className="mt-1.5 flex w-full justify-between gap-5 text-[11px] text-muted-2">
                  {['[Authorised signatory]', '[Scientific officer]'].map((s) => (
                    <span key={s} className="flex flex-1 flex-col items-center gap-1"><span className="h-px w-full bg-navy-700" />{s}</span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex animate-fade-in items-center justify-center bg-navy-900/60 p-5" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Certificate" onClick={(e) => e.stopPropagation()} className="relative flex w-full max-w-[520px] flex-col gap-4 rounded-3xl bg-white p-7">
            <button className="icon-btn absolute right-3 top-3" onClick={() => setOpen(false)} aria-label="Close"><Close /></button>
            <h2 className="text-2xl font-bold">Skin irritation test certificate</h2>
            <p className="text-[15px] text-muted">The full certificate (PDF or image) from the testing lab will open here once it is added.</p>
            <div className="flex h-56 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#B8C2E0] bg-page font-semibold text-muted-2">[Certificate image]</div>
          </div>
        </div>
      )}
    </section>
  );
}
