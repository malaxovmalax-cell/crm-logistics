import type { Order } from '@/lib/data';
import {
  formatCurrency,
  formatDate,
  netOfVat,
  vatAmount,
  VAT_LABELS,
  getOurEntity,
} from '@/lib/data';

export type DocType = 'invoice' | 'tn' | 'upd' | 'act';

export const DOC_LABELS: Record<DocType, string> = {
  invoice: 'Счёт на оплату',
  tn: 'Транспортная накладная',
  upd: 'Универсальный передаточный документ (УПД)',
  act: 'Акт выполненных работ',
};

export const DOC_SHORT: Record<DocType, string> = {
  invoice: 'Счёт',
  tn: 'ТН',
  upd: 'УПД',
  act: 'Акт',
};

/** Экранирование текста перед вставкой в HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Номер документа. seq должен выдаваться сервером (база данных),
 * а не браузером: иначе нумерация не будет сквозной.
 * Пример: ООО, счёт, 42 за 2026 год -> "ООО-СЧ-2026-00042"
 */
export function formatDocNumber(
  entity: 'ooo' | 'ip',
  type: DocType,
  seq: number,
  year: number = new Date().getFullYear(),
): string {
  const prefixes: Record<DocType, string> = { invoice: 'СЧ', tn: 'ТН', upd: 'УПД', act: 'АКТ' };
  const org = entity === 'ooo' ? 'ООО' : 'ИП';
  return `${org}-${prefixes[type]}-${year}-${String(seq).padStart(5, '0')}`;
}

export function generateDocHtml(order: Order, type: DocType, docNumber: string): string {
  const today = formatDate(new Date().toISOString());
  const orderDate = formatDate(order.date);
  const net = netOfVat(order.cost, order.costVat);
  const vat = vatAmount(order.cost, order.costVat);
  const entityCode = order.ourEntity ?? 'ooo';
  const ent = getOurEntity(entityCode);
  const isIp = entityCode === 'ip';

  const title = DOC_LABELS[type];
  const issuerLabel = type === 'tn' ? 'Перевозчик' : 'Исполнитель';
  const customerLabel = type === 'tn' ? 'Грузоотправитель / заказчик' : 'Заказчик';

  const vatRow = vat > 0
    ? `<tr><td>В том числе НДС</td><td class="num">${formatCurrency(vat)}</td></tr>`
    : '';

  const requisitesBlock = type === 'invoice' ? `
    <div class="section">
      <h2>Реквизиты для оплаты</h2>
      <p>Получатель: ${esc(ent.name)}</p>
      <p>ИНН ${esc(ent.inn)}${!isIp && ent.kpp !== '—' ? ' / КПП ' + esc(ent.kpp) : ''}</p>
      <p>Р/с ${esc(ent.account)} в ${esc(ent.bank)}</p>
      <p>К/с ${esc(ent.ks)}, БИК ${esc(ent.bik)}</p>
    </div>` : '';

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${esc(title)} № ${esc(docNumber)}</title>
<style>
  @page { margin: 24mm 18mm; size: A4; }
  body { font-family: 'Times New Roman', Georgia, serif; color: #111827; font-size: 13px; line-height: 1.55; margin: 0; }
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
  table.items td, table.items th { border: 1px solid #d1d5db; padding: 7px 10px; font-size: 12px; text-align: left; }
  table.items th { background: #f3f4f6; font-weight: 600; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .total { font-size: 15px; font-weight: 700; }
  .total td { padding-top: 12px; border-top: 2px solid #1d6bf2; }
  .sign { margin-top: 48px; display: flex; justify-content: space-between; gap: 40px; }
  .sign .line { border-top: 1px solid #9ca3af; width: 200px; padding-top: 4px; font-size: 11px; color: #6b7280; }
  .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 10px; color: #9ca3af; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="doc">
    <div class="header">
      <div>
        <div class="brand">Логистик CRM</div>
        <h1>${esc(title)} № ${esc(docNumber)}</h1>
        <p style="margin:2px 0; font-size:12px; color:#4b5563;">от ${esc(today)}</p>
      </div>
      <div class="meta">
        <p><strong>Заявка:</strong> ${esc(order.id)}</p>
        <p><strong>Дата заявки:</strong> ${esc(orderDate)}</p>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>${issuerLabel}</h3>
        <p><strong>${esc(ent.name)}</strong></p>
        <p>ИНН ${esc(ent.inn)}${!isIp && ent.kpp !== '—' ? ', КПП ' + esc(ent.kpp) : ''}</p>
        <p>${esc(ent.address)}</p>
        <p>${esc(ent.phone)}</p>
      </div>
      <div class="party">
        <h3>${customerLabel}</h3>
        <p><strong>${esc(order.client)}</strong></p>
        <p>Маршрут: ${esc(order.from)} ${esc(order.fromZip)} → ${esc(order.to)} ${esc(order.toZip)}</p>
        ${type === 'tn' ? `<p>Перевозчик: ${esc(order.carrier)}</p>` : ''}
      </div>
    </div>

    <div class="section">
      <h2>Маршрут перевозки</h2>
      <table class="items">
        <tr><th style="width:50%">Пункт отправления</th><th style="width:50%">Пункт назначения</th></tr>
        <tr>
          <td>${esc(order.from)}${order.fromZip ? ', ' + esc(order.fromZip) : ''}</td>
          <td>${esc(order.to)}${order.toZip ? ', ' + esc(order.toZip) : ''}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <h2>Расчёт стоимости</h2>
      <table class="items">
        <tr><th style="width:70%">Наименование</th><th style="width:30%; text-align:right;">Сумма</th></tr>
        <tr><td>Стоимость услуги</td><td class="num">${formatCurrency(order.cost)}</td></tr>
        <tr><td>Ставка НДС</td><td>${esc(VAT_LABELS[order.costVat])}</td></tr>
        ${vatRow}
        <tr class="total"><td>Итого к оплате</td><td class="num">${formatCurrency(order.cost)}</td></tr>
        <tr><td>Сумма без НДС</td><td class="num">${formatCurrency(net)}</td></tr>
      </table>
    </div>

    ${requisitesBlock}

    <div class="sign">
      <div>
        <p style="margin:0 0 32px;"><strong>${issuerLabel}:</strong></p>
        <div class="line">Подпись / М.П.</div>
      </div>
      <div>
        <p style="margin:0 0 32px;"><strong>${customerLabel}:</strong></p>
        <div class="line">Подпись / М.П.</div>
      </div>
    </div>

    <div class="footer">Документ сформирован в системе «Логистик CRM» · ${esc(today)}</div>
  </div>
</body>
</html>`;
}

/** Открывает документ как файл .html: его можно распечатать или сохранить в PDF. */
export function printDocument(order: Order, type: DocType, docNumber: string): void {
  const html = generateDocHtml(order, type, docNumber);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${DOC_SHORT[type]}_${docNumber}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}