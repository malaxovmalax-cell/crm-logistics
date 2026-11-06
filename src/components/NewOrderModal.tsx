import { useEffect, useState } from 'react';
import { X, Plus, Calendar, User, Truck, Wallet, Banknote, Tag, TrendingUp, CreditCard, ClipboardCheck, Building2 } from 'lucide-react';
import type { Order, OrderStatus, VatType, ClientPayStatus, CarrierPayStatus, CarrierSource } from '@/lib/data';
import {
  STATUS_LABELS,
  CLIENT_PAY_LABELS,
  CARRIER_PAY_LABELS,
  CLIENT_PAY_OPTIONS,
  CARRIER_PAY_OPTIONS,
  OUR_ENTITIES,
  demoTrucks,
  demoTrailers,
  demoDrivers,
  formatCurrency,
  netOfVat,
} from '@/lib/data';
import AddressField from '@/components/AddressField';
import VatSelector from '@/components/VatSelector';
import { useAccess } from '@/lib/access';
import { demoEmployees } from '@/lib/permissions';
import { UserCheck } from 'lucide-react';

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (order: Order) => void;
}

const empty = {
  client: '',
  from: '',
  to: '',
  fromZip: '',
  toZip: '',
  carrier: '',
  carrierSource: 'hired' as CarrierSource,
  truckId: '',
  trailerId: '',
  driverId: '',
  ourEntity: 'ooo',
  cost: '',
  carrierCost: '',
  costVat: 'vat20' as VatType,
  carrierCostVat: 'vat20' as VatType,
  date: new Date().toISOString().slice(0, 10),
  status: 'in_work' as OrderStatus,
  clientPayStatus: 'unpaid' as ClientPayStatus,
  clientPaidAmount: '',
  carrierPayStatus: 'unpaid' as CarrierPayStatus,
  carrierPaidAmount: '',
};

