import { business } from '../data/site.js';

const DEFAULT_TEXT = '💥 Unlock Special Discounts at Checkout!';

// Top Header Marquee Slider (Replaces old static top bar with a smooth blue scrolling ticker)
export default function AnnouncementBar() {
  const text = business.announcement || DEFAULT_TEXT;

  return (
    <div
      aria-label={text}
      className="relative overflow-hidden bg-[linear-gradient(90deg,#0A1E4A_0%,#1B49AF_50%,#0A1E4A_100%)] py-2 text-white shadow-inner sm:py-2.5"
    >
      <div
        aria-hidden="true"
        className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]"
        style={{ animationDuration: '30s' }}
      >
        {Array.from({ length: 2 }).map((_, half) => (
          <div key={half} className="flex shrink-0 items-center">
            {Array.from({ length: 6 }).map((__, k) => (
              <span
                key={k}
                className="flex shrink-0 items-center gap-6 px-4 font-head text-[13.5px] font-bold tracking-wide text-white sm:gap-10 sm:px-6 sm:text-[14.5px]"
              >
                <span>{text}</span>
                <span className="inline-block size-2 rotate-45 rounded-[1px] bg-[#67E8F9] shadow-[0_0_8px_#38BDF8]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
