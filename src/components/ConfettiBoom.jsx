import { useEffect, useMemo } from 'react';

const COLORS = ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316'];

export default function ConfettiBoom({ show, code = '', savings = 0, title = 'Hurray!', message = '', subtext = '', onClose }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, 3800);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  // Generate 75 randomized confetti pieces
  const pieces = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: 75 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0 - 100%
      top: -15 - Math.random() * 25, // start above view
      size: 7 + Math.random() * 9,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.7,
      duration: 2.2 + Math.random() * 1.8,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'ribbon',
    }));
  }, [show]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[125] flex flex-col items-center justify-start pt-6 sm:pt-8 overflow-hidden select-none" aria-live="polite">
      {/* Confetti Rain / Explosion Container (Non-blocking) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute animate-confetti"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.shape === 'ribbon' ? `${p.size * 2.2}px` : `${p.size}px`,
              height: p.shape === 'ribbon' ? `${p.size / 2}px` : `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'ribbon' ? '2px' : '3px',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Floating Celebration Pill / Banner (Non-blocking, inside UI) */}
      <div className="pointer-events-none relative z-10 mx-4 flex max-w-[460px] animate-fade-up items-center gap-3.5 rounded-2xl border border-white/30 bg-[linear-gradient(135deg,#0A1E4A_0%,#163B80_100%)] px-5 py-3.5 text-white shadow-2xl backdrop-blur-md">
        {/* Celebration Animated Icon */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md">
          <svg className="size-6 animate-bounce" viewBox="0 0 24 24" fill="none">
            <path d="M4 20L14 10L17 13L7 23L4 20Z" fill="#0A1E4A" />
            <path d="M14 10L18 6L21 9L17 13L14 10Z" fill="#FBBF24" />
            <circle cx="19" cy="4" r="1.5" fill="#EF4444" />
            <circle cx="23" cy="8" r="1.5" fill="#3B82F6" />
            <circle cx="14" cy="3" r="1.5" fill="#10B981" />
            <path d="M6 18L10 14" stroke="#FBBF24" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-head text-[15px] font-extrabold tracking-tight text-white">
              {title || 'Hurray! 🎉'}
            </span>
            <span className="rounded-full bg-mint/25 px-2 py-0.2 text-[10px] font-black uppercase text-mint tracking-wider">
              SAVED
            </span>
          </div>

          <p className="truncate text-[12.5px] font-medium text-white/90">
            {message ? (
              message
            ) : code ? (
              <span><b className="font-bold text-mint uppercase">{code}</b> applied</span>
            ) : (
              'Offer applied successfully!'
            )}
          </p>

          {(subtext || savings > 0) && (
            <p className="text-[12px] font-bold text-mint">
              {subtext ? subtext : `Saved ₹${savings} on your order!`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
