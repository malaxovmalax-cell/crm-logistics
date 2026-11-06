import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { searchCities, searchAddresses, findCityByName, findStreetZip, type CityRecord, type AddressRecord } from '@/lib/cities';

interface AddressFieldProps {
  label: string;
  city: string;
  zip: string;
  street?: string;
  error?: string;
  onCityChange: (city: string) => void;
  onZipChange: (zip: string) => void;
  onStreetChange?: (street: string) => void;
}

export default function AddressField({
  label,
  city,
  zip,
  street = '',
  error,
  onCityChange,
  onZipChange,
  onStreetChange,
}: AddressFieldProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const query = street ? `${city}, ${street}` : city;
  const addressResults = searchAddresses(query, 8);
  const cityResults = searchCities(city, 6);

  type Item = { label: string; sub: string; zip: string; city: string; street?: string };
  const results: Item[] = [];

  if (street || (city && addressResults.length > 0)) {
    addressResults.forEach((a) => {
      results.push({ label: `${a.city}, ${a.street}`, sub: a.region, zip: a.zip, city: a.city, street: a.street });
    });
  }
  if (city && cityResults.length > 0) {
    const existingCities = new Set(results.map((r) => r.city));
    cityResults.forEach((c) => {
      if (!existingCities.has(c.city)) {
        results.push({ label: c.city, sub: c.region, zip: c.zip, city: c.city });
      }
    });
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleCityInput = (value: string) => {
    onCityChange(value);
    setOpen(true);
    setActiveIndex(-1);
    const match = findCityByName(value);
    if (match && !street) onZipChange(match.zip);
  };

  const handleStreetInput = (value: string) => {
    onStreetChange?.(value);
    setOpen(true);
    setActiveIndex(-1);
    if (city) {
      const szip = findStreetZip(city, value);
      if (szip) onZipChange(szip);
    }
  };

  const handleZipInput = (value: string) => {
    onZipChange(value);
  };

  const select = (item: Item) => {
    onCityChange(item.city);
    onZipChange(item.zip);
    if (item.street && onStreetChange) onStreetChange(item.street);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div ref={wrapRef} className="relative">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={city}
            onChange={(e) => handleCityInput(e.target.value)}
            onFocus={() => { if (city) setOpen(true); }}
            onKeyDown={onKeyDown}
            placeholder="Город…"
            className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-sm placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
              error ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
            }`}
          />
          {city && !open && (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-pop overflow-hidden animate-fade-in max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={`${r.city}-${r.street ?? ''}-${r.zip}`}
                type="button"
                onClick={() => select(r)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-left transition-colors ${
                  i === activeIndex ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{r.sub}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0 ml-3">{r.zip}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {onStreetChange && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Улица</label>
          <input
            type="text"
            value={street}
            onChange={(e) => handleStreetInput(e.target.value)}
            onFocus={() => { if (street) setOpen(true); }}
            onKeyDown={onKeyDown}
            placeholder="Начните вводить улицу…"
            className="w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 border-slate-200 focus:border-brand-400"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Индекс</label>
        <input
          type="text"
          value={zip}
          onChange={(e) => handleZipInput(e.target.value)}
          placeholder="000000"
          maxLength={6}
          className={`w-full px-3 py-2 rounded-lg border bg-white text-sm font-mono placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            error ? 'border-err-300 focus:border-err-400' : 'border-slate-200 focus:border-brand-400'
          }`}
        />
      </div>
    </div>
  );
}

export { type CityRecord, type AddressRecord };
