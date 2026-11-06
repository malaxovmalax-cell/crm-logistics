import { useState, useRef, useEffect } from 'react';
import { Receipt, ChevronDown, Check } from 'lucide-react';
import { type VatType, VAT_OPTIONS, formatCurrency, vatAmount, vatRatePercent } from '@/lib/data';

interface VatSelectorProps {
  amount: number;
  vat: VatType;
  onChange: (vat: VatType) => void;
}

export default function VatSelector({ amount, vat, onChange }: VatSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = VAT_OPTIONS.find((o) => o.key === vat)!;
  const rate = vatRatePercent(vat);
  const tax = vatAmount(amount, vat);
  const showHint = rate > 0 && amount > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 transition-all"
      >
        <span className="flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-brand-500" />
          {current.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-pop overflow-hidden animate-fade-in">
          {VAT_OPTIONS.map((opt) => {
            const active = vat === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-left transition-colors ${
                  active ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${active ? 'text-brand-700' : 'text-slate-700'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{opt.hint}</p>
                </div>
                {active && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {showHint && (
        <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
          В том числе НДС {rate}% — <span className="text-slate-700 font-semibold">{formatCurrency(tax)} руб.</span>
        </p>
      )}
    </div>
  );
}
