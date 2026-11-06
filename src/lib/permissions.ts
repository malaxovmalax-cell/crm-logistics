export type Role = 'admin' | 'senior_manager' | 'logist' | 'driver';

export type Permission =
  | 'orders.view'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.delete'
  | 'finance.client_cost'
  | 'finance.carrier_cost'
  | 'finance.profit'
  | 'counterparties.view'
  | 'counterparties.export'
  | 'counterparties.delete'
  | 'team.view';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Администратор',
  senior_manager: 'Старший менеджер',
  logist: 'Логист',
  driver: 'Водитель',
};

export const ROLE_BADGES: Record<Role, string> = {
  admin: 'bg-brand-50 text-brand-700 border-brand-100',
  senior_manager: 'bg-accent-50 text-accent-700 border-accent-100',
  logist: 'bg-warn-50 text-warn-600 border-warn-100',
  driver: 'bg-slate-100 text-slate-600 border-slate-200',
};

export type PermissionGroup = {
  title: string;
  permissions: { key: Permission; label: string }[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: 'Заявки',
    permissions: [
      { key: 'orders.view', label: 'Просмотр' },
      { key: 'orders.create', label: 'Создание' },
      { key: 'orders.edit', label: 'Редактирование' },
      { key: 'orders.delete', label: 'Удаление' },
    ],
  },
  {
    title: 'Финансы и маржа',
    permissions: [
      { key: 'finance.client_cost', label: 'Видеть стоимость клиента' },
      { key: 'finance.carrier_cost', label: 'Видеть расход на перевозчика' },
      { key: 'finance.profit', label: 'Видеть чистую прибыль' },
    ],
  },
  {
    title: 'Контрагенты',
    permissions: [
      { key: 'counterparties.view', label: 'Просмотр базы' },
      { key: 'counterparties.export', label: 'Экспорт базы (скачивание)' },
      { key: 'counterparties.delete', label: 'Удаление клиентов' },
    ],
  },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key)
);

export const DEFAULT_MATRIX: Record<Role, Record<Permission, boolean>> = {
  admin: {
    'orders.view': true,
    'orders.create': true,
    'orders.edit': true,
    'orders.delete': true,
    'finance.client_cost': true,
    'finance.carrier_cost': true,
    'finance.profit': true,
    'counterparties.view': true,
    'counterparties.export': true,
    'counterparties.delete': true,
    'team.view': true,
  },
  senior_manager: {
    'orders.view': true,
    'orders.create': true,
    'orders.edit': true,
    'orders.delete': false,
    'finance.client_cost': true,
    'finance.carrier_cost': true,
    'finance.profit': true,
    'counterparties.view': true,
    'counterparties.export': true,
    'counterparties.delete': false,
    'team.view': true,
  },
  logist: {
    'orders.view': true,
    'orders.create': true,
    'orders.edit': true,
    'orders.delete': false,
    'finance.client_cost': false,
    'finance.carrier_cost': true,
    'finance.profit': false,
    'counterparties.view': true,
    'counterparties.export': false,
    'counterparties.delete': false,
    'team.view': false,
  },
  driver: {
    'orders.view': true,
    'orders.create': false,
    'orders.edit': false,
    'orders.delete': false,
    'finance.client_cost': false,
    'finance.carrier_cost': false,
    'finance.profit': false,
    'counterparties.view': false,
    'counterparties.export': false,
    'counterparties.delete': false,
    'team.view': false,
  },
};

export interface Employee {
  id: string;
  name: string;
  role: Role;
  status: 'active' | 'inactive';
  email: string;
}

export const demoEmployees: Employee[] = [
  { id: 'e1', name: 'Алексей Морозов', role: 'admin', status: 'active', email: 'a.morozov@logistikcrm.ru' },
  { id: 'e2', name: 'Ирина Соколова', role: 'senior_manager', status: 'active', email: 'i.sokolova@logistikcrm.ru' },
  { id: 'e3', name: 'Дмитрий Орлов', role: 'logist', status: 'active', email: 'd.orlov@logistikcrm.ru' },
  { id: 'e4', name: 'Сергей Волков', role: 'logist', status: 'inactive', email: 's.volkov@logistikcrm.ru' },
  { id: 'e5', name: 'Павел Кузнецов', role: 'driver', status: 'active', email: 'p.kuznetsov@logistikcrm.ru' },
  { id: 'e6', name: 'Михаил Зайцев', role: 'driver', status: 'active', email: 'm.zaytsev@logistikcrm.ru' },
];

export function emptyMatrix(): Record<Role, Record<Permission, boolean>> {
  const m = {} as Record<Role, Record<Permission, boolean>>;
  (Object.keys(ROLE_LABELS) as Role[]).forEach((r) => {
    m[r] = {} as Record<Permission, boolean>;
    ALL_PERMISSIONS.forEach((p) => (m[r][p] = false));
    m[r]['team.view'] = r === 'admin' || r === 'senior_manager';
  });
  return m;
}
