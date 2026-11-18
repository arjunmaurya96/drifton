import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Close } from '../Icons.jsx';

/**
 * Product gallery: thumbnails on the left (below on mobile), one big 4:5 stage.
 * Every image is shown whole and sharp — photos fill the 4:5 frame, cut-outs sit on a soft stage.
 * `media` = [{ type: 'image' | 'video', src, poster?, fit?: 'cover' | 'contain', pos?, label? }]
 */
function Media({ m, big = false, name = '', bg }) {
  if (m.type === 'video') {
    return big ? (
      <video key={m.src} src={m.src} poster={m.poster} autoPlay muted loop playsInline className="h-full w-full object-cover" />
    ) : (
      <span className="relative block h-full w-full">
        <img src={m.poster} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-navy-900/30 text-white"><Play size={22} /></span>
      </span>
    );
  }
  if (m.fit === 'contain') {
    return (
      <span className="relative flex h-full w-full items-center justify-center" style={{ background: m.bg || bg }}>
        {m.stage && <>
          <span aria-hidden="true" className="absolute left-1/2 top-[45%] aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-2xl" />
          <span aria-hidden="true" className="absolute bottom-[11%] left-1/2 h-[4%] w-[42%] -translate-x-1/2 rounded-[50%] bg-navy-900/25 blur-md" />
        </>}
        <img src={m.src} alt={big ? name : ''} loading="lazy"
          className={`relative h-full w-full object-contain ${m.stage ? (big ? 'px-[18%] py-[10%]' : 'px-[16%] py-[8%]') : ''}`} />
      </span>
    );
  }
  return <img src={m.src} alt={big ? name : ''} className="h-full w-full object-cover" style={{ objectPosition: m.pos || '50% 50%' }} />;
}

export default function ProductGallery({ media, name, badge, bg }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const n = media.length;
  const cur = media[i];
  const go = (d) => setI((x) => (x + d + n) % n);

  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 lg:sticky lg:top-[100px] lg:grid lg:grid-cols-[84px_1fr] lg:gap-4">
      {/* thumbnails */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible">
        {media.map((m, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`Show media ${k + 1}`}
            className={`aspect-[4/5] w-[72px] shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 transition lg:w-full ${k === i ? 'ring-navy-900' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
            <Media m={m} bg={bg} />
          </button>
        ))}
      </div>

      {/* main stage */}
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_30px_60px_-40px_rgba(15,26,60,.55)]" style={{ background: bg }}>
        <button className="block h-full w-full cursor-zoom-in" onClick={() => setZoom(true)} aria-label="Open image full screen">
          <span key={i} className="block h-full w-full animate-fade-in"><Media m={cur} big name={name} bg={bg} /></span>
        </button>
        {badge && <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-wider text-navy-900 shadow-sm">{badge}</span>}
        {cur.label && <span className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">{cur.label}</span>}
        <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">{i + 1} / {n}</span>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="flex size-11 items-center justify-center rounded-full bg-white text-navy-900 shadow-md hover:bg-mint-soft" onClick={() => go(-1)} aria-label="Previous image"><ChevronLeft /></button>
          <button className="flex size-11 items-center justify-center rounded-full bg-white text-navy-900 shadow-md hover:bg-mint-soft" onClick={() => go(1)} aria-label="Next image"><ChevronRight /></button>
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[85] flex animate-fade-in items-center justify-center bg-navy-900/90 p-4" onClick={() => setZoom(false)}>
          <button className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-white text-navy-900" aria-label="Close" onClick={() => setZoom(false)}><Close /></button>
          <button className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft /></button>
          <button className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900" aria-label="Next image" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight /></button>
          <div className="aspect-[4/5] h-[88vh] max-w-full overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <Media m={cur} big name={name} bg={bg} />
          </div>
        </div>
      )}
    </div>
  );
}
