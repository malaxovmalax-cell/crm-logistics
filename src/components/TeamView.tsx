import { useState, Fragment } from 'react';
import { Check, Users2, ShieldCheck, RotateCcw, Mail, Lock } from 'lucide-react';
import { useAccess } from '@/lib/access';
import {
  ROLE_LABELS,
  ROLE_BADGES,
  PERMISSION_GROUPS,
  demoEmployees,
  type Role,
  type Permission,
} from '@/lib/permissions';

type Tab = 'employees' | 'rights';

function Checkbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-200 ${
        disabled
          ? 'bg-slate-50 border-slate-100 cursor-not-allowed'
          : checked
            ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
            : 'bg-white border-slate-200 hover:border-brand-400'
      }`}
      aria-checked={checked}
      role="checkbox"
    >
      {!disabled && checked && <Check className="w-4 h-4" strokeWidth={3} />}
      {disabled && <Lock className="w-3 h-3 text-slate-300" />}
    </button>
  );
}

export default function TeamView() {
  const { matrix, setRolePermission, resetMatrix, currentRole } = useAccess();
  const [tab, setTab] = useState<Tab>('employees');

  const roles = Object.keys(ROLE_LABELS) as Role[];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Сотрудники и Права</h1>
          <p className="text-sm text-slate-500 mt-1">
            Управление командой и настройка доступа по ролям
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('employees')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            tab === 'employees'
              ? 'bg-white border-brand-200 text-brand-700 shadow-card'
              : 'bg-white/60 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Users2 className="w-4 h-4" />
          Список сотрудников
        </button>
        <button
          onClick={() => setTab('rights')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            tab === 'rights'
              ? 'bg-white border-brand-200 text-brand-700 shadow-card'
              : 'bg-white/60 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Настройка прав
        </button>
      </div>

      {tab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">
                    Сотрудник
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">
                    Роль
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">
                    Email
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {demoEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 font-semibold text-xs">
                          {emp.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_BADGES[emp.role]}`}
                      >
                        {ROLE_LABELS[emp.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {emp.email}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {emp.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Неактивен
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'rights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-brand-50/60 border border-brand-100 rounded-xl px-3 py-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <span>
                Изменения применяются мгновенно. Снимите галочку, чтобы скрыть соответствующий
                раздел у выбранной роли. Текущий режим предпросмотра:{' '}
                <span className="font-semibold text-brand-700">{ROLE_LABELS[currentRole]}</span>
              </span>
            </div>
            <button
              onClick={resetMatrix}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Сбросить по умолчанию
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60">
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3.5 sticky left-0 bg-slate-50/60">
                      Право
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role}
                        className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-3.5"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${ROLE_BADGES[role]}`}
                          >
                            {ROLE_LABELS[role]}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_GROUPS.map((group) => (
                    <Fragment key={group.title}>
                      <tr className="bg-slate-50/40">
                        <td
                          colSpan={roles.length + 1}
                          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100"
                        >
                          {group.title}
                        </td>
                      </tr>
                      {group.permissions.map((perm) => (
                        <tr
                          key={perm.key}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-sm font-medium text-slate-700">
                            {perm.label}
                          </td>
                          {roles.map((role) => {
                            const isAdminLocked =
                              perm.key === 'team.view' && role === 'admin';
                            return (
                              <td key={role} className="px-3 py-3.5 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={matrix[role][perm.key as Permission]}
                                    onChange={() =>
                                      setRolePermission(
                                        role,
                                        perm.key as Permission,
                                        !matrix[role][perm.key as Permission]
                                      )
                                    }
                                    disabled={isAdminLocked}
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-400 px-1">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Права Администратора на раздел «Сотрудники и Права» защищены от снятия — иначе
              никто не смог бы вернуть доступ обратно.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
