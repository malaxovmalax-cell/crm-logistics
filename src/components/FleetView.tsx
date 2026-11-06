import { useState } from 'react';
import { Truck as TruckIcon, User, UserCircle, Pencil, Trash2, X, Link2, Plus, Package } from 'lucide-react';
import {
  demoTrucks, demoTrailers, demoDrivers,
  TRUCK_STATUS_LABELS, TRUCK_STATUS_META,
  TRAILER_STATUS_LABELS, TRAILER_STATUS_META,
  DRIVER_STATUS_LABELS, DRIVER_STATUS_META,
  type Truck, type Trailer, type Driver,
} from '@/lib/data';

function StatusPill({ label, meta }: { label: string; meta: { dot: string; badge: string } }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${meta.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {label}
    </span>
  );
}

export default function FleetView() {
  const [trucks, setTrucks] = useState<Truck[]>(demoTrucks);
  const [trailers, setTrailers] = useState<Trailer[]>(demoTrailers);
  const [drivers, setDrivers] = useState<Driver[]>(demoDrivers);
  const [editTruck, setEditTruck] = useState<Truck | null>(null);
  const [editTrailer, setEditTrailer] = useState<Trailer | null>(null);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const saveTruck = (updated: Truck) => {
    setTrucks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditTruck(null);
  };
  const deleteTruck = (id: string) => setTrucks((prev) => prev.filter((t) => t.id !== id));

  const saveTrailer = (updated: Trailer) => {
    setTrailers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditTrailer(null);
  };
  const deleteTrailer = (id: string) => setTrailers((prev) => prev.filter((t) => t.id !== id));

  const linkTrailer = (truckId: string, trailerId: string) => {
    setTrucks((prev) => prev.map((t) => (t.id === truckId ? { ...t, trailerId: trailerId || undefined } : t)));
  };

  const saveDriver = (updated: Driver) => {
    setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setEditDriver(null);
  };
  const deleteDriver = (id: string) => setDrivers((prev) => prev.filter((d) => d.id !== id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Мой Автопарк</h1>
        <p className="text-sm text-slate-500 mt-1">Тягачи, прицепы и водители</p>
      </div>

      {/* Trucks */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-50 text-brand-600">
            <TruckIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Тягачи</h2>
            <p className="text-xs text-slate-400">Собственные тягачи · {trucks.length} ед.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/40">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Марка</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Госномер</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Тип кузова</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Привязанный прицеп</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Статус</th>
                <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {trucks.map((t) => {
                const linkedTrailer = trailers.find((tr) => tr.id === t.trailerId);
                return (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">{t.brand}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 font-mono whitespace-nowrap">{t.plate}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{t.bodyType}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={t.trailerId || ''}
                        onChange={(e) => linkTrailer(t.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                      >
                        <option value="">— не привязан —</option>
                        {trailers.map((tr) => (
                          <option key={tr.id} value={tr.id}>{tr.plate} · {tr.type}</option>
                        ))}
                      </select>
                      {linkedTrailer && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600">
                          <Link2 className="w-3 h-3" />
                          {linkedTrailer.type}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><StatusPill label={TRUCK_STATUS_LABELS[t.status]} meta={TRUCK_STATUS_META[t.status]} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditTruck(t)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTruck(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-err-50 hover:text-err-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trailers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-50 text-accent-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Прицепы / Полуприцепы</h2>
            <p className="text-xs text-slate-400">Прицепной состав · {trailers.length} ед.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/40">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Госномер</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Тип</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Объём, м³</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Грузоподъёмность, т</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Статус</th>
                <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {trailers.map((tr) => {
                const linkedTruck = trucks.find((t) => t.trailerId === tr.id);
                return (
                  <tr key={tr.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-600 font-mono whitespace-nowrap">{tr.plate}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{tr.type}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{tr.volume}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{tr.capacity}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <StatusPill label={TRAILER_STATUS_LABELS[tr.status]} meta={TRAILER_STATUS_META[tr.status]} />
                        {linkedTruck && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600">
                            <Link2 className="w-3 h-3" />
                            {linkedTruck.brand}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditTrailer(tr)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTrailer(tr.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-err-50 hover:text-err-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drivers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-warn-50 text-warn-600">
            <UserCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Водители</h2>
            <p className="text-xs text-slate-400">Штатные водители · {drivers.length} чел.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/40">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">ФИО</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Телефон</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Вод. удостоверение</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Паспорт</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Статус</th>
                <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 shrink-0">
                        <User className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{d.name}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap font-mono">{d.phone}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap font-mono">{d.license}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap font-mono">{d.passport}</td>
                  <td className="px-5 py-3.5"><StatusPill label={DRIVER_STATUS_LABELS[d.status]} meta={DRIVER_STATUS_META[d.status]} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setEditDriver(d)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteDriver(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-err-50 hover:text-err-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modals */}
      {editTruck && (
        <EditModal title="Редактировать тягач" onClose={() => setEditTruck(null)} onSave={() => saveTruck(editTruck)}>
          <InputField label="Марка" value={editTruck.brand} onChange={(v) => setEditTruck({ ...editTruck, brand: v })} />
          <InputField label="Госномер" value={editTruck.plate} onChange={(v) => setEditTruck({ ...editTruck, plate: v })} />
          <InputField label="Тип кузова" value={editTruck.bodyType} onChange={(v) => setEditTruck({ ...editTruck, bodyType: v })} />
          <InputField label="Грузоподъёмность, т" type="number" value={String(editTruck.capacity)} onChange={(v) => setEditTruck({ ...editTruck, capacity: Number(v) || 0 })} />
          <SelectField label="Статус" value={editTruck.status} onChange={(v) => setEditTruck({ ...editTruck, status: v as Truck['status'] })} options={Object.entries(TRUCK_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </EditModal>
      )}

      {editTrailer && (
        <EditModal title="Редактировать прицеп" onClose={() => setEditTrailer(null)} onSave={() => saveTrailer(editTrailer)}>
          <InputField label="Госномер" value={editTrailer.plate} onChange={(v) => setEditTrailer({ ...editTrailer, plate: v })} />
          <InputField label="Тип" value={editTrailer.type} onChange={(v) => setEditTrailer({ ...editTrailer, type: v })} />
          <InputField label="Объём, м³" type="number" value={String(editTrailer.volume)} onChange={(v) => setEditTrailer({ ...editTrailer, volume: Number(v) || 0 })} />
          <InputField label="Грузоподъёмность, т" type="number" value={String(editTrailer.capacity)} onChange={(v) => setEditTrailer({ ...editTrailer, capacity: Number(v) || 0 })} />
          <SelectField label="Статус" value={editTrailer.status} onChange={(v) => setEditTrailer({ ...editTrailer, status: v as Trailer['status'] })} options={Object.entries(TRAILER_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </EditModal>
      )}

      {editDriver && (
        <EditModal title="Редактировать водителя" onClose={() => setEditDriver(null)} onSave={() => saveDriver(editDriver)}>
          <InputField label="ФИО" value={editDriver.name} onChange={(v) => setEditDriver({ ...editDriver, name: v })} />
          <InputField label="Телефон" value={editDriver.phone} onChange={(v) => setEditDriver({ ...editDriver, phone: v })} />
          <InputField label="Вод. удостоверение" value={editDriver.license} onChange={(v) => setEditDriver({ ...editDriver, license: v })} />
          <InputField label="Паспорт" value={editDriver.passport} onChange={(v) => setEditDriver({ ...editDriver, passport: v })} />
          <SelectField label="Статус" value={editDriver.status} onChange={(v) => setEditDriver({ ...editDriver, status: v as Driver['status'] })} options={Object.entries(DRIVER_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </EditModal>
      )}
    </div>
  );
}

function EditModal({ title, children, onClose, onSave }: { title: string; children: React.ReactNode; onClose: () => void; onSave: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-pop animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">{children}</div>
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Отмена</button>
          <button onClick={onSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all">
        {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </div>
  );
}
