import { useState } from 'react';
import { Truck, LayoutDashboard, ClipboardList, Users, Settings, Plus, Menu, X, UserCog, Lock, Car } from 'lucide-react';
import Sidebar, { type View } from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import OrdersView from '@/components/OrdersView';
import NewOrderModal from '@/components/NewOrderModal';
import OrderDetailModal from '@/components/OrderDetailModal';
import FleetView from '@/components/FleetView';
import CounterpartiesView from '@/components/CounterpartiesView';
import TeamView from '@/components/TeamView';
import SettingsView from '@/components/SettingsView';
import RoleSwitcher from '@/components/RoleSwitcher';
import { AccessProvider, useAccess } from '@/lib/access';
import { demoOrders, demoCounterparties, type Order } from '@/lib/data';

const mobileItems: { id: View; label: string; icon: typeof Truck }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'orders', label: 'Заявки', icon: ClipboardList },
  { id: 'fleet', label: 'Мой Автопарк', icon: Car },
  { id: 'counterparties', label: 'Контрагенты', icon: Users },
  { id: 'team', label: 'Сотрудники и Права', icon: UserCog },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-err-50 text-err-500 mb-5">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Доступ запрещён</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        У текущей роли нет прав на просмотр этого раздела. Переключите роль вверху экрана или
        попросите администратора выдать доступ.
      </p>
      <button
        onClick={onBack}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-all"
      >
        На дашборд
      </button>
    </div>
  );
}

function AppInner() {
  const { can } = useAccess();
  const [view, setView] = useState<View>('orders');
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  const handleCreate = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const handleUpdateOrder = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  };

  const openOrdersAndModal = () => {
    setView('orders');
    setModalOpen(true);
  };

  const guardedView = (target: View): View => {
    if (target === 'counterparties' && !can('counterparties.view')) return 'dashboard';
    if (target === 'team' && !can('team.view')) return 'dashboard';
    return target;
  };

  const navigate = (target: View) => setView(guardedView(target));

  const renderView = () => {
    if (view === 'dashboard') {
      return <Dashboard orders={orders} onOpenOrders={() => setView('orders')} onNavigate={navigate} />;
    }
    if (view === 'orders') {
      return <OrdersView orders={orders} onNewOrder={() => setModalOpen(true)} onOrderClick={(o) => setSelectedOrder(o)} onUpdate={handleUpdateOrder} />;
    }
    if (view === 'fleet') {
      return <FleetView />;
    }
    if (view === 'counterparties') {
      if (!can('counterparties.view')) {
        return <AccessDenied onBack={() => setView('dashboard')} />;
      }
      return <CounterpartiesView counterparties={demoCounterparties} />;
    }
    if (view === 'team') {
      if (!can('team.view')) {
        return <AccessDenied onBack={() => setView('dashboard')} />;
      }
      return <TeamView />;
    }
    if (view === 'settings') {
      return <SettingsView />;
    }
    return null;
  };

  const visibleMobileItems = mobileItems.filter((item) => {
    if (item.id === 'counterparties') return can('counterparties.view');
    if (item.id === 'team') return can('team.view');
    return true;
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar active={view} onChange={navigate} ordersCount={orders.length} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Truck className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-bold text-slate-900">Логистик CRM</span>
          </div>
          <button
            onClick={() => setMobileNav((v) => !v)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile nav drawer */}
        {mobileNav && (
          <div className="md:hidden bg-white border-b border-slate-200/80 px-3 py-3 space-y-1 animate-fade-in">
            {visibleMobileItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.id);
                    setMobileNav(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
            {can('orders.create') && (
              <button
                onClick={() => {
                  setMobileNav(false);
                  openOrdersAndModal();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50"
              >
                <Plus className="w-5 h-5" />
                Новая заявка
              </button>
            )}
          </div>
        )}

        {/* Role switcher bar */}
        <div className="sticky top-14 md:top-0 z-20 bg-slate-50/80 backdrop-blur border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-[1400px] mx-auto">
            <RoleSwitcher />
          </div>
        </div>

        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full ${view === 'orders' ? '' : 'max-w-[1400px] mx-auto'}`}>
          {renderView()}
        </main>
      </div>

      <NewOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={handleUpdateOrder}
      />
    </div>
  );
}

export default function App() {
  return (
    <AccessProvider>
      <AppInner />
    </AccessProvider>
  );
}
