import { useState } from 'react';
import { useAdmin } from '../store.jsx';
import { Badge, Btn, Card, Drawer, Empty, Field, Help, Icon, PageHeader, Toggle, inputCls } from '../ui.jsx';

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getCouponStatus(c) {
  if (!c.active) return { tone: 'Inactive', label: 'Paused' };
  const now = Date.now();
  if (c.validFrom) {
    const fromTime = new Date(c.validFrom).getTime();
    if (!isNaN(fromTime) && now < fromTime) {
      return { tone: 'Scheduled', label: 'Scheduled' };
    }
  }
  if (c.validUntil) {
    const untilTime = new Date(c.validUntil).getTime();
    if (!isNaN(untilTime) && now > untilTime) {
      return { tone: 'Expired', label: 'Expired' };
    }
  }
  return { tone: 'Active', label: 'Active' };
}

export default function Offers() {
  const { data, update, add, remove } = useAdmin();
  const [form, setForm] = useState(null);

  const saveCoupon = () => {
    const code = (form.code || '').trim();
    if (!code || !Number(form.off)) return;

    const patch = {
      code,
      off: Number(form.off),
      note: form.note || '',
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
    };

    const exists = data.coupons.some((c) => c.code.toUpperCase() === code.toUpperCase());
    if (exists) {
      update('coupons', code, patch, `${code} updated`);
    } else {
      add('coupons', { ...patch, uses: 0, active: true }, `${code} created`);
    }
    setForm(null);
  };

  return (
    <>
      <PageHeader title="Offers & coupons" sub="Change cart offers, special coupon codes, and date-time validity." />
      <Help>
        Coupons now support <b>special characters</b> (e.g. <code>SPECIAL@50</code>, <code>DRIFT#100</code>) and <b>exact date & time validity</b>. Turn a switch <b>off</b> to pause any offer or coupon.
      </Help>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-head text-[17px] font-bold">Cart offers</h2>
          <p className="text-[13px] text-muted-2">Customize offer titles, subtitle promo text, and discount pricing shown live in cart.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.offers.map((o) => (
          <Card key={o.id} className="flex flex-col gap-3.5 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="font-mono text-xs font-bold text-brand uppercase tracking-wider">{o.id}</span>
              <Toggle checked={o.active} onChange={(v) => update('offers', o.id, { active: v }, `${o.title || o.id} ${v ? 'on' : 'off'}`)} label={o.title || o.id} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-navy-900">Offer Title / Badge</label>
              <input
                className={inputCls}
                value={o.title || ''}
                onChange={(e) => update('offers', o.id, { title: e.target.value })}
                onBlur={() => update('offers', o.id, {}, 'Title saved')}
                placeholder="e.g. ⚡ Offer 1 · 2 Roll Ons"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-navy-900">Offer Subtitle / Promo Text</label>
              <input
                className={inputCls}
                value={o.desc || ''}
                onChange={(e) => update('offers', o.id, { desc: e.target.value })}
                onBlur={() => update('offers', o.id, {}, 'Description saved')}
                placeholder="e.g. Add another Natural fresh rollon starting ₹325 onwards"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-muted-2">Price</span>
                <span className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted-2">₹</span>
                  <input
                    inputMode="numeric"
                    value={o.value}
                    onChange={(e) => update('offers', o.id, { value: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                    onBlur={() => update('offers', o.id, {}, 'Offer saved')}
                    className={`${inputCls} w-[120px] pl-7 font-semibold`}
                  />
                </span>
                <span className="text-[12px] text-muted-2">{o.unit ? o.unit.replace('₹', '').trim() : ''}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-3 mt-8 flex items-center justify-between">
        <div>
          <h2 className="font-head text-[17px] font-bold">Coupon codes</h2>
          <p className="text-[13px] text-muted-2">Set custom discount codes, special characters, and active time windows.</p>
        </div>
        <Btn
          variant="green"
          onClick={() =>
            setForm({
              code: '',
              off: '',
              note: '',
              validFrom: '',
              validUntil: '',
            })
          }
        >
          <Icon.plus size={18} /> New coupon
        </Btn>
      </div>

      <Card className="overflow-hidden">
        {data.coupons.length === 0 && (
          <Empty
            icon={Icon.tag}
            text="No coupon codes yet"
            sub="Click “New coupon” to create a discount code with special characters or date-time schedule."
          />
        )}

        {/* Mobile cards */}
        <ul className="flex flex-col divide-y divide-[#EEF0F5] md:hidden">
          {data.coupons.map((c) => {
            const st = getCouponStatus(c);
            return (
              <li key={c.code} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-dashed border-navy-700/40 bg-[#F3F5FA] px-2.5 py-1 font-mono text-[13px] font-bold text-navy-900">
                      {c.code}
                    </span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <b className="text-[15px] font-bold text-brand-dark">₹{c.off} off</b>
                </div>

                <div className="text-[12.5px] text-muted">
                  {c.note && <span className="block font-medium">{c.note}</span>}
                  {(c.validFrom || c.validUntil) ? (
                    <div className="mt-1 flex flex-col gap-0.5 text-[11.5px] text-muted-2 bg-[#F8F9FC] p-2 rounded-lg border border-line">
                      {c.validFrom && <span>Starts: <b>{fmtDateTime(c.validFrom)}</b></span>}
                      {c.validUntil && <span>Expires: <b>{fmtDateTime(c.validUntil)}</b></span>}
                    </div>
                  ) : (
                    <span className="text-[11.5px] text-muted-2">No expiry (Always active)</span>
                  )}
                  <span className="mt-1 block text-[11.5px] text-muted-2">Used {c.uses || 0} times</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#F0F2F6]">
                  <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <Toggle
                      checked={c.active}
                      onChange={(v) => update('coupons', c.code, { active: v }, `${c.code} ${v ? 'active' : 'paused'}`)}
                      label={`${c.code} active`}
                    />
                    {c.active ? 'Enabled' : 'Disabled'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setForm({
                          ...c,
                          off: String(c.off),
                          validFrom: toLocalInput(c.validFrom),
                          validUntil: toLocalInput(c.validUntil),
                        })
                      }
                      aria-label={`Edit ${c.code}`}
                      className="flex size-9 items-center justify-center rounded-lg text-muted-2 hover:bg-[#F3F5FA]"
                    >
                      <Icon.edit size={17} />
                    </button>
                    <button
                      onClick={() => remove('coupons', c.code, `${c.code} deleted`)}
                      aria-label={`Delete ${c.code}`}
                      className="flex size-9 items-center justify-center rounded-lg text-muted-2 hover:bg-[#FDECEC] hover:text-[#B42318]"
                    >
                      <Icon.trash size={17} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="bg-[#F8F9FC] text-[12px] uppercase tracking-wider text-muted-2">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-3 py-3 font-semibold">Discount</th>
                <th className="px-3 py-3 font-semibold">Validity Schedule (Date & Time)</th>
                <th className="px-3 py-3 font-semibold">Campaign Note</th>
                <th className="px-3 py-3 font-semibold">Used</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.coupons.map((c) => {
                const st = getCouponStatus(c);
                return (
                  <tr key={c.code} className="border-t border-[#EEF0F5] hover:bg-[#FAFBFD]">
                    <td className="px-5 py-3.5">
                      <span className="rounded-lg border border-dashed border-navy-700/40 bg-[#F3F5FA] px-2.5 py-1 font-mono text-[13px] font-bold text-navy-900">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-bold text-navy-900">₹{c.off} off</td>
                    <td className="px-3 py-3.5">
                      {c.validFrom || c.validUntil ? (
                        <div className="flex flex-col text-[12px] leading-tight text-muted">
                          {c.validFrom && (
                            <span>
                              <b className="font-semibold text-navy-900">From:</b> {fmtDateTime(c.validFrom)}
                            </span>
                          )}
                          {c.validUntil && (
                            <span>
                              <b className="font-semibold text-navy-900">Until:</b> {fmtDateTime(c.validUntil)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12.5px] text-muted-2">Always valid (No expiry)</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-muted max-w-[180px] truncate">{c.note || '—'}</td>
                    <td className="px-3 py-3.5 text-muted">{c.uses || 0} times</td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-2">
                        <Toggle
                          checked={c.active}
                          onChange={(v) => update('coupons', c.code, { active: v }, `${c.code} ${v ? 'active' : 'paused'}`)}
                          label={`${c.code} active`}
                        />
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex gap-1">
                        <button
                          onClick={() =>
                            setForm({
                              ...c,
                              off: String(c.off),
                              validFrom: toLocalInput(c.validFrom),
                              validUntil: toLocalInput(c.validUntil),
                            })
                          }
                          aria-label={`Edit ${c.code}`}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#F3F5FA] hover:text-navy-900"
                        >
                          <Icon.edit size={16} />
                        </button>
                        <button
                          onClick={() => remove('coupons', c.code, `${c.code} deleted`)}
                          aria-label={`Delete ${c.code}`}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-2 hover:bg-[#FDECEC] hover:text-[#B42318]"
                        >
                          <Icon.trash size={16} />
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Drawer: Create / Edit Coupon with Special Characters & Date-Time Schedule */}
      <Drawer
        open={!!form}
        onClose={() => setForm(null)}
        title={form && data.coupons.some((c) => c.code.toUpperCase() === (form.code || '').trim().toUpperCase()) ? 'Edit coupon' : 'New coupon'}
        footer={
          <>
            <Btn variant="green" onClick={saveCoupon}>
              Save coupon
            </Btn>
            <Btn variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Btn>
          </>
        }
      >
        {form && (
          <div className="flex flex-col gap-4">
            <Field
              label="Coupon code"
              hint="Customers type this at checkout. Special characters allowed (e.g. SPECIAL@50, DRIFT#100, SUMMER_26, SAVE-NOW!)."
            >
              <input
                className={`${inputCls} font-mono font-bold tracking-wide`}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.trimStart() })}
                placeholder="e.g. SPECIAL@50"
                required
              />
            </Field>

            <Field label="Discount amount (₹)" hint="Flat rupee discount applied to customer's order.">
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.off}
                onChange={(e) => setForm({ ...form, off: e.target.value.replace(/\D/g, '') })}
                placeholder="100"
                required
              />
            </Field>

            <Field label="Campaign note / Description" hint="For internal identification (e.g. Flash Weekend Sale, Creator code).">
              <input
                className={inputCls}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Festival Flash Sale"
              />
            </Field>

            {/* Date & Time Validity Section */}
            <div className="rounded-2xl border border-line bg-[#F8F9FC] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <b className="block text-[13.5px] font-bold text-navy-900">Validity Schedule (Date & Time)</b>
                  <span className="text-[12px] text-muted-2">Coupon will only be active during this exact period.</span>
                </div>
                {(form.validFrom || form.validUntil) && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, validFrom: '', validUntil: '' })}
                    className="text-xs font-semibold text-[#B42318] hover:underline cursor-pointer"
                  >
                    Clear Schedule
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Valid From (Start Date & Time)" hint="Leave blank to activate immediately">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={form.validFrom || ''}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  />
                </Field>

                <Field label="Valid Until (Expiry Date & Time)" hint="Leave blank for no expiration">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={form.validUntil || ''}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
