import { useState } from 'react';
import { useAdmin } from '../store.jsx';
import { Badge, Btn, Card, Drawer, Field, Help, Icon, LOW_STOCK, PageHeader, Toggle, inputCls, inr } from '../ui.jsx';

export default function Products() {
  const { data, update } = useAdmin();
  const [edit, setEdit] = useState(null);
  const save = () => { update('products', edit.id, { name: edit.name, price: Number(edit.price) || 0, stock: Number(edit.stock) || 0, tag: edit.tag }, `${edit.name} updated`); setEdit(null); };

  return (
    <>
      <PageHeader title="Products" sub="Price, stock and visibility of each roll on." />
      {(() => {
        const low = data.products.filter((p) => p.active && p.stock <= LOW_STOCK);
        return low.length > 0 ? (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#F5C2C2] bg-[#FDF2F2] p-4 text-[#8F1D1D]">
            <span className="mt-0.5 shrink-0"><Icon.alert size={20} /></span>
            <div className="text-[13.5px]"><b className="block text-[14.5px]">Low stock — please refill soon</b>
              {low.map((p) => `${p.name}: ${p.stock} left`).join(' · ')}</div>
          </div>
        ) : null;
      })()}
      <Help>Click <b>Edit</b> to change a price or stock. Turn <b>Visible</b> off to hide a roll on from the website (for example when it is out of stock). Stock of {LOW_STOCK} or less shows a red warning.</Help>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.products.map((p) => {
          const low = p.stock <= LOW_STOCK;
          return (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <div className="relative flex h-[200px] items-center justify-center" style={{ background: `linear-gradient(180deg, ${p.bg}, #fff)` }}>
                <img src={p.image} alt="" className="h-[86%] w-auto object-contain" />
                <span className="absolute left-3 top-3"><Badge tone={p.active ? 'Active' : 'Inactive'}>{p.active ? 'Live on site' : 'Hidden'}</Badge></span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div><b className="block font-head text-[16px]">{p.name}</b><span className="text-[12.5px] text-muted-2">{p.tag}</span></div>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div className="rounded-xl bg-[#F6F7FB] p-2.5"><span className="text-muted-2">Price</span><b className="block text-[16px]">{inr(p.price)}</b></div>
                  <div className={`rounded-xl p-2.5 ${low ? 'bg-[#FDECEC] ring-1 ring-[#F5C2C2]' : 'bg-[#F6F7FB]'}`}><span className={low ? 'font-semibold text-[#B42318]' : 'text-muted-2'}>{p.stock === 0 ? 'Out of stock' : low ? 'Low stock' : 'In stock'}</span><b className="block text-[16px]">{p.stock}</b></div>
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
