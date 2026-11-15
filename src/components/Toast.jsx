import { useStore } from '../context/StoreContext.jsx';
import { Check } from './Icons.jsx';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div role="status" className="fixed bottom-6 right-6 z-[90] flex animate-fade-up items-center gap-2.5 rounded-2xl bg-navy-900 px-5 py-3.5 text-[15px] font-medium text-white shadow-2xl">
      <span className="text-mint"><Check size={20} /></span>
      {toast}
    </div>
  );
}