export default function NewOrderModal({ open, onClose, onCreate }: NewOrderModalProps) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { currentRole } = useAccess();

  const currentManager = (() => {
    const emp = demoEmployees.find((e) => e.role === currentRole && e.status === 'active');
    return emp || demoEmployees[0];
  })();

  useEffect(() => {
    if (open) {
      setForm({ ...empty, ourEntity: OUR_ENTITIES[0].id });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = (key: keyof typeof empty, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const costNum = Number(form.cost) || 0;
  const carrierNum = Number(form.carrierCost) || 0;
  const clientNet = netOfVat(costNum, form.costVat);
  const carrierNet = netOfVat(carrierNum, form.carrierCostVat);
  const margin = Math.round((clientNet - carrierNet) * 100) / 100;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.client.trim()) next.client = 'Укажите клиента';
    if (!form.from.trim()) next.from = 'Укажите пункт отправления';
    if (!form.to.trim()) next.to = 'Укажите пункт назначения';
    if (form.carrierSource === 'hired' && !form.carrier.trim()) next.carrier = 'Укажите перевозчика';
    if (form.carrierSource === 'own' && !form.truckId) next.truckId = 'Выберите машину';
    if (form.carrierSource === 'own' && !form.driverId) next.driverId = 'Выберите водителя';
    if (!form.cost || Number(form.cost) <= 0) next.cost = 'Введите корректную стоимость';
    if (!form.carrierCost || Number(form.carrierCost) < 0)
      next.carrierCost = 'Введите расход на перевозчика';
    if (!form.date) next.date = 'Выберите дату';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const isOwn = form.carrierSource === 'own';
    const truck = demoTrucks.find((t) => t.id === form.truckId);
    const driver = demoDrivers.find((d) => d.id === form.driverId);
    const carrierName = isOwn && truck && driver
      ? `${truck.brand} · ${driver.name}`
      : form.carrier.trim();
    const order: Order = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: form.date,
      client: form.client.trim(),
      from: form.from.trim(),
      to: form.to.trim(),
      fromZip: form.fromZip.trim(),
      toZip: form.toZip.trim(),
      carrier: carrierName,
      carrierSource: form.carrierSource,
      truckId: isOwn ? form.truckId : undefined,
      trailerId: isOwn ? (form.trailerId || undefined) : undefined,
      driverId: isOwn ? form.driverId : undefined,
      ourEntity: form.ourEntity,
      managerName: currentManager.name,
      managerId: currentManager.id,
      cost: Number(form.cost),
      costVat: form.costVat,
      carrierCost: Number(form.carrierCost),
      carrierCostVat: form.carrierCostVat,
      status: form.status,
      clientPayStatus: form.clientPayStatus,
      clientPaidAmount: form.clientPayStatus === 'partial' ? Number(form.clientPaidAmount) || 0 : 0,
      carrierPayStatus: form.carrierPayStatus,
      carrierPaidAmount: form.carrierPayStatus === 'planned' ? Number(form.carrierPaidAmount) || 0 : 0,
    };
    onCreate(order);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-pop animate-scale-in max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600">
              <Plus className="w-5 h-5" strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Новая заявка</h2>
              <p className="text-xs text-slate-400">Заполните данные о перевозке</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Our entity */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Наша организация</label>
            <div className="flex flex-wrap gap-1.5">
              {OUR_ENTITIES.map((ent) => {
                const active = form.ourEntity === ent.id;
                return (
                  <button
                    key={ent.id}
                    type="button"
                    onClick={() => update('ourEntity', ent.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      active
                        ? 'border-brand-300 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    {ent.name}
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {ent.vat ? 'с НДС' : 'без НДС'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manager (auto-filled) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Менеджер</label>
            <div className="relative sm:w-56">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={currentManager.name}
                readOnly
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm font-medium text-slate-600"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Назначается автоматически по текущей роли</p>
          </div>

          {/* Client + Carrier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Клиент</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => update('client', e.target.value)}
                  placeholder="ООО «Название»"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-sm placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.client ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
                  }`}
                />
              </div>
              {errors.client && <p className="mt-1 text-xs text-err-600 font-medium">{errors.client}</p>}
            </div>
          </div>

          {/* Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AddressField
              label="Откуда"
              city={form.from}
              zip={form.fromZip}
              error={errors.from}
              onCityChange={(v) => update('from', v)}
              onZipChange={(v) => update('fromZip', v)}
            />
            <AddressField
              label="Куда"
              city={form.to}
              zip={form.toZip}
              error={errors.to}
              onCityChange={(v) => update('to', v)}
              onZipChange={(v) => update('toZip', v)}
            />
          </div>

          {/* Carrier */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Перевозчик</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => update('carrierSource', 'hired')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  form.carrierSource === 'hired'
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <Truck className="w-4 h-4" />
                Наемный перевозчик
              </button>
              <button
                type="button"
                onClick={() => update('carrierSource', 'own')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  form.carrierSource === 'own'
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <Truck className="w-4 h-4" />
                Собственный транспорт
              </button>
            </div>

            {form.carrierSource === 'hired' ? (
              <>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.carrier}
                    onChange={(e) => update('carrier', e.target.value)}
                    placeholder="Транспортная компания"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-sm placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.carrier ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
                    }`}
                  />
                </div>
                {errors.carrier && <p className="mt-1 text-xs text-err-600 font-medium">{errors.carrier}</p>}
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Тягач</label>
                  <select
                    value={form.truckId}
                    onChange={(e) => update('truckId', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.truckId ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
                    }`}
                  >
                    <option value="">— выберите —</option>
                    {demoTrucks.filter((t) => t.status !== 'repair').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.brand} · {t.plate}
                      </option>
                    ))}
                  </select>
                  {errors.truckId && <p className="mt-1 text-xs text-err-600 font-medium">{errors.truckId}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Прицеп</label>
                  <select
                    value={form.trailerId}
                    onChange={(e) => update('trailerId', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 border-slate-200 focus:border-brand-400"
                  >
                    <option value="">— без прицепа —</option>
                    {demoTrailers.filter((tr) => tr.status !== 'repair').map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.plate} · {tr.type} · {tr.volume}м³
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Водитель</label>
                  <select
                    value={form.driverId}
                    onChange={(e) => update('driverId', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.driverId ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
                    }`}
                  >
                    <option value="">— выберите —</option>
                    {demoDrivers.filter((d) => d.status !== 'inactive').map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.driverId && <p className="mt-1 text-xs text-err-600 font-medium">{errors.driverId}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Finances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-600">Ставка клиента</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => update('cost', e.target.value)}
                  placeholder="0"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-sm placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.cost ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
                  }`}
                />
              </div>
              <VatSelector
                amount={costNum}
                vat={form.costVat}
                onChange={(v) => update('costVat', v)}
              />
              {costNum > 0 && form.costVat !== 'no_vat' && form.costVat !== 'vat0' && (
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60">
                  <p>
                    Чистыми (без НДС): <span className="font-semibold text-slate-700">{formatCurrency(clientNet)}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-600">Ставка перевозчика</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={form.carrierCost}
                  onChange={(e) => update('carrierCost', e.target.value)}
                  placeholder="0"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-sm placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.carrierCost ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
                  }`}
                />
              </div>
              <VatSelector
                amount={carrierNum}
                vat={form.carrierCostVat}
                onChange={(v) => update('carrierCostVat', v)}
              />
              {carrierNum > 0 && form.carrierCostVat !== 'no_vat' && form.carrierCostVat !== 'vat0' && (
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60">
                  <p>
                    Чистыми (без НДС): <span className="font-semibold text-slate-700">{formatCurrency(carrierNet)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Margin preview */}
          {costNum > 0 && carrierNum > 0 && (
            <div className="flex items-center justify-between bg-accent-50 border border-accent-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-600" />
                <span className="text-xs font-semibold text-accent-700">Маржа (без НДС)</span>
              </div>
              <span className={`text-base font-bold ${margin >= 0 ? 'text-accent-700' : 'text-err-600'}`}>
                {formatCurrency(margin)}
              </span>
            </div>
          )}

          {/* Payment status block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <CreditCard className="w-3.5 h-3.5" />
                Оплата от клиента
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CLIENT_PAY_OPTIONS.map((s) => {
                  const active = form.clientPayStatus === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('clientPayStatus', s)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        active
                          ? 'border-brand-300 bg-white text-brand-700 shadow-sm'
                          : 'border-slate-200 bg-white/60 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {CLIENT_PAY_LABELS[s]}
                    </button>
                  );
                })}
              </div>
              {form.clientPayStatus === 'partial' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Получено от клиента, ₽
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.clientPaidAmount}
                      onChange={(e) => update('clientPaidAmount', e.target.value)}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Оплата перевозчику
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CARRIER_PAY_OPTIONS.map((s) => {
                  const active = form.carrierPayStatus === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('carrierPayStatus', s)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        active
                          ? 'border-brand-300 bg-white text-brand-700 shadow-sm'
                          : 'border-slate-200 bg-white/60 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {CARRIER_PAY_LABELS[s]}
                    </button>
                  );
                })}
              </div>
              {form.carrierPayStatus === 'planned' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Выплачено перевозчику, ₽
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.carrierPaidAmount}
                      onChange={(e) => update('carrierPaidAmount', e.target.value)}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Дата</label>
            <div className="relative sm:w-56">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  errors.date ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
                }`}
              />
            </div>
            {errors.date && <p className="mt-1 text-xs text-err-600 font-medium">{errors.date}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Статус</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => {
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('status', s)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      active
                        ? 'border-brand-300 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" strokeWidth={2.4} />
            Создать заявку
          </button>
        </div>
      </div>
    </div>
  );
}
