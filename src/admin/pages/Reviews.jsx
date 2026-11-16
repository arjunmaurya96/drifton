import { useState } from 'react';
import { useAdmin } from '../store.jsx';
import { Badge, Btn, Card, Empty, Icon, PageHeader, Toolbar, fmtDate } from '../ui.jsx';

export default function Reviews() {
  const { data, update } = useAdmin();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const list = data.reviews.filter((r) => (tab === 'all' || r.status === tab) && (!q || `${r.customer} ${r.title} ${r.text}`.toLowerCase().includes(q.toLowerCase())));
  const chips = [['all', 'All', data.reviews.length], ...['Pending', 'Published', 'Hidden'].map((s) => [s, s, data.reviews.filter((r) => r.status === s).length])];
  const avg = (data.reviews.filter((r) => r.status === 'Published').reduce((s, r) => s + r.rating, 0) / Math.max(1, data.reviews.filter((r) => r.status === 'Published').length)).toFixed(1);

  return (
    <>
      <PageHeader title="Reviews" sub={`Average rating ${avg} ★ from published reviews. Approve new reviews before they show on the site.`} />
      <Card className="overflow-hidden">
        <Toolbar q={q} setQ={setQ} placeholder="Search reviews…" chips={chips} active={tab} setActive={setTab} />
        {list.length === 0 ? <Empty text="No reviews here." /> : (
          <ul className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((r) => {
              const p = data.products.find((x) => x.id === r.productId);
              return (
                <li key={r.id} className="flex flex-col gap-3 rounded-2xl border border-[#EEF0F5] p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex gap-0.5 text-[#F2A93B]">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= r.rating ? '' : 'text-[#E0E4EE]'}><Icon.star size={16} /></span>)}</span>
                    <Badge>{r.status}</Badge>
                  </div>
                  <div><b className="block text-[15px]">{r.title}</b><p className="mt-1 text-[14px] leading-relaxed text-muted">{r.text}</p></div>
                  <div className="mt-auto flex items-center gap-2.5 border-t border-[#EEF0F5] pt-3">
                    <span className="flex size-9 items-center justify-center rounded-xl" style={{ background: p?.bg }}><img src={p?.image} alt="" className="h-7 w-auto" /></span>
                    <span className="min-w-0 flex-1 text-[12.5px]"><b className="block truncate">{r.customer}</b><span className="text-muted-2">{p?.short} · {fmtDate(r.date)}</span></span>
                  </div>
                  <div className="flex gap-2">
                    {r.status !== 'Published' && <Btn variant="green" className="min-h-9 flex-1" onClick={() => update('reviews', r.id, { status: 'Published' }, 'Review published')}>Publish</Btn>}
                    {r.status !== 'Hidden' && <Btn variant="ghost" className="min-h-9 flex-1" onClick={() => update('reviews', r.id, { status: 'Hidden' }, 'Review hidden')}>Hide</Btn>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
