import { useEffect, useState, useRef } from 'react';
import {
  X, Info, FileText, Paperclip, FileDown, Download, Check, Clock, UploadCloud,
  Pencil, Save, Building2, Truck, User, Wallet,
} from 'lucide-react';
import type { Order, ClientPayStatus, CarrierPayStatus, VatType, OrderStatus } from '@/lib/data';
import {
  STATUS_META, STATUS_LABELS, VAT_LABELS, VAT_OPTIONS, OUR_ENTITIES,
  CLIENT_PAY_LABELS, CLIENT_PAY_META, CARRIER_PAY_LABELS, CARRIER_PAY_META,
  CLIENT_PAY_OPTIONS, CARRIER_PAY_OPTIONS, demoTrucks, demoTrailers, demoDrivers,
  formatCurrency, formatDate, orderProfit, netOfVat, vatAmount, vatRatePercent,
  getOurEntity, clientDebt, carrierDebt, calcClientPayStatus, calcCarrierPayStatus,
} from '@/lib/data';
import { printDocument, DOC_LABELS, type DocType } from '@/lib/documents';
import { useAccess } from '@/lib/access';
import { demoEmployees } from '@/lib/permissions';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdate: (order: Order) => void;
}

type Tab = 'info' | 'docs';

interface ScanFile {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
  blob: Blob;
  side?: 'client' | 'carrier';
}

type DocStatus = 'none' | 'scan_received' | 'original_expected' | 'original_received';

interface DocItem {
  id: string;
  label: string;
  status: DocStatus;
}

const CLIENT_DOC_DEFS: { id: string; label: string }[] = [
  { id: 'cl_contract', label: 'Договор' },
  { id: 'cl_invoice', label: 'Счёт' },
  { id: 'cl_upd', label: 'УПД' },
  { id: 'cl_act', label: 'Акт' },
  { id: 'cl_sf', label: 'Счёт-фактура' },
];

const CARRIER_DOC_DEFS: { id: string; label: string }[] = [
  { id: 'cr_contract', label: 'Договор' },
  { id: 'cr_tn', label: 'Транспортная накладная' },
  { id: 'cr_invoice', label: 'Счёт' },
  { id: 'cr_act', label: 'Акт' },
  { id: 'cr_sf', label: 'Счёт-фактура' },
];

