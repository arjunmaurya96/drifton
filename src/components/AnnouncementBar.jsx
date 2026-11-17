import { business } from '../data/site.js';

// Text can be changed from the admin panel (Settings → Announcement bar)
export default function AnnouncementBar() {
  return (
    <div className="bg-navy-900 px-4 py-2 text-center text-[12.5px] font-medium text-[#E7ECFA] sm:py-2.5 sm:text-[13.5px]">
      {business.announcement ? <strong className="text-mint">{business.announcement}</strong> : (
        <><strong className="text-mint">Add Natural Roll On: 2 for ₹750</strong><span className="hidden sm:inline"> · 3rd roll on just <strong className="text-mint">₹300</strong></span> · Free delivery</>
      )}
    </div>
  );
}
