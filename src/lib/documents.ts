import type { Order } from '@/lib/data';
import {
  formatCurrency,
  formatDate,
  netOfVat,
  vatAmount,
  VAT_LABELS,
  orderProfit,
  getOurEntity,
} from '@/lib/data';

export type DocType = 'invoice' | 'tn' | 'upd' | 'act';

export const DOC_LABELS: Record<DocType, string> = {
  invoice: 'Счёт на оплату',
  tn: 'Транспортная накладная',
  upd: 'УПД',
  act: 'Акт выполненных работ',
};

export const DOC_SHORT: Record<DocType, string> = {
  invoice: 'Счёт',
  tn: 'ТН',
  upd: 'УПД',
  act: 'Акт',
};

export function generateDocHtml(order: Order, type: DocType): string {
  const today = formatDate(new Date().toISOString());
  const orderDate = formatDate(order.date);
  const profit = orderProfit(order);
  const net = netOfVat(order.cost, order.costVat);
  const vat = vatAmount(order.cost, order.costVat);
  const ent = getOurEntity(order.ourEntity ?? 'ooo');

  const title = DOC_LABELS[type];
  const docNum = `${order.id}-${type.toUpperCase()}`;

  const vatRow = vat > 0 ? `
    <tr>
      <td contenteditable="true">В том числе НДС</td>
      <td class="num" contenteditable="true">${formatCurrency(vat)}</td>
    </tr>` : '';

  const requisitesBlock = type === 'invoice' ? `
    <div class="section">
      <h2 contenteditable="true">Реквизиты для оплаты</h2>
      <p contenteditable="true">Получатель: ${ent.name}</p>
      <p contenteditable="true">ИНН ${ent.inn}${ent.kpp !== '—' ? ' / КПП ' + ent.kpp : ''}</p>
      <p contenteditable="true">Р/с ${ent.account} в ${ent.bank}</p>
      <p contenteditable="true">К/с ${ent.ks}, БИК ${ent.bik}</p>
    </div>` : '';

  const marginBlock = (type === 'act' || type === 'upd') ? `
    <div class="section">
      <h2 contenteditable="true">Информация о марже</h2>
      <table class="items">
        <tr><th contenteditable="true">Показатель</th><th style="text-align:right;" contenteditable="true">Значение</th></tr>
        <tr><td contenteditable="true">Ставка клиента</td><td class="num" contenteditable="true">${formatCurrency(order.cost)}</td></tr>
        <tr><td contenteditable="true">Ставка перевозчика</td><td class="num" contenteditable="true">${formatCurrency(order.carrierCost)}</td></tr>
        <tr class="total"><td contenteditable="true">Маржа (без НДС)</td><td class="num" contenteditable="true">${formatCurrency(profit)}</td></tr>
      </table>
    </div>` : '';

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${title} № ${docNum}</title>
<style>
  @page { margin: 24mm 18mm; size: A4; }
  body { font-family: 'Times New Roman', Georgia, serif; color: #111827; font-size: 13px; line-height: 1.55; margin: 0; padding: 0; }
  .doc { max-width: 680px; margin: 0 auto; padding: 32px 8px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1d6bf2; padding-bottom: 14px; margin-bottom: 24px; }
  .header h1 { font-size: 18px; margin: 0 0 4px; font-weight: 700; }
  .header .meta { text-align: right; font-size: 12px; color: #4b5563; }
  .brand { font-size: 11px; color: #1d6bf2; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .parties { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
  .party h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 0 0 6px; font-weight: 600; }
  .party p { margin: 2px 0; }
  .section { margin: 18px 0; }
  .section h2 { font-size: 13px; margin: 0 0 8px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  table.items { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
  table.items td, table.items th { border: 1px solid #d1d5db; padding: 7px 10px; font-size: 12px; }
  table.items th { background: #f3f4f6; text-align: left; font-weight: 600; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .total { font-size: 15px; font-weight: 700; }
  .total td { padding-top: 12px !important; border-top: 2px solid #1d6bf2; }
  .sign { margin-top: 48px; display: flex; justify-content: space-between; gap: 40px; }
  .sign .line { border-top: 1px solid #9ca3af; width: 200px; padding-top: 4px; font-size: 11px; color: #6b7280; }
  .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 10px; color: #9ca3af; text-align: center; }
  .toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: #1e293b; color: white; font-family: 'Inter', sans-serif; font-size: 13px; }
  .toolbar .title { font-weight: 600; margin-right: auto; }
  .toolbar button { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 12px; transition: all 0.15s; }
  .toolbar .btn-pdf { background: #1d6bf2; color: white; }
  .toolbar .btn-pdf:hover { background: #1554c7; }
  .toolbar .btn-print { background: #e2e8f0; color: #334155; }
  .toolbar .btn-print:hover { background: #cbd5e1; }
  [contenteditable]:focus { outline: 2px solid #1d6bf2; outline-offset: 1px; background: #eff6ff; border-radius: 2px; }
  [contenteditable]:hover { background: #f8fafc; border-radius: 2px; }
  @media print { .toolbar { display: none; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="toolbar">
    <span class="title">${title} № ${docNum}</span>
    <button class="btn-pdf" onclick="downloadPdf()">⬇ Скачать PDF</button>
    <button class="btn-print" onclick="window.print()">🖨 Печать</button>
  </div>
  <div class="doc" style="margin-top:48px;">
    <div class="header">
      <div>
        <div class="brand" contenteditable="true">Логистик CRM</div>
        <h1 contenteditable="true">${title} № ${docNum}</h1>
        <p style="margin:2px 0; font-size:12px; color:#4b5563;" contenteditable="true">от ${today}</p>
      </div>
      <div class="meta">
        <p contenteditable="true"><strong>Заявка:</strong> ${order.id}</p>
        <p contenteditable="true"><strong>Дата заявки:</strong> ${orderDate}</p>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3 contenteditable="true">Исполнитель</h3>
        <p contenteditable="true"><strong>${ent.name}</strong></p>
        <p contenteditable="true">ИНН ${ent.inn}${ent.kpp !== '—' ? ', КПП ' + ent.kpp : ''}</p>
        <p contenteditable="true">${ent.address}</p>
        <p contenteditable="true">${ent.phone}</p>
      </div>
      <div class="party">
        <h3 contenteditable="true">${type === 'tn' ? 'Перевозчик' : 'Заказчик'}</h3>
        <p contenteditable="true"><strong>${order.client}</strong></p>
        <p contenteditable="true">Маршрут: ${order.from} ${order.fromZip} → ${order.to} ${order.toZip}</p>
        ${type === 'tn' ? `<p contenteditable="true">Перевозчик: ${order.carrier}</p>` : ''}
      </div>
    </div>

    <div class="section">
      <h2 contenteditable="true">Маршрут перевозки</h2>
      <table class="items">
        <tr><th style="width:50%" contenteditable="true">Пункт отправления</th><th style="width:50%" contenteditable="true">Пункт назначения</th></tr>
        <tr><td contenteditable="true">${order.from}${order.fromZip ? ', ' + order.fromZip : ''}</td><td contenteditable="true">${order.to}${order.toZip ? ', ' + order.toZip : ''}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2 contenteditable="true">Расчёт стоимости</h2>
      <table class="items">
        <tr><th style="width:70%" contenteditable="true">Наименование</th><th style="width:30%; text-align:right;" contenteditable="true">Сумма</th></tr>
        <tr><td contenteditable="true">Стоимость услуги</td><td class="num" contenteditable="true">${formatCurrency(order.cost)}</td></tr>
        <tr><td contenteditable="true">Ставка НДС</td><td contenteditable="true">${VAT_LABELS[order.costVat]}</td></tr>
        ${vatRow}
        <tr class="total"><td contenteditable="true">Итого к оплате</td><td class="num" contenteditable="true">${formatCurrency(order.cost)}</td></tr>
        <tr><td contenteditable="true">Сумма без НДС</td><td class="num" contenteditable="true">${formatCurrency(net)}</td></tr>
      </table>
    </div>

    ${requisitesBlock}
    ${marginBlock}

    <div class="sign">
      <div>
        <p style="margin:0 0 32px;" contenteditable="true"><strong>Исполнитель:</strong></p>
        <div class="line" contenteditable="true">Подпись / М.П.</div>
      </div>
      <div>
        <p style="margin:0 0 32px;" contenteditable="true"><strong>${type === 'tn' ? 'Перевозчик' : 'Заказчик'}:</strong></p>
        <div class="line" contenteditable="true">Подпись / М.П.</div>
      </div>
    </div>

    <div class="footer" contenteditable="true">Документ сформирован в системе «Логистик CRM» · ${today}</div>
  </div>
  <script>
    function downloadPdf() {
      var toolbar = document.querySelector('.toolbar');
      toolbar.style.display = 'none';
      document.title = '${title} № ${docNum}';
      setTimeout(function() {
        window.print();
        toolbar.style.display = '';
      }, 200);
    }
    document.querySelectorAll('[contenteditable]').forEach(function(el) {
      el.addEventListener('focus', function() { this.dataset.before = this.innerHTML; });
    });
  </script>
</body>
</html>`;
}

export function printDocument(order: Order, type: DocType): void {
  const html = generateDocHtml(order, type);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
