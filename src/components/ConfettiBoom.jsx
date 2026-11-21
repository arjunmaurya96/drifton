import { useEffect, useMemo } from 'react';
import { Close } from './Icons.jsx';

const COLORS = ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316'];

export default function ConfettiBoom({ show, code = '', savings = 0, title = 'Hurray!', message = '', subtext = '', onClose }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, 8000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  // Generate 60 randomized confetti pieces
  const pieces = useMemo(() => {
    return Array.from({ length: 65 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0 - 100%
      top: -10 - Math.random() * 20, // start above view
      size: 6 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      duration: 2.2 + Math.random() * 2,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'ribbon',
    }));
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-auto">
      {/* Dark overlay backdrop with blur */}
      <div
        className="absolute inset-0 bg-navy-950/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Confetti Rain / Explosion Container */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute animate-confetti"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.shape === 'ribbon' ? `${p.size * 2}px` : `${p.size}px`,
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

      {/* Celebration Popup Card (Exact Phitku reference style) */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-[90%] max-w-[400px] rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-2xl animate-fade-up sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
        >
          <Close size={18} />
        </button>

        {/* Party Horn / Popper Illustration */}
        <div className="relative mx-auto mb-3 flex size-20 items-center justify-center">
          <svg className="size-16 animate-bounce drop-shadow-md" viewBox="0 0 64 64" fill="none">
            {/* Cone */}
            <path d="M12 48L38 18L52 32L26 62L12 48Z" fill="url(#popper-grad)" />
            {/* Cone stripes */}
            <path d="M18 42L28 30L34 36L24 48L18 42Z" fill="#F43F5E" />
            <path d="M28 30L38 18L44 24L34 36L28 30Z" fill="#FBBF24" />
            {/* Ribbons / Stars popping */}
            <path d="M42 12C45 8 50 10 52 6" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            <path d="M48 20C54 18 56 24 60 22" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            <path d="M36 6C38 3 43 4 45 2" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="56" cy="14" r="3" fill="#F59E0B" />
            <circle cx="48" cy="4" r="2.5" fill="#8B5CF6" />
            <circle cx="60" cy="28" r="2.5" fill="#EF4444" />
            <defs>
              <linearGradient id="popper-grad" x1="12" y1="48" x2="52" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hurray Message */}
        <h3 className="font-head text-[24px] font-extrabold tracking-tight text-navy-900">
          {title || 'Hurray!'}
        </h3>
        <p className="mt-1 text-[15px] font-medium text-slate-700">
          {message ? (
            <span>{message}</span>
          ) : code ? (
            <span><b className="font-bold text-brand uppercase">{code}</b> applied successfully.</span>
          ) : (
            <span>Offer applied successfully!</span>
          )}
        </p>

        {/* Savings Text */}
        {(subtext || savings > 0) && (
          <p className="mt-1.5 text-[16px] font-bold text-navy-900">
            {subtext ? (
              <span>{subtext}</span>
            ) : (
              <span>You saved <span className="text-brand font-extrabold">₹{savings}</span> with this offer!</span>
            )}
          </p>
        )}

        {/* Action Link Button */}
        <button
          onClick={onClose}
          className="mt-5 inline-block font-head text-[15px] font-bold text-[#1A73E8] transition hover:text-[#174EA6] hover:underline cursor-pointer"
        >
          Yay, Thanks!
        </button>
      </div>
    </div>
  );
}
