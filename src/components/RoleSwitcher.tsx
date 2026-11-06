import { UserRound, ShieldCheck } from 'lucide-react';
import { useAccess } from '@/lib/access';
import { ROLE_LABELS, ROLE_BADGES, type Role } from '@/lib/permissions';

const switchable: Role[] = ['admin', 'senior_manager', 'logist', 'driver'];

export default function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useAccess();

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-card">
      <div className="flex items-center gap-2 text-slate-500">
        <ShieldCheck className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Войти как:</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {switchable.map((role) => {
          const isActive = currentRole === role;
          return (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <UserRound className="w-3.5 h-3.5" />
              {ROLE_LABELS[role]}
            </button>
          );
        })}
      </div>
      <span
        className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ml-1 ${
          ROLE_BADGES[currentRole]
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        Активная роль
      </span>
    </div>
  );
}
