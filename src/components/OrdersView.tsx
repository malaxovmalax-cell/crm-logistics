import { useState } from 'react';
import { Plus, ArrowRight, Inbox, Lock, User, PlusCircle, X, Check } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/data';
import {
  STATUS_META,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  orderProfit,
  VAT_LABELS,
  CLIENT_PAY_LABELS,
  CLIENT_PAY_META,
  CARRIER_PAY_LABELS,
  CARRIER_PAY_META,
  demoDrivers,
  clientDebt,
  carrierDebt,
  calcClientPayStatus,
  calcCarrierPayStatus,
  vatAmount,
  type VatType,
} from '@/lib/data';
import { useAccess } from '@/lib/access';
import OrdersFilterBar, { emptyExt, type DebtFilter, type ExtFilters, type StatusFilter } from '@/components/OrdersFilterBar';

interface OrdersViewProps {
  orders: Order[];
  onNewOrder: () => void;
  onOrderClick: (order: Order) => void;
  onUpdate: (order: Order) => void;
}

const HEADER_CELL = 'text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2.5';

function PayBadge({
  status,
  labels,
  meta,
}: {
  status: 'unpaid' | 'partial' | 'planned' | 'paid';
  labels: Record<string, string>;
  meta: { dot: string; badge: string };
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border whitespace-nowrap ${meta.badge}`}>
      <span className={`w-1 h-1 rounded-full ${meta.dot}`} />
      {labels[status]}
    </span>
  );
}

export default function OrdersView({ orders, onNewOrder, onOrderClick, onUpdate }: OrdersViewProps) {
  const { can } = useAccess();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [debtFilter, setDebtFilter] = useState<DebtFilter>('none');
  const [ext, setExt] = useState<ExtFilters>(emptyExt);
  const [quickPayId, setQuickPayId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const canClientCost = can('finance.client_cost');
  const canCarrierCost = can('finance.carrier_cost');
  const canProfit = can('finance.profit');
  const canCreate = can('orders.create');
  const canEdit = can('orders.edit');

  const submitQuickPay = (order: Order, target: 'client' | 'carrier') => {
    const amount = Number(payAmount) || 0;
    if (amount <= 0) return;
    if (target === 'client') {
      const newPaid = order.clientPaidAmount + amount;
      onUpdate({ ...order, clientPaidAmount: newPaid, clientPayStatus: calcClientPayStatus(newPaid, order.cost) });
    } else {
      const newPaid = order.carrierPaidAmount + amount;
      onUpdate({ ...order, carrierPaidAmount: newPaid, carrierPayStatus: calcCarrierPayStatus(newPaid, order.carrierCost) });
    }
    setQuickPayId(null);
    setPayAmount('');
  };

  const updateExt = <K extends keyof ExtFilters>(field: K, value: ExtFilters[K]) => {
    setExt((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setExt(emptyExt);
    setStatusFilter('all');
    setDebtFilter('none');
  };

  const activeCount = [
    statusFilter !== 'all',
    debtFilter !== 'none',
    ext.query,
    ext.counterparty,
    ext.driver,
    ext.manager,
    ext.dateFrom,
    ext.dateTo,
  ].filter(Boolean).length;

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (debtFilter === 'client_debt' && o.clientPayStatus !== 'unpaid' && o.clientPayStatus !== 'partial')
      return false;
    if (debtFilter === 'our_debt' && o.carrierPayStatus !== 'unpaid' && o.carrierPayStatus !== 'planned')
      return false;
    if (ext.query) {
      const q = ext.query.toLowerCase();
      if (!(
        o.id.toLowerCase().includes(q) ||
        o.client.toLowerCase().includes(q) ||
        o.carrier.toLowerCase().includes(q) ||
        o.from.toLowerCase().includes(q) ||
        o.to.toLowerCase().includes(q)
      )) return false;
    }
    if (ext.counterparty && o.client !== ext.counterparty && o.carrier !== ext.counterparty) return false;
    if (ext.driver) {
      const driver = demoDrivers.find((d) => d.id === ext.driver);
      if (!driver || !o.carrier.includes(driver.name)) return false;
    }
    if (ext.manager && o.managerName !== ext.manager) return false;
    if (ext.dateFrom && o.date < ext.dateFrom) return false;
    if (ext.dateTo && o.date > ext.dateTo) return false;
    return true;
  });

  const statusCounts = (Object.keys(STATUS_LABELS) as OrderStatus[]).reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    { all: orders.length } as Record<StatusFilter, number>
  );

  const clientDebtCount = orders.filter(
    (o) => o.clientPayStatus === 'unpaid' || o.clientPayStatus === 'partial'
  ).length;
  const ourDebtCount = orders.filter(
    (o) => o.carrierPayStatus === 'unpaid' || o.carrierPayStatus === 'planned'
  ).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Заявки</h1>
          <p className="text-sm text-slate-500 mt-1">
            Текущие перевозки и история заказов
          </p>
        </div>
        {canCreate ? (
          <button
            onClick={onNewOrder}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-5 h-5" strokeWidth={2.4} />
            Новая заявка
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-medium border border-slate-200">
            <Lock className="w-4 h-4" />
            Создание недоступно
          </div>
        )}
      </div>

      <OrdersFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        debtFilter={debtFilter}
        onDebtFilterChange={setDebtFilter}
        ext={ext}
        onExtChange={updateExt}
        onReset={resetFilters}
        activeCount={activeCount}
        statusCounts={statusCounts}
        clientDebtCount={clientDebtCount}
        ourDebtCount={ourDebtCount}
      />

      <div className="-mx-4 sm:-mx-6 lg:-mx-8 bg-white sm:rounded-2xl border-y sm:border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-fixed w-full">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[7%]" />
              <col className="w-[10%]" />
              <col className="w-[18%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              {canClientCost && <col className="w-[13%]" />}
              {canCarrierCost && <col className="w-[13%]" />}
              {canProfit && <col className="w-[6%]" />}
              <col className="w-[8%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60">
                <th className={`${HEADER_CELL} pl-4`}>ID</th>
                <th className={HEADER_CELL}>Дата</th>
                <th className={HEADER_CELL}>Клиент</th>
                <th className={HEADER_CELL}>Маршрут</th>
                <th className={HEADER_CELL}>Перевозчик</th>
                <th className={HEADER_CELL}>Менеджер</th>
                {canClientCost && <th className={HEADER_CELL}>Счёт клиенту</th>}
                {canCarrierCost && <th className={HEADER_CELL}>Оплата перевозчику</th>}
                {canProfit && <th className={`${HEADER_CELL} text-right`}>Маржа</th>}
                <th className={`${HEADER_CELL} pr-4`}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const meta = STATUS_META[order.status];
                const cVat = vatAmount(order.cost, order.costVat);
                const vVat = vatAmount(order.carrierCost, order.carrierCostVat);
                return (
                  <tr
                    key={order.id}
                    onClick={() => onOrderClick(order)}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    <td className="pl-4 pr-3 py-2.5">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 truncate block">{order.id}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-500 whitespace-nowrap">{formatDate(order.date)}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-medium text-slate-800 truncate block">{order.client}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 min-w-0">
                          <span className="font-medium truncate">{order.from}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-500 transition-colors shrink-0" />
                          <span className="font-medium truncate">{order.to}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                          <span>{order.fromZip || '—'}</span>
                          <ArrowRight className="w-2 h-2" />
                          <span>{order.toZip || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[11px] text-slate-600 truncate block">{order.carrier}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 min-w-0 text-[11px] text-slate-600">
                        <User className="w-3 h-3 text-slate-300 shrink-0" />
                        <span className="truncate">{order.managerName || '—'}</span>
                      </span>
                    </td>
                    {canClientCost && (
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-slate-800">{formatCurrency(order.cost)}</span>
                          <span className="text-[9px] text-slate-400">
                            {cVat > 0
                              ? `В т.ч. НДС ${VAT_LABELS[order.costVat as VatType].replace('НДС ', '')}: ${formatCurrency(cVat)}`
                              : VAT_LABELS[order.costVat as VatType]}
                          </span>
                          <div className="flex items-center gap-1">
                            <PayBadge status={order.clientPayStatus} labels={CLIENT_PAY_LABELS} meta={CLIENT_PAY_META[order.clientPayStatus]} />
                            {canEdit && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setQuickPayId(quickPayId === order.id + '_c' ? null : order.id + '_c'); setPayAmount(''); }}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-md border border-slate-200 bg-white text-brand-500 hover:bg-brand-50 hover:border-brand-300 transition-all shrink-0"
                                title="Быстрый платеж"
                              >
                                <PlusCircle className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {clientDebt(order) > 0 && (
                            <span className="text-[9px] font-semibold text-err-600">Долг: {formatCurrency(clientDebt(order))}</span>
                          )}
                          {quickPayId === order.id + '_c' && (
                            <div className="flex items-center gap-1 mt-0.5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                autoFocus
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') submitQuickPay(order, 'client'); if (e.key === 'Escape') { setQuickPayId(null); setPayAmount(''); } }}
                                placeholder="₽"
                                className="w-16 px-1.5 py-1 rounded-md border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                              />
                              <button onClick={() => submitQuickPay(order, 'client')} className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors shrink-0">
                                <Check className="w-3 h-3" />
                              </button>
                              <button onClick={() => { setQuickPayId(null); setPayAmount(''); }} className="p-0.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {canCarrierCost && (
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-err-600">{formatCurrency(order.carrierCost)}</span>
                          <span className="text-[9px] text-slate-400">
                            {vVat > 0
                              ? `В т.ч. НДС ${VAT_LABELS[order.carrierCostVat as VatType].replace('НДС ', '')}: ${formatCurrency(vVat)}`
                              : VAT_LABELS[order.carrierCostVat as VatType]}
                          </span>
                          <div className="flex items-center gap-1">
                            <PayBadge status={order.carrierPayStatus} labels={CARRIER_PAY_LABELS} meta={CARRIER_PAY_META[order.carrierPayStatus]} />
                            {canEdit && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setQuickPayId(quickPayId === order.id + '_v' ? null : order.id + '_v'); setPayAmount(''); }}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-md border border-slate-200 bg-white text-brand-500 hover:bg-brand-50 hover:border-brand-300 transition-all shrink-0"
                                title="Быстрый платеж"
                              >
                                <PlusCircle className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {carrierDebt(order) > 0 && (
                            <span className="text-[9px] font-semibold text-err-600">Долг: {formatCurrency(carrierDebt(order))}</span>
                          )}
                          {quickPayId === order.id + '_v' && (
                            <div className="flex items-center gap-1 mt-0.5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                autoFocus
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') submitQuickPay(order, 'carrier'); if (e.key === 'Escape') { setQuickPayId(null); setPayAmount(''); } }}
                                placeholder="₽"
                                className="w-16 px-1.5 py-1 rounded-md border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                              />
                              <button onClick={() => submitQuickPay(order, 'carrier')} className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors shrink-0">
                                <Check className="w-3 h-3" />
                              </button>
                              <button onClick={() => { setQuickPayId(null); setPayAmount(''); }} className="p-0.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {canProfit && (
                      <td className="px-3 py-2.5 text-xs font-semibold text-accent-600 text-right whitespace-nowrap">{formatCurrency(orderProfit(order))}</td>
                    )}
                    <td className="pr-4 pl-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${meta.badge}`}>
                        <span className={`w-1 h-1 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Ничего не найдено</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Попробуйте изменить фильтр или поисковый запрос, либо создайте новую заявку.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 px-1">
        Всего: {filtered.length} из {orders.length} заявок
      </p>
    </div>
  );
}
