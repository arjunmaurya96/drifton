import { useState } from 'react';
import { useAdmin } from '../store.jsx';
import { Badge, Btn, Card, Drawer, Field, Icon, PageHeader, Toggle, inputCls } from '../ui.jsx';

export default function Offers() {
  const { data, update, add, remove } = useAdmin();
  const [form, setForm] = useState(null);

  const saveCoupon = () => {
    const code = form.code.trim().toUpperCase();
    if (!code || !Number(form.off)) return;
    if (data.coupons.some((c) => c.code === code)) update('coupons', code, { off: Number(form.off), note: form.note }, `${code} updated`);
    else add('coupons', { code, off: Number(form.off), note: form.note, uses: 0, active: true }, `${code} created`);
    setForm(null);
  };

  return (
    <>
      <PageHeader title="Offers & coupons" sub="Change cart offers and discount codes without touching code." />

      <h2 className="mb-3 font-head text-[17px] font-bold">Cart offers</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.offers.map((o) => (
          <Card key={o.id} className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div><b className="block font-head text-[16px]">{o.title}</b><span className="text-[13px] text-muted-2">{o.desc}</span></div>
              <Toggle checked={o.active} onChange={(v) => update('offers', o.id, { active: v }, `${o.title} ${v ? 'on' : 'off'}`)} label={o.title} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-muted-2">Value</span>
              <span className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted-2">₹</span>
                <input inputMode="numeric" value={o.value} onChange={(e) => update('offers', o.id, { value: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                  onBlur={() => update('offers', o.id, {}, 'Offer saved')} className={`${inputCls} w-[130px] pl-7 font-semibold`} />
              </span>
              <span className="text-[13px] text-muted-2">{o.unit.replace('₹', '').trim()}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="font-head text-[17px] font-bold">Coupon codes</h2>
        <Btn variant="green" onClick={() => setForm({ code: '', off: '', note: '' })}><Icon.plus size={18} /> New coupon</Btn>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2"><tr><th className="px-5 py-3 font-semibold">Code</th><th className="px-3 py-3 font-semibold">Discount</th><th className="px-3 py-3 font-semibold">Note</th><th className="px-3 py-3 font-semibold">Used</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-5 py-3" /></tr></thead>
            <tbody>
              {data.coupons.map((c) => (
                <tr key={c.code} className="border-t border-[#EEF0F5]">
                  <td className="px-5 py-3.5"><span className="rounded-lg border border-dashed border-navy-700/40 bg-[#F3F5FA] px-2.5 py-1 font-mono text-[13px] font-bold">{c.code}</span></td>
                  <td className="px-3 py-3.5 font-semibold">₹{c.off} off</td>
                  <td className="px-3 py-3.5 text-muted">{c.note}</td>
                  <td className="px-3 py-3.5 text-muted">{c.uses} times</td>
                  <td className="px-3 py-3.5"><span className="flex items-center gap-2"><Toggle checked={c.active} onChange={(v) => update('coupons', c.code, { active: v }, `${c.code} ${v ? 'active' : 'paused'}`)} label={`${c.code} active`} /><Badge tone={c.active ? 'Active' : 'Inactive'}>{c.active ? 'Active' : 'Paused'}</Badge></span></td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex gap-1">
                      <button onClick={() => setForm({ ...c, off: String(c.off) })} aria-label={`Edit ${c.code}`} className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#F3F5FA] hover:text-navy-900"><Icon.edit size={16} /></button>
                      <button onClick={() => remove('coupons', c.code, `${c.code} deleted`)} aria-label={`Delete ${c.code}`} className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#FDECEC] hover:text-[#B42318]"><Icon.trash size={16} /></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer open={!!form} onClose={() => setForm(null)} title={form && data.coupons.some((c) => c.code === form.code) ? 'Edit coupon' : 'New coupon'}
        footer={<><Btn variant="green" onClick={saveCoupon}>Save coupon</Btn><Btn variant="ghost" onClick={() => setForm(null)}>Cancel</Btn></>}>
        {form && (
          <div className="flex flex-col gap-4">
            <Field label="Coupon code" hint="Customers type this at checkout. Letters and numbers only."><input className={`${inputCls} uppercase`} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/[^a-z0-9]/gi, '') })} placeholder="e.g. FRESH100" /></Field>
            <Field label="Discount (₹)"><input className={inputCls} inputMode="numeric" value={form.off} onChange={(e) => setForm({ ...form, off: e.target.value.replace(/\D/g, '') })} placeholder="100" /></Field>
            <Field label="Note (for you)"><input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Instagram followers" /></Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
