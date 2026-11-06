import { useState } from 'react';
import { Search, Building2, Truck, Phone, Mail, MapPin, Briefcase, Download, Trash2, Lock } from 'lucide-react';
import type { Counterparty } from '@/lib/data';
import { useAccess } from '@/lib/access';

interface CounterpartiesViewProps {
  counterparties: Counterparty[];
}

type Tab = 'all' | 'client' | 'carrier';

export default function CounterpartiesView({ counterparties }: CounterpartiesViewProps) {
  const { can } = useAccess();
  const canExport = can('counterparties.export');
  const canDelete = can('counterparties.delete');
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  const filtered = counterparties.filter((c) => {
    if (tab !== 'all' && c.type !== tab) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.inn.includes(q)
      );
    }
    return true;
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'client', label: 'Клиенты' },
    { id: 'carrier', label: 'Перевозчики' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Контрагенты</h1>
        <p className="text-sm text-slate-500 mt-1">Клиенты и перевозчики компании</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            const count =
              t.id === 'all'
                ? counterparties.length
                : counterparties.filter((c) => c.type === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? 'bg-white border-brand-200 text-brand-700 shadow-card'
                    : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {t.label}
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative lg:ml-auto lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, ИНН, городу…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => {
          const isCarrier = c.type === 'carrier';
          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5 transition-all duration-200 hover:shadow-cardHover hover:-translate-y-0.5 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                      isCarrier ? 'bg-warn-50 text-warn-600' : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    {isCarrier ? <Truck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                    <span
                      className={`inline-flex items-center mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isCarrier
                          ? 'bg-warn-50 text-warn-600'
                          : 'bg-brand-50 text-brand-600'
                      }`}
                    >
                      {isCarrier ? 'Перевозчик' : 'Клиент'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-400">Заявок</p>
                  <p className="text-lg font-bold text-slate-800">{c.ordersCount}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Briefcase className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-xs">ИНН: {c.inn}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-xs">{c.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-xs truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-xs">{c.city}</span>
                </div>
              </div>

              {(canExport || canDelete) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  {canExport ? (
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Экспорт
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-50">
                      <Lock className="w-3.5 h-3.5" />
                      Экспорт
                    </span>
                  )}
                  {canDelete ? (
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-err-600 bg-err-50 hover:bg-err-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      Удалить
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-50">
                      <Lock className="w-3.5 h-3.5" />
                      Удалить
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-16 text-center">
          <p className="text-sm font-semibold text-slate-700">Ничего не найдено</p>
          <p className="text-xs text-slate-400 mt-1">Измените фильтр или поисковый запрос</p>
        </div>
      )}
    </div>
  );
}
