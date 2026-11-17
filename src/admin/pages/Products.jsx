import { useState } from 'react';
import { useAdmin } from '../store.jsx';
import { Badge, Btn, Card, Drawer, Field, Icon, PageHeader, Toggle, inputCls, inr } from '../ui.jsx';

export default function Products() {
  const { data, update } = useAdmin();
  const [edit, setEdit] = useState(null);
  const save = () => { update('products', edit.id, { name: edit.name, price: Number(edit.price) || 0, stock: Number(edit.stock) || 0, tag: edit.tag }, `${edit.name} updated`); setEdit(null); };

  return (
    <>
      <PageHeader title="Products" sub="Price, stock and visibility of each roll on." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.products.map((p) => {
          const low = p.stock < 25;
          return (
            <Card key={p.id} className="group flex flex-col overflow-hidden transition hover:shadow-md">
              <a
                href={`/#${p.id}`}
                target="_blank"
                rel="noreferrer"
                title={`View ${p.name} on Home Page`}
                className="relative flex h-[200px] items-center justify-center transition group-hover:opacity-95"
                style={{ background: `linear-gradient(180deg, ${p.bg}, #fff)` }}
              >
                <img src={p.image} alt="" className="h-[86%] w-auto object-contain transition group-hover:scale-105" />
                <span className="absolute left-3 top-3"><Badge tone={p.active ? 'Active' : 'Inactive'}>{p.active ? 'Live on site' : 'Hidden'}</Badge></span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-navy-900 shadow-sm opacity-0 group-hover:opacity-100 transition">
                  <Icon.external size={14} />
                </span>
              </a>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <a
                      href={`/#${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block font-head text-[16px] font-bold text-navy-900 hover:text-brand"
                    >
                      {p.name} ↗
                    </a>
                    <span className="text-[12.5px] text-muted-2">{p.tag}</span>
                  </div>
                  <a
                    href={`/#${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-semibold text-brand hover:underline"
                  >
                    View on Home →
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div className="rounded-xl bg-[#F6F7FB] p-2.5"><span className="text-muted-2">Price</span><b className="block text-[16px]">{inr(p.price)}</b></div>
                  <div className={`rounded-xl p-2.5 ${low ? 'bg-[#FFF4E5]' : 'bg-[#F6F7FB]'}`}><span className={low ? 'text-[#9A5A00]' : 'text-muted-2'}>{low ? 'Low stock' : 'In stock'}</span><b className="block text-[16px]">{p.stock}</b></div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
                    <Toggle checked={p.active} onChange={(v) => update('products', p.id, { active: v }, v ? `${p.short} is live` : `${p.short} hidden from site`)} label={`Show ${p.name}`} /> Visible
                  </label>
                  <Btn variant="ghost" className="min-h-9 px-3" onClick={() => setEdit({ ...p })}><Icon.edit size={16} /> Edit</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Drawer open={!!edit} onClose={() => setEdit(null)} title="Edit product" sub={edit?.name}
        footer={<><Btn variant="green" onClick={save}>Save changes</Btn><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn></>}>
        {edit && (
          <div className="flex flex-col gap-4">
            <div className="flex h-[180px] items-center justify-center rounded-2xl" style={{ background: edit.bg }}><img src={edit.image} alt="" className="h-[85%] w-auto" /></div>
            <Field label="Product name"><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Tag" hint="Short line shown on the product page, e.g. Floral · Bestseller"><input className={inputCls} value={edit.tag} onChange={(e) => setEdit({ ...edit, tag: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₹)"><input className={inputCls} inputMode="numeric" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value.replace(/\D/g, '') })} /></Field>
              <Field label="Stock"><input className={inputCls} inputMode="numeric" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: e.target.value.replace(/\D/g, '') })} /></Field>
            </div>
            <Field label="Ingredients"><textarea rows={4} className={`${inputCls} py-2.5`} value={edit.ingredients.join(', ')} onChange={(e) => setEdit({ ...edit, ingredients: e.target.value.split(',').map((x) => x.trim()) })} /></Field>
            <div className="rounded-xl border border-dashed border-[#D3D8E4] p-4 text-center text-[13px] text-muted-2">Photo upload will work once the database / storage is connected.</div>
          </div>
        )}
      </Drawer>
    </>
  );
}
