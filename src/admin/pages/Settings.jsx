import { useState } from 'react';
import { useAdmin } from '../store.jsx';
import { Btn, Card, Field, PageHeader, inputCls } from '../ui.jsx';

export default function Settings() {
  const { data, saveSettings, reset } = useAdmin();
  const [f, setF] = useState(data.settings);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const sections = [
    ['Store', 'Basic details shown across the website.', [['storeName', 'Store name'], ['legalName', 'Legal business name'], ['email', 'Customer care email'], ['phone', 'Customer care phone'], ['hours', 'Working hours'], ['address', 'Registered address', true]]],
    ['Announcement bar', 'The thin bar at the very top of the website.', [['announcement', 'Text', true]]],
    ['Manufacturer', 'Shown in the footer and on the Terms page.', [['manufacturer', 'Manufacturer name'], ['licence', 'Licence / registration no.'], ['manufacturerAddress', 'Manufacturer address', true]]],
  ];

  return (
    <>
      <PageHeader title="Settings" sub="Business information and website text.">
        <Btn variant="green" onClick={() => saveSettings(f)}>Save changes</Btn>
      </PageHeader>
      <div className="flex flex-col gap-4">
        {sections.map(([title, sub, fields]) => (
          <Card key={title} className="grid grid-cols-1 gap-5 p-5 sm:p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div><h2 className="font-head text-[17px] font-bold">{title}</h2><p className="mt-1 text-[13.5px] text-muted-2">{sub}</p></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(([k, label, wide]) => (
                <Field key={k} label={label} className={wide ? 'sm:col-span-2' : ''}>
                  {wide ? <textarea rows={2} className={`${inputCls} py-2.5`} value={f[k]} onChange={set(k)} /> : <input className={inputCls} value={f[k]} onChange={set(k)} />}
                </Field>
              ))}
            </div>
          </Card>
        ))}
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><h2 className="font-head text-[17px] font-bold">Demo data</h2><p className="text-[13.5px] text-muted-2">Undo every change you made in this preview.</p></div>
          <Btn variant="danger" onClick={() => { reset(); setF(data.settings); }}>Reset demo data</Btn>
        </Card>
      </div>
    </>
  );
}
