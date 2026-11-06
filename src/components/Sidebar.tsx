import { LayoutDashboard, ClipboardList, Users, Settings, Truck, UserCog, Car } from 'lucide-react';
import { useAccess } from '@/lib/access';

export type View = 'dashboard' | 'orders' | 'fleet' | 'counterparties' | 'team' | 'settings';

interface SidebarProps {
  active: View;
  onChange: (view: View) => void;
  ordersCount: number;
}

const baseItems: { id: View; label: string; icon: typeof LayoutDashboard; perm?: string }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'orders', label: 'Заявки', icon: ClipboardList },
  { id: 'fleet', label: 'Мой Автопарк', icon: Car },
  { id: 'counterparties', label: 'Контрагенты', icon: Users, perm: 'counterparties.view' },
  { id: 'team', label: 'Сотрудники и Права', icon: UserCog, perm: 'team.view' },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function Sidebar({ active, onChange, ordersCount }: SidebarProps) {
  const { can, currentRole } = useAccess();
  const visibleItems = baseItems.filter((item) => !item.perm || can(item.perm as never));

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200/80 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200/80">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30">
          <Truck className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold text-slate-900">Логистик CRM</p>
          <p className="text-[11px] text-slate-400 font-medium">Управление перевозками</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                strokeWidth={2}
              />
              <span>{item.label}</span>
              {item.id === 'orders' && (
                <span
                  className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {ordersCount}
                </span>
              )}
            </button>
          );
        })}

        {visibleItems.length === 0 && (
          <p className="px-3 py-4 text-xs text-slate-400">Нет доступных разделов.</p>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200/80">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
            {currentRole === 'admin' ? 'АМ' : currentRole === 'senior_manager' ? 'ИС' : currentRole === 'logist' ? 'ДО' : 'ПК'}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {currentRole === 'admin' ? 'Алексей М.' : currentRole === 'senior_manager' ? 'Ирина С.' : currentRole === 'logist' ? 'Дмитрий О.' : 'Павел К.'}
            </p>
            <p className="text-[11px] text-slate-400">
              {currentRole === 'admin' ? 'Администратор' : currentRole === 'senior_manager' ? 'Старший менеджер' : currentRole === 'logist' ? 'Логист' : 'Водитель'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
