export type OrderStatus = 'in_work' | 'delivered' | 'problem' | 'paid';
export type VatType = 'no_vat' | 'vat0' | 'vat5' | 'vat7' | 'vat20';
export type ClientPayStatus = 'unpaid' | 'partial' | 'paid';
export type CarrierPayStatus = 'unpaid' | 'planned' | 'paid';
export type CarrierSource = 'hired' | 'own';
export type OurEntityId = string;

export interface Order {
  id: string;
  date: string;
  client: string;
  from: string;
  to: string;
  fromZip: string;
  toZip: string;
  carrier: string;
  carrierSource: CarrierSource;
  truckId?: string;
  trailerId?: string;
  driverId?: string;
  ourEntity: OurEntityId;
  managerName: string;
  managerId: string;
  cost: number;
  costVat: VatType;
  carrierCost: number;
  carrierCostVat: VatType;
  status: OrderStatus;
  clientPayStatus: ClientPayStatus;
  clientPaidAmount: number;
  carrierPayStatus: CarrierPayStatus;
  carrierPaidAmount: number;
}

export interface Truck {
  id: string;
  brand: string;
  plate: string;
  bodyType: string;
  capacity: number;
  trailerId?: string;
  status: 'free' | 'on_route' | 'repair';
}

export interface Trailer {
  id: string;
  plate: string;
  type: string;
  volume: number;
  capacity: number;
  status: 'free' | 'on_route' | 'repair';
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  passport: string;
  status: 'active' | 'on_route' | 'inactive';
}

export interface OurOrgRecord {
  id: string;
  name: string;
  inn: string;
  kpp: string;
  address: string;
  phone: string;
  account: string;
  bank: string;
  ks: string;
  bik: string;
  vat: boolean;
}

export const OUR_ENTITIES: OurOrgRecord[] = [
  {
    id: 'ooo',
    name: 'ООО «Логистик-Групп»',
    inn: '7712345678',
    kpp: '771201001',
    address: 'г. Москва, ул. Тверская, д. 10',
    phone: '+7 (495) 000-00-00',
    account: '40702810400000012345',
    bank: 'ПАО «Банк»',
    ks: '30101810400000000543',
    bik: '044525543',
    vat: true,
  },
  {
    id: 'ip',
    name: 'ИП Морозов А.В.',
    inn: '770123456789',
    kpp: '—',
    address: 'г. Москва, ул. Садовая, д. 5, кв. 12',
    phone: '+7 (495) 111-22-33',
    account: '40802810400000054321',
    bank: 'ПАО «Банк»',
    ks: '30101810400000000543',
    bik: '044525543',
    vat: false,
  },
];

export function getOurEntity(id: string): OurOrgRecord {
  return OUR_ENTITIES.find((e) => e.id === id) || OUR_ENTITIES[0];
}

export const TRUCK_STATUS_LABELS: Record<Truck['status'], string> = {
  free: 'Свободна',
  on_route: 'В рейсе',
  repair: 'В ремонте',
};

