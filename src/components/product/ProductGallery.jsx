import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Close } from '../Icons.jsx';

/**
 * Phitku-style gallery: vertical thumbnails on the left, big media on the right,
 * "1 / N" counter, arrows, and videos mixed in with images. Click the main media to open a lightbox.
 * `media` = [{ type: 'image' | 'video', src, poster?, pos?, scale? }]
 */
function Media({ m, big = false, name = '' }) {
  return (
    m.type === 'video' ? (
      big ? (
        <video key={m.src} src={m.src} poster={m.poster} autoPlay muted loop playsInline className="h-full w-full object-cover" />
      ) : (
        <span className="relative block h-full w-full">
          <img src={m.poster} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-navy-900/30 text-white"><Play size={22} /></span>
        </span>
      )
    ) : (
      <img src={m.src} alt={big ? name : ''} className="h-full w-full object-cover" style={{ objectPosition: m.pos || 'center', transform: `scale(${m.scale || 1})` }} />
    )
  );
}

export default function ProductGallery({ media, name, badge, bg }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const n = media.length;
  const cur = media[i];

  const go = (d) => setI((x) => (x + d + n) % n);

  return (
    <div className="flex min-w-0 flex-col-reverse gap-4 lg:sticky lg:top-[100px] lg:grid lg:grid-cols-[92px_1fr]">
      <div className="flex gap-3 overflow-x-auto pb-1 lg:max-h-[680px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
        {media.map((m, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`Show media ${k + 1}`}
            className={`h-[100px] w-[80px] shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition lg:h-[112px] lg:w-[92px] ${k === i ? 'border-navy-700' : 'border-transparent opacity-80 hover:opacity-100'}`}>
            <Media m={m} />
          </button>
        ))}
      </div>

      <div className="relative h-[460px] overflow-hidden rounded-[30px] sm:h-[600px] lg:h-[680px]" style={{ background: bg }}>
        <button className="block h-full w-full cursor-zoom-in" onClick={() => setZoom(true)} aria-label="Open media">
          <Media m={cur} big name={name} />
        </button>
        <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold shadow">{badge}</span>
        <span className="absolute bottom-5 left-5 rounded-full bg-navy-900/85 px-3.5 py-1.5 text-[13px] font-semibold text-white">{i + 1} / {n}</span>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="icon-btn bg-white shadow" onClick={() => go(-1)} aria-label="Previous media"><ChevronLeft /></button>
          <button className="icon-btn bg-white shadow" onClick={() => go(1)} aria-label="Next media"><ChevronRight /></button>
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[85] flex animate-fade-in items-center justify-center bg-navy-900/90 p-4" onClick={() => setZoom(false)}>
          <button className="icon-btn absolute right-5 top-5 bg-white" aria-label="Close" onClick={() => setZoom(false)}><Close /></button>
          <div className="h-[86vh] w-full max-w-[760px] overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <Media m={cur} big name={name} />
          </div>
        </div>
      )}
    </div>
  );
}
