import { useState } from 'react';
import { Search, Filter, X, Calendar, AlertCircle, HandCoins, ChevronDown } from 'lucide-react';
import type { OrderStatus } from '@/lib/data';
import { demoCounterparties, demoDrivers } from '@/lib/data';
import { demoEmployees } from '@/lib/permissions';

export type StatusFilter = OrderStatus | 'all';
export type DebtFilter = 'none' | 'client_debt' | 'our_debt';

export interface ExtFilters {
  query: string;
  counterparty: string;
  driver: string;
  manager: string;
  dateFrom: string;
  dateTo: string;
}

export const emptyExt: ExtFilters = {
  query: '',
  counterparty: '',
  driver: '',
  manager: '',
  dateFrom: '',
  dateTo: '',
};

export const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'in_work', label: 'В работе' },
  { id: 'delivered', label: 'Доставлено' },
  { id: 'problem', label: 'Проблема' },
  { id: 'paid', label: 'Оплачено' },
];

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all';

interface OrdersFilterBarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  debtFilter: DebtFilter;
  onDebtFilterChange: (debt: DebtFilter) => void;
  ext: ExtFilters;
  onExtChange: <K extends keyof ExtFilters>(field: K, value: ExtFilters[K]) => void;
  onReset: () => void;
  activeCount: number;
  statusCounts: Record<StatusFilter, number>;
  clientDebtCount: number;
  ourDebtCount: number;
}

export default function OrdersFilterBar({
  statusFilter,
  onStatusFilterChange,
  debtFilter,
  onDebtFilterChange,
  ext,
  onExtChange,
  onReset,
  activeCount,
  statusCounts,
  clientDebtCount,
  ourDebtCount,
}: OrdersFilterBarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const advancedActive = Boolean(ext.counterparty || ext.driver || ext.manager || ext.dateFrom || ext.dateTo);

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onStatusFilterChange(f.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? 'bg-white border-brand-200 text-brand-700 shadow-card'
                    : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {f.label}
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {statusCounts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={ext.query}
              onChange={(e) => onExtChange('query', e.target.value)}
              placeholder="Поиск по № заявки…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            />
          </div>
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
              advancedOpen || advancedActive
                ? 'bg-brand-50 border-brand-200 text-brand-700'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Расширенные фильтры
            {advancedActive && <span className="w-2 h-2 rounded-full bg-brand-500" />}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${advancedOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out ${
          advancedOpen ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Контрагент</label>
                <select value={ext.counterparty} onChange={(e) => onExtChange('counterparty', e.target.value)} className={inputClass}>
                  <option value="">Все контрагенты</option>
                  {demoCounterparties.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Водитель</label>
                <select value={ext.driver} onChange={(e) => onExtChange('driver', e.target.value)} className={inputClass}>
                  <option value="">Все водители</option>
                  {demoDrivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Менеджер</label>
                <select value={ext.manager} onChange={(e) => onExtChange('manager', e.target.value)} className={inputClass}>
                  <option value="">Все менеджеры</option>
                  {demoEmployees.filter((emp) => emp.role !== 'driver').map((emp) => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Период с</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="date" value={ext.dateFrom} onChange={(e) => onExtChange('dateFrom', e.target.value)} className={`${inputClass} pl-9`} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Период по</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="date" value={ext.dateTo} onChange={(e) => onExtChange('dateTo', e.target.value)} className={`${inputClass} pl-9`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">По деньгам:</span>
        <button
          onClick={() => onDebtFilterChange(debtFilter === 'client_debt' ? 'none' : 'client_debt')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
            debtFilter === 'client_debt'
              ? 'bg-warn-50 border-warn-200 text-warn-700 shadow-card'
              : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Долги клиентов
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
              debtFilter === 'client_debt' ? 'bg-warn-100 text-warn-700' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {clientDebtCount}
          </span>
        </button>
        <button
          onClick={() => onDebtFilterChange(debtFilter === 'our_debt' ? 'none' : 'our_debt')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
            debtFilter === 'our_debt'
              ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-card'
              : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          Наши долги
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
              debtFilter === 'our_debt' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {ourDebtCount}
          </span>
        </button>

        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-err-600 bg-white border border-err-200 hover:bg-err-50 transition-colors animate-fade-in"
          >
            <X className="w-3.5 h-3.5" />
            Сбросить фильтры
          </button>
        )}
      </div>
    </div>
  );
}
