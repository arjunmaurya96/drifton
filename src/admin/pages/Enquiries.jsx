import { useMemo, useState } from 'react';
import { useAdmin } from '../store.jsx';
import { TOPIC_LABEL } from '../data.js';
import { Badge, Btn, Card, Empty, Icon, PageHeader, Toolbar, ago, Help } from '../ui.jsx';

const STATUSES = ['New', 'Contacted', 'Closed'];
const groups = [['all', 'All'], ['business', 'Distributor & retail'], ['support', 'Customer support']];
const isBusiness = (t) => ['distributor', 'retailer', 'bulk'].includes(t);

export default function Enquiries() {
  const { data, update } = useAdmin();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [openId, setOpenId] = useState(data.enquiries[0]?.id);

  const list = useMemo(() => data.enquiries.filter((e) =>
    (tab === 'all' || (tab === 'business' ? isBusiness(e.topic) : !isBusiness(e.topic))) &&
    (!q || `${e.name} ${e.company} ${e.city} ${e.msg}`.toLowerCase().includes(q.toLowerCase()))), [data.enquiries, q, tab]);
  const e = data.enquiries.find((x) => x.id === openId);
  const chips = groups.map(([k, l]) => [k, l, data.enquiries.filter((x) => k === 'all' || (k === 'business' ? isBusiness(x.topic) : !isBusiness(x.topic))).length]);

  return (
    <>
      <PageHeader title="Enquiries" sub="Messages from the Contact page — customers, distributors and retailers." />
      <Help>Messages sent from the Contact page. Call or email the person, then mark it <b>Contacted</b>, and <b>Closed</b> when it is done.</Help>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="overflow-hidden">
          <Toolbar q={q} setQ={setQ} placeholder="Search name, company, city…" chips={chips} active={tab} setActive={setTab} />
          {list.length === 0 ? <Empty text="No enquiries here." /> : (
            <ul className="max-h-[640px] divide-y divide-[#EEF0F5] overflow-y-auto">
              {list.map((x) => (
                <li key={x.id}>
                  <button onClick={() => setOpenId(x.id)} className={`flex w-full gap-3 px-4 py-3.5 text-left transition ${openId === x.id ? 'bg-[#F3F6FF]' : 'hover:bg-[#FAFBFD]'}`}>
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${isBusiness(x.topic) ? 'bg-[#E5F5EC] text-[#17703D]' : 'bg-[#EAF0FF] text-[#2647B8]'}`}>{x.name.split(' ').map((n) => n[0]).join('')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2"><b className="truncate text-[14px]">{x.name}</b><span className="shrink-0 text-[12px] text-muted-2">{ago(x.date)}</span></span>
                      <span className="block text-[12.5px] font-semibold text-navy-500">{TOPIC_LABEL[x.topic]}{x.company && ` · ${x.company}`}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-2">{x.msg}</span>
                    </span>
                    {x.status === 'New' && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-brand" aria-label="New" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          {!e ? <Empty text="Select an enquiry to read it." /> : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-brand">{TOPIC_LABEL[e.topic]}</span>
                  <h2 className="font-head text-[22px] font-bold">{e.name}</h2>
                  <p className="text-[13.5px] text-muted-2">{[e.company, e.city].filter(Boolean).join(' · ')} · {ago(e.date)}</p>
                </div>
                <Badge>{e.status}</Badge>
              </div>
              <p className="rounded-2xl bg-[#F6F7FB] p-4 text-[15px] leading-relaxed">{e.msg}</p>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#F3F5FA] px-3.5 py-2 text-[13.5px] font-semibold"><Icon.phone size={16} /> {e.phone}</a>
                <a href={`mailto:${e.email}?subject=${encodeURIComponent('Re: your DriftOn enquiry')}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#F3F5FA] px-3.5 py-2 text-[13.5px] font-semibold"><Icon.mail size={16} /> Reply by email</a>
                <a href={`https://wa.me/91${e.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#E5F5EC] px-3.5 py-2 text-[13.5px] font-semibold text-[#17703D]">WhatsApp</a>
              </div>
              <div className="border-t border-[#EEF0F5] pt-4">
                <span className="mb-2 block text-[13px] font-semibold">Mark as</span>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => <Btn key={s} variant={e.status === s ? 'primary' : 'ghost'} onClick={() => update('enquiries', e.id, { status: s }, `Marked ${s}`)}>{s}</Btn>)}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
