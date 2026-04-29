'use client';
import { Wine, Globe, MapPin, Grape, DollarSign, RotateCcw } from 'lucide-react';

type FilterData = {
  types: string[];
  countries: string[];
  regions: string[];
  grapes: string[];
  minPrice: number;
  maxPrice: number;
};

type Props = {
  filters: FilterData;
  selectedType: string;
  selectedCountry: string;
  selectedRegion: string;
  selectedGrape: string;
  priceRange: [number, number];
  onTypeChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onGrapeChange: (v: string) => void;
  onPriceChange: (v: [number, number]) => void;
  onReset: () => void;
};

function FilterSelect({ icon: Icon, label, value, options, onChange }: { icon: any; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
        <Icon className="w-4 h-4 text-primary" /> {label}
      </label>
      <select
        value={value}
        onChange={(e: any) => onChange?.(e?.target?.value ?? '')}
        className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
      >
        <option value="">Todos</option>
        {(options ?? []).map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function FilterPanel(props: Props) {
  const { filters, selectedType, selectedCountry, selectedRegion, selectedGrape, priceRange, onTypeChange, onCountryChange, onRegionChange, onGrapeChange, onPriceChange, onReset } = props ?? {};

  return (
    <div className="bg-card rounded-xl p-5 border border-border/30 sticky top-20" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-base font-bold">Filtros</h3>
        <button onClick={onReset} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Limpiar filtros">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <FilterSelect icon={Wine} label="Tipo" value={selectedType} options={filters?.types ?? []} onChange={onTypeChange} />
      <FilterSelect icon={Globe} label="País" value={selectedCountry} options={filters?.countries ?? []} onChange={onCountryChange} />
      <FilterSelect icon={MapPin} label="Región" value={selectedRegion} options={filters?.regions ?? []} onChange={onRegionChange} />
      <FilterSelect icon={Grape} label="Cepa" value={selectedGrape} options={filters?.grapes ?? []} onChange={onGrapeChange} />

      {/* Price Range */}
      <div className="mb-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <DollarSign className="w-4 h-4 text-primary" /> Precio
        </label>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>${priceRange?.[0]?.toLocaleString?.('es-MX') ?? '0'}</span>
          <span className="flex-1" />
          <span>${priceRange?.[1]?.toLocaleString?.('es-MX') ?? '2000'}</span>
        </div>
        <input
          type="range"
          min={filters?.minPrice ?? 0}
          max={filters?.maxPrice ?? 2000}
          value={priceRange?.[0] ?? 0}
          onChange={(e: any) => onPriceChange?.([parseInt(e?.target?.value ?? '0'), priceRange?.[1] ?? 2000])}
          className="w-full accent-primary h-1 mb-2"
        />
        <input
          type="range"
          min={filters?.minPrice ?? 0}
          max={filters?.maxPrice ?? 2000}
          value={priceRange?.[1] ?? 2000}
          onChange={(e: any) => onPriceChange?.([priceRange?.[0] ?? 0, parseInt(e?.target?.value ?? '2000')])}
          className="w-full accent-primary h-1"
        />
      </div>
    </div>
  );
}
