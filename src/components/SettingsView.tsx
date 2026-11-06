import { useState } from 'react';
import { Bell, Palette, Shield, User, Save, Check, Building2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { OUR_ENTITIES, type OurOrgRecord } from '@/lib/data';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function SettingsView() {
  const [notif, setNotif] = useState({ newOrders: true, statusChanges: true, payments: false, problems: true });
  const [saved, setSaved] = useState(false);
  const [orgs, setOrgs] = useState<OurOrgRecord[]>(OUR_ENTITIES);
  const [editOrg, setEditOrg] = useState<OurOrgRecord | null>(null);

  const toggles: { key: keyof typeof notif; label: string; desc: string }[] = [
    { key: 'newOrders', label: 'Новые заявки', desc: 'Уведомлять о создании новой заявки' },
    { key: 'statusChanges', label: 'Изменение статуса', desc: 'При смене статуса перевозки' },
    { key: 'payments', label: 'Оплаты', desc: 'При поступлении оплаты' },
    { key: 'problems', label: 'Проблемы', desc: 'При возникновении проблем с грузом' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const saveOrg = (updated: OurOrgRecord) => {
    setOrgs((prev) => {
      const exists = prev.find((o) => o.id === updated.id);
      return exists ? prev.map((o) => (o.id === updated.id ? updated : o)) : [...prev, updated];
    });
    setEditOrg(null);
  };

  const deleteOrg = (id: string) => {
    setOrgs((prev) => prev.filter((o) => o.id !== id));
  };

  const addNewOrg = () => {
    setEditOrg({ id: `org-${Date.now()}`, name: '', inn: '', kpp: '', address: '', phone: '', account: '', bank: '', ks: '', bik: '', vat: false });
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Настройки</h1>
        <p className="text-sm text-slate-500 mt-1">Конфигурация профиля и уведомлений</p>
      </div>

      {/* Our Organizations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Наши организации</h2>
              <p className="text-xs text-slate-400">Юрлица, от имени которых выставляются документы</p>
            </div>
          </div>
          <button onClick={addNewOrg} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 text-brand-700 text-sm font-semibold hover:bg-brand-100 transition-colors">
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
        <div className="space-y-2">
          {orgs.map((org) => (
            <div key={org.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{org.name}</p>
                <p className="text-xs text-slate-400">ИНН {org.inn}{org.kpp !== '—' ? ` · КПП ${org.kpp}` : ''}</p>
                <p className="text-[10px] font-medium text-slate-400">{org.account} · {org.bank}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${org.vat ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                {org.vat ? 'с НДС' : 'без НДС'}
              </span>
              <button onClick={() => setEditOrg(org)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteOrg(org.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-err-50 hover:text-err-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {orgs.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">Организации не добавлены</p>}
        </div>
      </div>

      {/* Org edit modal */}
      {editOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setEditOrg(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-pop animate-scale-in max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-base font-bold text-slate-900">{editOrg.name ? 'Редактировать организацию' : 'Новая организация'}</h2>
              <button onClick={() => setEditOrg(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <OrgInput label="Название" value={editOrg.name} onChange={(v) => setEditOrg({ ...editOrg, name: v })} />
              <div className="grid grid-cols-2 gap-3">
                <OrgInput label="ИНН" value={editOrg.inn} onChange={(v) => setEditOrg({ ...editOrg, inn: v })} />
                <OrgInput label="КПП" value={editOrg.kpp} onChange={(v) => setEditOrg({ ...editOrg, kpp: v })} />
              </div>
              <OrgInput label="Адрес" value={editOrg.address} onChange={(v) => setEditOrg({ ...editOrg, address: v })} />
              <OrgInput label="Телефон" value={editOrg.phone} onChange={(v) => setEditOrg({ ...editOrg, phone: v })} />
              <OrgInput label="Расчётный счёт" value={editOrg.account} onChange={(v) => setEditOrg({ ...editOrg, account: v })} />
              <div className="grid grid-cols-2 gap-3">
                <OrgInput label="Банк" value={editOrg.bank} onChange={(v) => setEditOrg({ ...editOrg, bank: v })} />
                <OrgInput label="Корр. счёт" value={editOrg.ks} onChange={(v) => setEditOrg({ ...editOrg, ks: v })} />
              </div>
              <OrgInput label="БИК" value={editOrg.bik} onChange={(v) => setEditOrg({ ...editOrg, bik: v })} />
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked={editOrg.vat} onChange={(e) => setEditOrg({ ...editOrg, vat: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20" />
                <span className="text-sm font-medium text-slate-600">Работает с НДС</span>
              </label>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setEditOrg(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Отмена</button>
              <button onClick={() => saveOrg(editOrg)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600"><User className="w-5 h-5" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Профиль</h2><p className="text-xs text-slate-400">Данные учётной записи</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Имя</label><input defaultValue="Алексей Морозов" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Должность</label><input defaultValue="Менеджер по логистике" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label><input defaultValue="a.morozov@logistikcrm.ru" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Телефон</label><input defaultValue="+7 (495) 123-45-67" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-warn-50 text-warn-600"><Bell className="w-5 h-5" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Уведомления</h2><p className="text-xs text-slate-400">Когда присылать оповещения</p></div>
        </div>
        <div className="space-y-1">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div><p className="text-sm font-medium text-slate-700">{t.label}</p><p className="text-xs text-slate-400 mt-0.5">{t.desc}</p></div>
              <Toggle checked={notif[t.key]} onChange={() => setNotif((n) => ({ ...n, [t.key]: !n[t.key] }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 text-accent-600"><Palette className="w-5 h-5" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Внешний вид</h2><p className="text-xs text-slate-400">Тема интерфейса</p></div>
        </div>
        <div className="flex items-center gap-3">
          {[{ name: 'brand', label: 'Синяя', color: 'bg-brand-500' }, { name: 'accent', label: 'Зелёная', color: 'bg-accent-500' }, { name: 'warn', label: 'Янтарная', color: 'bg-warn-500' }].map((theme, i) => (
            <button key={theme.name} className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${i === 0 ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className={`w-4 h-4 rounded-full ${theme.color}`} /><span className="text-sm font-medium text-slate-600">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-err-50 text-err-600"><Shield className="w-5 h-5" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Безопасность</h2><p className="text-xs text-slate-400">Двухфакторная аутентификация</p></div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div><p className="text-sm font-medium text-slate-700">Включить 2FA</p><p className="text-xs text-slate-400 mt-0.5">Дополнительная защита учётной записи</p></div>
          <Toggle checked={false} onChange={() => {}} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Отмена</button>
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-[0.98] transition-all duration-200">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Сохранено' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

function OrgInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
    </div>
  );
}