export const TRUCK_STATUS_META: Record<Truck['status'], { dot: string; badge: string }> = {
  free: { dot: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700 border-accent-100' },
  on_route: { dot: 'bg-brand-500', badge: 'bg-brand-50 text-brand-700 border-brand-100' },
  repair: { dot: 'bg-err-500', badge: 'bg-err-50 text-err-600 border-err-100' },
};

export const TRAILER_STATUS_LABELS: Record<Trailer['status'], string> = {
  free: 'Свободен',
  on_route: 'В рейсе',
  repair: 'В ремонте',
};

export const TRAILER_STATUS_META: Record<Trailer['status'], { dot: string; badge: string }> = {
  free: { dot: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700 border-accent-100' },
  on_route: { dot: 'bg-brand-500', badge: 'bg-brand-50 text-brand-700 border-brand-100' },
  repair: { dot: 'bg-err-500', badge: 'bg-err-50 text-err-600 border-err-100' },
};

export const DRIVER_STATUS_LABELS: Record<Driver['status'], string> = {
  active: 'Активен',
  on_route: 'В рейсе',
  inactive: 'Неактивен',
};

export const DRIVER_STATUS_META: Record<Driver['status'], { dot: string; badge: string }> = {
  active: { dot: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700 border-accent-100' },
  on_route: { dot: 'bg-brand-500', badge: 'bg-brand-50 text-brand-700 border-brand-100' },
  inactive: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export const demoTrucks: Truck[] = [
  { id: 'tr1', brand: 'КАМАЗ 65116', plate: 'В 234 АВ 77', bodyType: 'Тент', capacity: 12, trailerId: 'tr1', status: 'on_route' },
  { id: 'tr2', brand: 'МАЗ 5340', plate: 'Е 567 ВГ 77', bodyType: 'Рефрижератор', capacity: 10, status: 'free' },
  { id: 'tr3', brand: 'Volvo FH16', plate: 'К 890 ЕК 77', bodyType: 'Тент', capacity: 20, trailerId: 'tr3', status: 'free' },
  { id: 'tr4', brand: 'ГАЗон NEXT', plate: 'М 123 ОТ 77', bodyType: 'Будка', capacity: 5, status: 'repair' },
];

export const demoTrailers: Trailer[] = [
  { id: 'tr1', plate: 'АК 1234 77', type: 'Тент', volume: 82, capacity: 20, status: 'on_route' },
  { id: 'tr2', plate: 'АК 5678 77', type: 'Рефрижератор', volume: 86, capacity: 22, status: 'free' },
  { id: 'tr3', plate: 'АК 9012 77', type: 'Тент', volume: 90, capacity: 24, status: 'on_route' },
  { id: 'tr4', plate: 'АК 3456 77', type: 'Самосвал', volume: 16, capacity: 30, status: 'free' },
  { id: 'tr5', plate: 'АК 7890 77', type: 'Контейнер', volume: 76, capacity: 24, status: 'repair' },
];

export const demoDrivers: Driver[] = [
  { id: 'd1', name: 'Павел Кузнецов', phone: '+7 (905) 111-22-33', license: '77 12 567890', passport: '4510 123456', status: 'on_route' },
  { id: 'd2', name: 'Михаил Зайцев', phone: '+7 (905) 222-33-44', license: '77 09 345678', passport: '4511 234567', status: 'active' },
  { id: 'd3', name: 'Сергей Волков', phone: '+7 (905) 333-44-55', license: '77 34 901234', passport: '4512 345678', status: 'active' },
  { id: 'd4', name: 'Андрей Смирнов', phone: '+7 (905) 444-55-66', license: '77 56 456789', passport: '4513 456789', status: 'inactive' },
];

export const VAT_RATES: Record<VatType, number> = {
  no_vat: 0,
  vat0: 0,
  vat5: 0.05,
  vat7: 0.07,
  vat20: 0.2,
};

export function netOfVat(amount: number, vat: VatType): number {
  const rate = VAT_RATES[vat];
  if (rate === 0) return Math.round(amount * 100) / 100;
  return Math.round((amount / (1 + rate)) * 100) / 100;
}

export function vatAmount(amount: number, vat: VatType): number {
  const rate = VAT_RATES[vat];
  if (rate === 0) return 0;
  return Math.round((amount - amount / (1 + rate)) * 100) / 100;
}

export function vatRatePercent(vat: VatType): number {
  return Math.round(VAT_RATES[vat] * 100);
}

export function orderProfit(order: Order): number {
  const clientNet = netOfVat(order.cost, order.costVat);
  const carrierNet = netOfVat(order.carrierCost, order.carrierCostVat);
  return Math.round((clientNet - carrierNet) * 100) / 100;
}

export function calcClientPayStatus(paid: number, rate: number): ClientPayStatus {
  if (paid <= 0) return 'unpaid';
  if (paid >= rate) return 'paid';
  return 'partial';
}

export function calcCarrierPayStatus(paid: number, rate: number): CarrierPayStatus {
  if (paid <= 0) return 'unpaid';
  if (paid >= rate) return 'paid';
  return 'planned';
}

export function clientDebt(order: Order): number {
  return Math.max(0, order.cost - order.clientPaidAmount);
}

export function carrierDebt(order: Order): number {
  return Math.max(0, order.carrierCost - order.carrierPaidAmount);
}

export interface Counterparty {
  id: string;
  name: string;
  type: 'client' | 'carrier';
  inn: string;
  phone: string;
  email: string;
  city: string;
  ordersCount: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  in_work: 'В работе',
  delivered: 'Доставлено',
  problem: 'Проблема',
  paid: 'Оплачено',
};

export const STATUS_META: Record<
  OrderStatus,
  { label: string; dot: string; badge: string; text: string }
> = {
  in_work: {
    label: 'В работе',
    dot: 'bg-brand-500',
    badge: 'bg-brand-50 text-brand-700 border-brand-100',
    text: 'text-brand-700',
  },
  delivered: {
    label: 'Доставлено',
    dot: 'bg-accent-500',
    badge: 'bg-accent-50 text-accent-700 border-accent-100',
    text: 'text-accent-700',
  },
  problem: {
    label: 'Проблема',
    dot: 'bg-err-500',
    badge: 'bg-err-50 text-err-600 border-err-100',
    text: 'text-err-600',
  },
  paid: {
    label: 'Оплачено',
    dot: 'bg-warn-500',
    badge: 'bg-warn-50 text-warn-600 border-warn-100',
    text: 'text-warn-600',
  },
};

export const VAT_LABELS: Record<VatType, string> = {
  no_vat: 'Без НДС',
  vat0: 'НДС 0%',
  vat5: 'НДС 5%',
  vat7: 'НДС 7%',
  vat20: 'НДС 20%',
};

export const VAT_OPTIONS: { key: VatType; label: string; hint: string }[] = [
  { key: 'no_vat', label: 'Без НДС', hint: 'Налог не применяется' },
  { key: 'vat0', label: 'НДС 0%', hint: 'Международные перевозки, экспорт/импорт' },
  { key: 'vat5', label: 'НДС 5%', hint: 'Льготная ставка, УСН до 300 млн руб.' },
  { key: 'vat7', label: 'НДС 7%', hint: 'Льготная ставка, УСН до 450 млн руб.' },
  { key: 'vat20', label: 'НДС 20%', hint: 'Стандартная общая ставка' },
];

export const CLIENT_PAY_LABELS: Record<ClientPayStatus, string> = {
  unpaid: 'Не оплачен',
  partial: 'Частично',
  paid: 'Оплачен',
};

export const CLIENT_PAY_META: Record<ClientPayStatus, { dot: string; badge: string }> = {
  unpaid: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
  partial: { dot: 'bg-warn-500', badge: 'bg-warn-50 text-warn-600 border-warn-100' },
  paid: { dot: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700 border-accent-100' },
};

export const CARRIER_PAY_LABELS: Record<CarrierPayStatus, string> = {
  unpaid: 'Не оплачен',
  planned: 'В плане',
  paid: 'Оплачен',
};

export const CARRIER_PAY_META: Record<CarrierPayStatus, { dot: string; badge: string }> = {
  unpaid: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
  planned: { dot: 'bg-brand-500', badge: 'bg-brand-50 text-brand-700 border-brand-100' },
  paid: { dot: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700 border-accent-100' },
};

export const CLIENT_PAY_OPTIONS: ClientPayStatus[] = ['unpaid', 'partial', 'paid'];
export const CARRIER_PAY_OPTIONS: CarrierPayStatus[] = ['unpaid', 'planned', 'paid'];

export const demoOrders: Order[] = [
  {
    id: 'LOG-1042',
    date: '2026-11-01',
    client: 'ООО «ТехноСклад»',
    from: 'Москва',
    to: 'Казань',
    fromZip: '101000',
    toZip: '420011',
    carrier: 'ТК «Транзит-Логистик»',
    carrierSource: 'hired',
    ourEntity: 'ooo',
    managerName: 'Ирина Соколова',
    managerId: 'e2',
    cost: 145000,
    costVat: 'vat20',
    carrierCost: 112000,
    carrierCostVat: 'vat5',
    status: 'in_work',
    clientPayStatus: 'partial',
    clientPaidAmount: 70000,
    carrierPayStatus: 'unpaid',
    carrierPaidAmount: 0,
  },
  {
    id: 'LOG-1041',
    date: '2026-10-31',
    client: 'АО «Сибирский Хлеб»',
    from: 'Новосибирск',
    to: 'Омск',
    fromZip: '630000',
    toZip: '644000',
    carrier: 'ООД «Сибирь-Карго»',
    carrierSource: 'hired',
    ourEntity: 'ooo',
    managerName: 'Дмитрий Орлов',
    managerId: 'e3',
    cost: 82000,
    costVat: 'vat20',
    carrierCost: 61000,
    carrierCostVat: 'no_vat',
    status: 'delivered',
    clientPayStatus: 'paid',
    clientPaidAmount: 82000,
    carrierPayStatus: 'paid',
    carrierPaidAmount: 61000,
  },
  {
    id: 'LOG-1040',
    date: '2026-10-30',
    client: 'ООО «УралСтрой»',
    from: 'Екатеринбург',
    to: 'Челябинск',
    fromZip: '620000',
    toZip: '454000',
    carrier: 'КАМАЗ 65116 · Павел Кузнецов',
    carrierSource: 'own',
    truckId: 'tr1',
    trailerId: 'tr1',
    driverId: 'd1',
    ourEntity: 'ip',
    managerName: 'Алексей Морозов',
    managerId: 'e1',
    cost: 56000,
    costVat: 'no_vat',
    carrierCost: 42000,
    carrierCostVat: 'no_vat',
    status: 'problem',
    clientPayStatus: 'unpaid',
    clientPaidAmount: 0,
    carrierPayStatus: 'planned',
    carrierPaidAmount: 0,
  },
  {
    id: 'LOG-1039',
    date: '2026-10-29',
    client: 'ООО «БалтМаркет»',
    from: 'Санкт-Петербург',
    to: 'Калининград',
    fromZip: '190000',
    toZip: '236000',
    carrier: 'ООО «БалтЛайн»',
    carrierSource: 'hired',
    ourEntity: 'ooo',
    managerName: 'Ирина Соколова',
    managerId: 'e2',
    cost: 210000,
    costVat: 'vat0',
    carrierCost: 168000,
    carrierCostVat: 'vat7',
    status: 'paid',
    clientPayStatus: 'paid',
    clientPaidAmount: 210000,
    carrierPayStatus: 'paid',
    carrierPaidAmount: 168000,
  },
];

export const demoCounterparties: Counterparty[] = [
  {
    id: 'c1',
    name: 'ООО «ТехноСклад»',
    type: 'client',
    inn: '7701234567',
    phone: '+7 (495) 123-45-67',
    email: 'info@tecnosklad.ru',
    city: 'Москва',
    ordersCount: 14,
  },
  {
    id: 'c2',
    name: 'АО «Сибирский Хлеб»',
    type: 'client',
    inn: '5407654321',
    phone: '+7 (383) 234-56-78',
    email: 'office@sibhleb.ru',
    city: 'Новосибирск',
    ordersCount: 9,
  },
  {
    id: 'c3',
    name: 'ООО «УралСтрой»',
    type: 'client',
    inn: '6609876543',
    phone: '+7 (343) 345-67-89',
    email: 'info@uralstroy.ru',
    city: 'Екатеринбург',
    ordersCount: 6,
  },
  {
    id: 'c4',
    name: 'ООО «БалтМаркет»',
    type: 'client',
    inn: '7801111222',
    phone: '+7 (812) 111-22-33',
    email: 'hello@baltmarket.ru',
    city: 'Санкт-Петербург',
    ordersCount: 21,
  },
  {
    id: 't1',
    name: 'ТК «Транзит-Логистик»',
    type: 'carrier',
    inn: '7722334455',
    phone: '+7 (495) 222-33-44',
    email: 'dispatch@transit-log.ru',
    city: 'Москва',
    ordersCount: 38,
  },
  {
    id: 't2',
    name: 'ООД «Сибирь-Карго»',
    type: 'carrier',
    inn: '5433556677',
    phone: '+7 (383) 555-66-77',
    email: 'cargo@sibir.ru',
    city: 'Новосибирск',
    ordersCount: 27,
  },
  {
    id: 't3',
    name: 'ТК «Уральский Путь»',
    type: 'carrier',
    inn: '6611778899',
    phone: '+7 (343) 777-88-99',
    email: 'op@uralput.ru',
    city: 'Екатеринбург',
    ordersCount: 18,
  },
  {
    id: 't4',
    name: 'ООО «БалтЛайн»',
    type: 'carrier',
    inn: '7822445566',
    phone: '+7 (812) 444-55-66',
    email: 'logistics@baltline.ru',
    city: 'Санкт-Петербург',
    ordersCount: 44,
  },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