const DOC_STATUS_META: Record<DocStatus, { label: string; dot: string; badge: string }> = {
  none: { label: 'Ожидает', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
  scan_received: { label: 'Скан получен', dot: 'bg-brand-500', badge: 'bg-brand-50 text-brand-700 border-brand-100' },
  original_expected: { label: 'Ожидаем оригинал', dot: 'bg-warn-500', badge: 'bg-warn-50 text-warn-600 border-warn-100' },
  original_received: { label: 'Оригинал получен', dot: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700 border-accent-100' },
};

const DOC_STATUS_CYCLE: DocStatus[] = ['none', 'scan_received', 'original_expected', 'original_received'];

function StatusBadge({ label, dot, badge }: { label: string; dot: string; badge: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 font-medium">{children}</span>
    </div>
  );
}

export default function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
  const { can } = useAccess();
  const [tab, setTab] = useState<Tab>('info');
  const [scans, setScans] = useState<ScanFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Order | null>(null);
  const [quickPay, setQuickPay] = useState<null | 'client' | 'carrier'>(null);
  const [payAmount, setPayAmount] = useState('');
  const [clientDocStatuses, setClientDocStatuses] = useState<Record<string, DocStatus>>({});
  const [carrierDocStatuses, setCarrierDocStatuses] = useState<Record<string, DocStatus>>({});
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (order) {
      setTab('info');
      setEditing(false);
      setEditForm(null);
      // Clean up old blob URLs
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
      setScans([
        { id: 's1', name: 'Счёт_' + order.id + '.pdf', type: 'Счёт', uploadedBy: 'Ирина С.', date: '2026-11-01', url: '', blob: new Blob(['Счёт ' + order.id], { type: 'text/plain' }) },
        { id: 's2', name: 'Договор_' + order.client.slice(0, 12) + '.pdf', type: 'Договор', uploadedBy: 'Алексей М.', date: '2026-10-30', url: '', blob: new Blob(['Договор ' + order.id], { type: 'text/plain' }) },
      ]);
    }
  }, [order]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && order) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [order, onClose]);

  if (!order) return null;

  const meta = STATUS_META[order.status];
  const profit = orderProfit(order);
  const clientNet = netOfVat(order.cost, order.costVat);
  const clientVat = vatAmount(order.cost, order.costVat);
  const carrierNet = netOfVat(order.carrierCost, order.carrierCostVat);
  const carrierVat = vatAmount(order.carrierCost, order.carrierCostVat);

  const handleUpload = (files: FileList | null, side: 'client' | 'carrier' = 'client') => {
    if (!files) return;
    const newScans: ScanFile[] = Array.from(files).map((f, i) => ({
      id: `s${Date.now()}-${i}`,
      name: f.name,
      type: side === 'client' ? 'Документ клиента' : 'Документ перевозчика',
      uploadedBy: 'Алексей М.',
      date: new Date().toISOString().slice(0, 10),
      url: URL.createObjectURL(f),
      blob: f,
      side,
    }));
    blobUrlsRef.current.push(...newScans.map((s) => s.url));
    setScans((prev) => [...prev, ...newScans]);
    if (side === 'client' && newScans.length > 0) {
      setClientDocStatuses((prev) => {
        const next = { ...prev };
        const firstId = CLIENT_DOC_DEFS.find((d) => !next[d.id])?.id;
        if (firstId) next[firstId] = 'scan_received';
        return next;
      });
    }
    if (side === 'carrier' && newScans.length > 0) {
      setCarrierDocStatuses((prev) => {
        const next = { ...prev };
        const firstId = CARRIER_DOC_DEFS.find((d) => !next[d.id])?.id;
        if (firstId) next[firstId] = 'scan_received';
        return next;
      });
    }
  };

  const openScan = (scan: ScanFile) => {
    if (scan.url) {
      window.open(scan.url, '_blank');
    } else {
      const url = URL.createObjectURL(scan.blob);
      window.open(url, '_blank');
    }
  };

  const downloadScan = (scan: ScanFile) => {
    const url = scan.url || URL.createObjectURL(scan.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = scan.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const startEdit = () => {
    setEditForm({ ...order });
    setEditing(true);
  };

  const saveEdit = () => {
    if (editForm) {
      onUpdate(editForm);
      setEditing(false);
      setEditForm(null);
    }
  };

  const updateField = <K extends keyof Order>(key: K, value: Order[K]) => {
    setEditForm((f) => f ? { ...f, [key]: value } : f);
  };

  const submitQuickPay = (target: 'client' | 'carrier') => {
    const amount = Number(payAmount) || 0;
    if (amount <= 0) return;
    if (target === 'client') {
      const newPaid = order.clientPaidAmount + amount;
      onUpdate({
        ...order,
        clientPaidAmount: newPaid,
        clientPayStatus: calcClientPayStatus(newPaid, order.cost),
      });
    } else {
      const newPaid = order.carrierPaidAmount + amount;
      onUpdate({
        ...order,
        carrierPaidAmount: newPaid,
        carrierPayStatus: calcCarrierPayStatus(newPaid, order.carrierCost),
      });
    }
    setQuickPay(null);
    setPayAmount('');
  };

  const toggleDocStatus = (side: 'client' | 'carrier', docId: string) => {
    const setter = side === 'client' ? setClientDocStatuses : setCarrierDocStatuses;
    setter((prev) => {
      const current = prev[docId] || 'none';
      const idx = DOC_STATUS_CYCLE.indexOf(current);
      const nextStatus = DOC_STATUS_CYCLE[(idx + 1) % DOC_STATUS_CYCLE.length];
      return { ...prev, [docId]: nextStatus };
    });
  };

  const clientDocs: DocItem[] = CLIENT_DOC_DEFS.map((d) => ({
    ...d,
    status: clientDocStatuses[d.id] || 'none',
  }));
  const carrierDocs: DocItem[] = CARRIER_DOC_DEFS.map((d) => ({
    ...d,
    status: carrierDocStatuses[d.id] || 'none',
  }));

  const tabs: { id: Tab; label: string; icon: typeof Info }[] = [
    { id: 'info', label: 'Информация', icon: Info },
    { id: 'docs', label: 'Документы', icon: FileText },
  ];

  const ent = getOurEntity(order.ourEntity ?? 'ooo');
  const cDebt = clientDebt(order);
  const carrDebt = carrierDebt(order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-pop animate-scale-in max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">
                Заявка {order.id}
              </h2>
              <p className="text-xs text-slate-400">
                {order.client} · {formatDate(order.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!editing && can('orders.edit') && (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 text-brand-700 text-sm font-semibold hover:bg-brand-100 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Редактировать
              </button>
            )}
            {editing && (
              <button
                onClick={saveEdit}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1 border-b border-slate-200">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all duration-200 ${
                    active
                      ? 'border-brand-500 text-brand-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-5">
          {tab === 'info' && (
            <div className="space-y-5 animate-fade-in">
              {editing && editForm ? (
                <EditForm form={editForm} updateField={updateField} canEditManager={can('orders.delete')} />
              ) : (
                <>
                  {/* Statuses */}
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge label={meta.label} dot={meta.dot} badge={meta.badge} />
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${CLIENT_PAY_META[order.clientPayStatus].badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${CLIENT_PAY_META[order.clientPayStatus].dot}`} />
                      Клиент: {CLIENT_PAY_LABELS[order.clientPayStatus]}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${CARRIER_PAY_META[order.carrierPayStatus].badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${CARRIER_PAY_META[order.carrierPayStatus].dot}`} />
                      Перевозчик: {CARRIER_PAY_LABELS[order.carrierPayStatus]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-slate-100 text-slate-600 border-slate-200">
                      <Building2 className="w-3 h-3" />
                      {ent.name}
                    </span>
                  </div>

                  {/* Payment info blocks (status auto-calculated) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Client payment */}
                    <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-600">Оплата от клиента</label>
                        {can('orders.edit') && (
                          <button
                            onClick={() => { setQuickPay(quickPay === 'client' ? null : 'client'); setPayAmount(''); }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white text-brand-500 hover:bg-brand-50 hover:border-brand-300 transition-all"
                            title="Внести платеж"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${CLIENT_PAY_META[order.clientPayStatus].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${CLIENT_PAY_META[order.clientPayStatus].dot}`} />
                        {CLIENT_PAY_LABELS[order.clientPayStatus]}
                      </span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-slate-400">Ставка</span><span className="font-semibold text-slate-700">{formatCurrency(order.cost)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Оплачено</span><span className="font-semibold text-accent-600">{formatCurrency(order.clientPaidAmount)}</span></div>
                        <div className="flex justify-between pt-1 border-t border-slate-200/60"><span className="text-slate-400">Остаток долга</span><span className={`font-bold ${cDebt > 0 ? 'text-err-600' : 'text-accent-600'}`}>{formatCurrency(cDebt)}</span></div>
                      </div>
                      {quickPay === 'client' && (
                        <div className="flex items-center gap-2 animate-fade-in pt-1">
                          <input
                            type="number"
                            autoFocus
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitQuickPay('client'); if (e.key === 'Escape') { setQuickPay(null); setPayAmount(''); } }}
                            placeholder="Сумма нового платежа, ₽"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                          />
                          <button
                            onClick={() => submitQuickPay('client')}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Добавить
                          </button>
                          <button
                            onClick={() => { setQuickPay(null); setPayAmount(''); }}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Carrier payment */}
                    <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-600">Оплата перевозчику</label>
                        {can('orders.edit') && (
                          <button
                            onClick={() => { setQuickPay(quickPay === 'carrier' ? null : 'carrier'); setPayAmount(''); }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white text-brand-500 hover:bg-brand-50 hover:border-brand-300 transition-all"
                            title="Внести платеж"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${CARRIER_PAY_META[order.carrierPayStatus].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${CARRIER_PAY_META[order.carrierPayStatus].dot}`} />
                        {CARRIER_PAY_LABELS[order.carrierPayStatus]}
                      </span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-slate-400">Ставка</span><span className="font-semibold text-slate-700">{formatCurrency(order.carrierCost)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Оплачено</span><span className="font-semibold text-accent-600">{formatCurrency(order.carrierPaidAmount)}</span></div>
                        <div className="flex justify-between pt-1 border-t border-slate-200/60"><span className="text-slate-400">Остаток долга</span><span className={`font-bold ${carrDebt > 0 ? 'text-err-600' : 'text-accent-600'}`}>{formatCurrency(carrDebt)}</span></div>
                      </div>
                      {quickPay === 'carrier' && (
                        <div className="flex items-center gap-2 animate-fade-in pt-1">
                          <input
                            type="number"
                            autoFocus
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitQuickPay('carrier'); if (e.key === 'Escape') { setQuickPay(null); setPayAmount(''); } }}
                            placeholder="Сумма нового платежа, ₽"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                          />
                          <button
                            onClick={() => submitQuickPay('carrier')}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Добавить
                          </button>
                          <button
                            onClick={() => { setQuickPay(null); setPayAmount(''); }}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route */}
                  <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Маршрут перевозки</h3>
                    <InfoRow label="Пункт отправления">
                      {order.from}{order.fromZip ? `, ${order.fromZip}` : ''}
                    </InfoRow>
                    <InfoRow label="Пункт назначения">
                      {order.to}{order.toZip ? `, ${order.toZip}` : ''}
                    </InfoRow>
                    <InfoRow label="Перевозчик">{order.carrier}</InfoRow>
                    <InfoRow label="Тип транспорта">
                      {order.carrierSource === 'own' ? 'Собственный транспорт' : 'Наемный перевозчик'}
                    </InfoRow>
                    <InfoRow label="Менеджер">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {order.managerName || '—'}
                      </span>
                    </InfoRow>
                  </div>

                  {/* Rate & VAT details */}
                  {can('finance.client_cost') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ставка клиента</h3>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(order.cost)}</div>
                        <div className="mt-1 text-xs text-slate-500">{VAT_LABELS[order.costVat]}</div>
                        <div className="mt-3 space-y-1 text-xs">
                          <div className="flex justify-between"><span className="text-slate-400">Чистыми (без НДС)</span><span className="font-semibold text-slate-700">{formatCurrency(clientNet)}</span></div>
                          {clientVat > 0 && <div className="flex justify-between"><span className="text-slate-400">НДС {vatRatePercent(order.costVat)}%</span><span className="font-semibold text-slate-700">{formatCurrency(clientVat)}</span></div>}
                        </div>
                      </div>

                      {can('finance.carrier_cost') && (
                        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ставка перевозчика</h3>
                          <div className="text-2xl font-bold text-err-600">{formatCurrency(order.carrierCost)}</div>
                          <div className="mt-1 text-xs text-slate-500">{VAT_LABELS[order.carrierCostVat]}</div>
                          <div className="mt-3 space-y-1 text-xs">
                            <div className="flex justify-between"><span className="text-slate-400">Чистыми (без НДС)</span><span className="font-semibold text-slate-700">{formatCurrency(carrierNet)}</span></div>
                            {carrierVat > 0 && <div className="flex justify-between"><span className="text-slate-400">НДС {vatRatePercent(order.carrierCostVat)}%</span><span className="font-semibold text-slate-700">{formatCurrency(carrierVat)}</span></div>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {can('finance.profit') && (
                    <div className="flex items-center justify-between bg-accent-50 border border-accent-100 rounded-xl px-4 py-3">
                      <span className="text-sm font-semibold text-accent-700">Маржа (без НДС)</span>
                      <span className={`text-lg font-bold ${profit >= 0 ? 'text-accent-700' : 'text-err-600'}`}>
                        {formatCurrency(profit)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'docs' && (
            <div className="space-y-5 animate-fade-in">
              {/* Generate documents */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Сформировать документ</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['invoice', 'tn', 'upd', 'act'] as DocType[]).map((dt) => (
                    <button
                      key={dt}
                      onClick={() => printDocument(editing ? editForm! : order, dt)}
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-brand-300 hover:bg-brand-50/40 transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors shrink-0">
                        <FileDown className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 truncate">{DOC_LABELS[dt]}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Все поля документа редактируемы. Используйте «Скачать PDF» и «Печать» в окне документа.
                </p>
              </div>

              {/* Client documents */}
              <DocSection
                title="Документы клиента"
                side="client"
                docs={clientDocs}
                scans={scans}
                canEdit={can('orders.edit')}
                onToggleStatus={(docId) => toggleDocStatus('client', docId)}
                onUpload={(files) => handleUpload(files, 'client')}
                dragOver={dragOver}
                setDragOver={setDragOver}
                onOpenScan={openScan}
                onDownloadScan={downloadScan}
              />

              {/* Carrier documents */}
              <DocSection
                title="Документы перевозчика"
                side="carrier"
                docs={carrierDocs}
                scans={scans}
                canEdit={can('orders.edit')}
                onToggleStatus={(docId) => toggleDocStatus('carrier', docId)}
                onUpload={(files) => handleUpload(files, 'carrier')}
                dragOver={dragOver}
                setDragOver={setDragOver}
                onOpenScan={openScan}
                onDownloadScan={downloadScan}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocSection({
  title,
  side,
  docs,
  scans,
  canEdit,
  onToggleStatus,
  onUpload,
  dragOver,
  setDragOver,
  onOpenScan,
  onDownloadScan,
}: {
  title: string;
  side: 'client' | 'carrier';
  docs: { id: string; label: string; status: DocStatus }[];
  scans: ScanFile[];
  canEdit: boolean;
  onToggleStatus: (docId: string) => void;
  onUpload: (files: FileList | null) => void;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onOpenScan: (s: ScanFile) => void;
  onDownloadScan: (s: ScanFile) => void;
}) {
  const sideScans = scans.filter((s) => s.side === side || (!s.side && side === 'client'));
  const uploadId = `upload-${side}`;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200/80 bg-slate-50/60">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {/* Document checklist */}
        <div className="space-y-1.5">
          {docs.map((doc) => {
            const sm = DOC_STATUS_META[doc.status];
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40"
              >
                <span className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${sm.dot}`}>
                  {doc.status === 'original_received' ? (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  ) : doc.status === 'scan_received' ? (
                    <FileText className="w-3 h-3 text-white" />
                  ) : (
                    <Clock className="w-3 h-3 text-white" />
                  )}
                </span>
                <span className="text-sm font-medium text-slate-700 flex-1 min-w-0">{doc.label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sm.badge} whitespace-nowrap`}>
                  {sm.label}
                </span>
                {canEdit && (
                  <button
                    onClick={() => onToggleStatus(doc.id)}
                    className="text-[10px] font-semibold text-brand-600 hover:text-brand-700 transition-colors px-1.5 py-0.5 rounded border border-slate-200 hover:border-brand-300"
                    title="Переключить статус"
                  >
                    ▸
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload zone */}
        {canEdit && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onUpload(e.dataTransfer.files);
            }}
            className={`flex items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              dragOver
                ? 'border-brand-400 bg-brand-50/50'
                : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
            }`}
            onClick={() => document.getElementById(uploadId)?.click()}
          >
            <UploadCloud className="w-5 h-5 text-brand-400" />
            <span className="text-xs font-semibold text-slate-600">Загрузить скан</span>
            <input
              id={uploadId}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
          </div>
        )}

        {/* Uploaded scans for this side */}
        {sideScans.length > 0 && (
          <div className="space-y-1.5">
            {sideScans.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200/60 bg-white hover:bg-slate-50/60 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <button
                  onClick={() => onOpenScan(s)}
                  className="text-xs font-medium text-slate-700 hover:text-brand-600 transition-colors truncate flex-1 text-left"
                >
                  {s.name}
                </button>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(s.date)}</span>
                <button
                  onClick={() => onDownloadScan(s)}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700 transition-colors shrink-0"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditForm({ form, updateField, canEditManager }: { form: Order; updateField: <K extends keyof Order>(key: K, value: Order[K]) => void; canEditManager: boolean }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Our entity */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Наша организация</label>
        <div className="flex flex-wrap gap-1.5">
          {OUR_ENTITIES.map((ent) => (
            <button
              key={ent.id}
              onClick={() => updateField('ourEntity', ent.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                form.ourEntity === ent.id
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              {ent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Client */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Клиент</label>
          <input
            type="text"
            value={form.client}
            onChange={(e) => updateField('client', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Менеджер</label>
          {canEditManager ? (
            <select
              value={form.managerId}
              onChange={(e) => {
                const emp = demoEmployees.find((emp) => emp.id === e.target.value);
                if (emp) {
                  updateField('managerId', emp.id);
                  updateField('managerName', emp.name);
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            >
              {demoEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={form.managerName}
              readOnly
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm font-medium text-slate-500"
            />
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Статус заявки</label>
        <select
          value={form.status}
          onChange={(e) => updateField('status', e.target.value as OrderStatus)}
          className="sm:w-56 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
        >
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Route */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Откуда</label>
          <input
            type="text"
            value={form.from}
            onChange={(e) => updateField('from', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Куда</label>
          <input
            type="text"
            value={form.to}
            onChange={(e) => updateField('to', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
        </div>
      </div>

      {/* Carrier source */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Перевозчик</label>
        {form.carrierSource === 'own' ? (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5">
            <Truck className="w-4 h-4 text-brand-500" />
            Собственный транспорт: {form.carrier}
          </div>
        ) : (
          <input
            type="text"
            value={form.carrier}
            onChange={(e) => updateField('carrier', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
        )}
      </div>

      {/* Finances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Ставка клиента</label>
          <input
            type="number"
            value={form.cost}
            onChange={(e) => updateField('cost', Number(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
          <select
            value={form.costVat}
            onChange={(e) => updateField('costVat', e.target.value as VatType)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          >
            {VAT_OPTIONS.map((v) => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Ставка перевозчика</label>
          <input
            type="number"
            value={form.carrierCost}
            onChange={(e) => updateField('carrierCost', Number(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
          <select
            value={form.carrierCostVat}
            onChange={(e) => updateField('carrierCostVat', e.target.value as VatType)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          >
            {VAT_OPTIONS.map((v) => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment statuses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Оплата от клиента</label>
          <select
            value={form.clientPayStatus}
            onChange={(e) => updateField('clientPayStatus', e.target.value as ClientPayStatus)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          >
            {CLIENT_PAY_OPTIONS.map((s) => (
              <option key={s} value={s}>{CLIENT_PAY_LABELS[s]}</option>
            ))}
          </select>
          {form.clientPayStatus === 'partial' && (
            <input
              type="number"
              value={form.clientPaidAmount}
              onChange={(e) => updateField('clientPaidAmount', Number(e.target.value) || 0)}
              placeholder="Получено, ₽"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            />
          )}
        </div>
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Оплата перевозчику</label>
          <select
            value={form.carrierPayStatus}
            onChange={(e) => updateField('carrierPayStatus', e.target.value as CarrierPayStatus)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          >
            {CARRIER_PAY_OPTIONS.map((s) => (
              <option key={s} value={s}>{CARRIER_PAY_LABELS[s]}</option>
            ))}
          </select>
          {form.carrierPayStatus === 'planned' && (
            <input
              type="number"
              value={form.carrierPaidAmount}
              onChange={(e) => updateField('carrierPaidAmount', Number(e.target.value) || 0)}
              placeholder="Выплачено, ₽"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            />
          )}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Дата</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => updateField('date', e.target.value)}
          className="sm:w-56 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
        />
      </div>
    </div>
  );
}
