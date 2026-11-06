import {
  TrendingUp,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ArrowRight,
  Banknote,
  PiggyBank,
} from 'lucide-react';
import type { Order } from '@/lib/data';
import { STATUS_META, STATUS_LABELS, formatCurrency, formatDate, orderProfit } from '@/lib/data';
import { useAccess } from '@/lib/access';
import type { View } from './Sidebar';

interface DashboardProps {
  orders: Order[];
  onOpenOrders: () => void;
  onNavigate: (view: View) => void;
}

function StatCard({
  label,
  value,
  delta,
  positive,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: typeof TrendingUp;
  tint: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5 transition-all duration-200 hover:shadow-cardHover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${tint}`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <TrendingUp className={`w-3.5 h-3.5 ${positive ? 'text-accent-600' : 'text-err-500'}`} />
          <span className={positive ? 'text-accent-600 font-semibold' : 'text-err-500 font-semibold'}>
            {delta}
          </span>
          <span className="text-slate-400">за неделю</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ orders, onOpenOrders, onNavigate }: DashboardProps) {
  const { can } = useAccess();

  const inWork = orders.filter((o) => o.status === 'in_work').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const problem = orders.filter((o) => o.status === 'problem').length;

  const canRevenue = can('finance.client_cost');
  const canCarrierCost = can('finance.carrier_cost');
  const canProfit = can('finance.profit');

  const revenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.cost, 0);
  const totalCarrier = orders.reduce((sum, o) => sum + o.carrierCost, 0);
  const totalProfit = orders.reduce((sum, o) => sum + orderProfit(o), 0);

  const recent = [...orders].slice(0, 5);

  const financeCards: React.ReactNode[] = [];
  if (canRevenue) {
    financeCards.push(
      <StatCard
        key="revenue"
        label="Оплачено (выручка)"
        value={formatCurrency(revenue)}
        delta="+18%"
        positive
        icon={Wallet}
        tint="bg-warn-50 text-warn-600"
      />
    );
  }
  if (canCarrierCost) {
    financeCards.push(
      <StatCard
        key="carrier"
        label="Расход на перевозчиков"
        value={formatCurrency(totalCarrier)}
        delta="+6%"
        positive={false}
        icon={Banknote}
        tint="bg-err-50 text-err-600"
      />
    );
  }
  if (canProfit) {
    financeCards.push(
      <StatCard
        key="profit"
        label="Маржа (без НДС)"
        value={formatCurrency(totalProfit)}
        delta="+11%"
        positive
        icon={PiggyBank}
        tint="bg-accent-50 text-accent-600"
      />
    );
  }

  const hasFinance = financeCards.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Дашборд</h1>
        <p className="text-sm text-slate-500 mt-1">Обзор активности за последнее время</p>
      </div>

      <div
        className={`grid gap-4 ${
          hasFinance
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}
      >
        <StatCard
          label="Заявок в работе"
          value={String(inWork)}
          delta="+12%"
          positive
          icon={Truck}
          tint="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Доставлено"
          value={String(delivered)}
          delta="+8%"
          positive
          icon={CheckCircle2}
          tint="bg-accent-50 text-accent-600"
        />
        <StatCard
          label="Проблемных"
          value={String(problem)}
          delta="+2"
          positive={false}
          icon={AlertTriangle}
          tint="bg-err-50 text-err-600"
        />
        {financeCards}
      </div>

      {!hasFinance && (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5">
          <PiggyBank className="w-4 h-4 shrink-0" />
          Финансовые показатели скрыты для текущей роли.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Последние заявки</h2>
              <p className="text-xs text-slate-400 mt-0.5">Свежие записи в системе</p>
            </div>
            <button
              onClick={onOpenOrders}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Все заявки
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {recent.map((order) => {
              const meta = STATUS_META[order.status];
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{order.client}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {order.from} → {order.to}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${meta.badge}`}>
                    <span className={`inline-flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </span>
                  {canRevenue && (
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block w-28 text-right">
                      {formatCurrency(order.cost)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-900">Статусы</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-5">Распределение по статусам</p>
          <div className="space-y-4">
            {(Object.keys(STATUS_LABELS) as Order['status'][]).map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
              const meta = STATUS_META[status];
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                    <span className="text-slate-400 font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${meta.dot} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {can('counterparties.view') && (
            <button
              onClick={() => onNavigate('counterparties')}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Контрагенты
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center pt-2">
        Обновлено: {formatDate(new Date().toISOString())}
      </div>
    </div>
  );
}
