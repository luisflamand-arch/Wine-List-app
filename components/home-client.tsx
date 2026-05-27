'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wine, Search, Filter, ChevronRight, Grape, MapPin, Globe, X, SlidersHorizontal, ArrowLeft, Settings, Star, Utensils } from 'lucide-react';
import { HERO_BG, WINE_TYPE_IMAGES } from '@/lib/constants';
import { WineCard } from '@/components/wine-card';
import { WineDetail } from '@/components/wine-detail';
import { FilterPanel } from '@/components/filter-panel';
import { WineTypeIcon } from '@/components/wine-type-icon';

type WineItem = {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  grape: string;
  classification: string | null;
  vintage: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  description: string | null;
  tastingNotes: string | null;
};

type FilterData = {
  types: string[];
  countries: string[];
  regions: string[];
  grapes: string[];
  minPrice: number;
  maxPrice: number;
};

type Settings = {
  restaurantName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
};

export function HomeClient() {
  const router = useRouter();
  const [view, setView] = useState<'home' | 'list' | 'detail' | 'maridaje'>('home');
  const [wines, setWines] = useState<WineItem[]>([]);
  const [filters, setFilters] = useState<FilterData>({ types: [], countries: [], regions: [], grapes: [], minPrice: 0, maxPrice: 2000 });
  const [settings, setSettings] = useState<Settings>({ restaurantName: 'La Vinoteca', primaryColor: '#8B6914', secondaryColor: '#1A1A2E', accentColor: '#D4AF37', logoUrl: null, backgroundImageUrl: null });
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedGrape, setSelectedGrape] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWine, setSelectedWine] = useState<WineItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [specials, setSpecials] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [recommendedWines, setRecommendedWines] = useState<any[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r?.json()).then(d => { if (d) setSettings(d); }).catch(() => {});
    fetch('/api/specials?active=true&dateRange=true').then(r => r?.json()).then(d => { if (Array.isArray(d)) setSpecials(d); }).catch(() => {});
    fetchFilters();
  }, []);

  // Apply dynamic colors to document
  useEffect(() => {
    if (typeof document !== 'undefined' && settings) {
      const root = document.documentElement;
      if (settings.primaryColor) root.style.setProperty('--primary-dynamic', settings.primaryColor);
      if (settings.secondaryColor) root.style.setProperty('--secondary-dynamic', settings.secondaryColor);
      if (settings.accentColor) root.style.setProperty('--accent-dynamic', settings.accentColor);
    }
  }, [settings]);

  const fetchFilters = async (type?: string, country?: string, region?: string, resetPrice?: boolean) => {
    const params = new URLSearchParams();
    const t = type ?? selectedType;
    const c = country ?? selectedCountry;
    const r = region ?? selectedRegion;
    if (t) params.set('type', t);
    if (c) params.set('country', c);
    if (r) params.set('region', r);
    try {
      const res = await fetch(`/api/wines/filters?${params.toString()}`);
      const d = await res?.json();
      if (d) {
        setFilters(d);
        // Always reset price range to match the new filter context
        const newMin = d?.minPrice ?? 0;
        const newMax = d?.maxPrice ?? 2000;
        setPriceRange([newMin, newMax]);
      }
    } catch {}
  };

  // Re-fetch filters when type, country, or region changes (cascading)
  useEffect(() => {
    fetchFilters();
  }, [selectedType, selectedCountry, selectedRegion]);

  const fetchWines = async (type?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type || selectedType) params.set('type', type || selectedType);
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedRegion) params.set('region', selectedRegion);
    if (selectedGrape) params.set('grape', selectedGrape);
    // Always send price params if they differ from defaults
    const minDefault = filters?.minPrice ?? 0;
    const maxDefault = filters?.maxPrice ?? 2000;
    if (priceRange[0] !== minDefault) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] !== maxDefault) params.set('maxPrice', String(priceRange[1]));
    if (searchQuery) params.set('search', searchQuery);
    try {
      const r = await fetch(`/api/wines?${params.toString()}`);
      const data = await r?.json();
      setWines(data ?? []);
    } catch { setWines([]); }
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'list') fetchWines();
  }, [view, selectedCountry, selectedRegion, selectedGrape, priceRange, searchQuery]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setSelectedCountry('');
    setSelectedRegion('');
    setSelectedGrape('');
    setView('list');
    setTimeout(() => fetchWines(type), 50);
  };

  const handleViewAll = () => {
    resetFilters();
    setView('list');
    setTimeout(() => fetchWines(''), 50);
  };

  const handleWineClick = (wine: WineItem) => {
    setSelectedWine(wine);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'detail') { setView('list'); setSelectedWine(null); }
    else if (view === 'list') { setView('home'); resetFilters(); }
    else if (view === 'maridaje') { setView('home'); setSelectedDish(null); setRecommendedWines([]); }
  };

  const handleMaridajeClick = () => {
    router.push('/maridajes');
  };

  const handleSelectDish = async (dish: any) => {
    setSelectedDish(dish);
    try {
      const res = await fetch(`/api/pairings?dishId=${dish.id}`);
      const pairings = await res?.json() ?? [];
      const wines = pairings.map((p: any) => p.wine);
      setRecommendedWines(wines);
    } catch (e) {
      console.error('Error loading wine recommendations:', e);
      setRecommendedWines([]);
    }
  };

  const resetFilters = () => {
    setSelectedType('');
    setSelectedCountry('');
    setSelectedRegion('');
    setSelectedGrape('');
    setSearchQuery('');
    setPriceRange([filters?.minPrice ?? 0, filters?.maxPrice ?? 2000]);
  };

  const activeFilterCount = [selectedType, selectedCountry, selectedRegion, selectedGrape].filter(Boolean).length +
    (priceRange[0] > (filters?.minPrice ?? 0) || priceRange[1] < (filters?.maxPrice ?? 2000) ? 1 : 0);

  const wineTypes = [
    { name: 'Tinto', desc: 'Vinos tintos con carácter', color: '#722F37' },
    { name: 'Blanco', desc: 'Frescos y aromáticos', color: '#F5E6CC' },
    { name: 'Rosado', desc: 'Delicados y florales', color: '#E8A0B4' },
    { name: 'Espumoso', desc: 'Para celebrar', color: '#F0E68C' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Button - Fixed in top right */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed top-4 right-4 z-40"
      >
        <Link
          href="/admin"
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 group"
          title="Panel de Administración"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </Link>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {/* Hero */}
            <div className="relative min-h-screen flex items-center justify-center">
              <div className="absolute inset-0 overflow-hidden">
                <Image src={settings?.backgroundImageUrl ?? HERO_BG} alt="Bodega de vinos premium" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
              </div>
              <div className="relative z-10 text-center px-4 py-16 max-w-4xl mx-auto">
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  {settings?.logoUrl ? (
                    <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                      <Image src={settings.logoUrl} alt="Logo" fill className="object-contain p-4" sizes="256px" priority />
                    </div>
                  ) : (
                    <Wine className="w-24 h-24 mx-auto mb-8" style={{ color: settings?.primaryColor ?? '#8B6914' }} />
                  )}
                  <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
                    <span style={{ color: settings?.primaryColor ?? '#8B6914' }}>{settings?.restaurantName ?? 'La Vinoteca'}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12">
                    Descubre nuestra selección curada de vinos de todo el mundo
                  </p>
                </motion.div>

                {specials.length > 0 && (
                  <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="mb-12 max-w-lg mx-auto w-full">
                    <div className="grid grid-cols-1 gap-4">
                      {specials.slice(0, 1).map((special: any, idx: number) => (
                        <motion.button
                          key={special.id}
                          onClick={() => { setSelectedWine(special.wine); setView('detail'); }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.48 + idx * 0.1 }}
                          className="relative overflow-hidden rounded-xl border border-primary/50 bg-gradient-to-br from-primary/20 to-primary/5 p-6 text-left hover:border-primary transition-all group"
                          style={{ boxShadow: 'var(--shadow-lg)' }}
                        >
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                            <Star className="w-3 h-3 text-primary" /> <span className="text-xs font-semibold text-primary">ESPECIAL</span>
                          </div>
                          <h3 className="font-display text-lg font-bold mt-6 mb-1">{special.title}</h3>
                          <p className="text-sm font-semibold text-foreground/80 mb-2">{special.wine.name}</p>
                          {special.description && <p className="text-xs text-muted-foreground mb-3">{special.description}</p>}
                          <div className="flex items-baseline justify-between">
                            <span className="font-display text-lg font-bold">${special.wine.price.toLocaleString('es-MX')}</span>
                            {special.discount && <span className="text-xs font-semibold text-green-400">-{special.discount}%</span>}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Wine Type Cards */}
                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {wineTypes.map((wt: any, i: number) => (
                    <motion.button
                      key={wt?.name}
                      onClick={() => handleTypeSelect(wt?.name)}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="wine-gradient rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 group"
                      style={{ boxShadow: 'var(--shadow-md)' }}
                    >
                      <div className="flex justify-center mb-3">
                        <WineTypeIcon type={wt?.name} color={wt?.color} size={52} />
                      </div>
                      <span className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{wt?.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">{wt?.desc}</p>
                    </motion.button>
                  ))}
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={handleViewAll}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                  >
                    Ver toda la carta <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={handleMaridajeClick}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary/80 text-primary-foreground rounded-full font-semibold hover:bg-primary transition-colors"
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                  >
                    <Utensils className="w-5 h-5" /> Maridaje <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                <button onClick={handleBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold gold-text">{settings?.restaurantName ?? 'La Vinoteca'}</h2>
                </div>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar vinos..."
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e?.target?.value ?? '')}
                    className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="relative p-2 rounded-lg hover:bg-secondary transition-colors md:hidden">
                  <SlidersHorizontal className="w-5 h-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
              {/* Sidebar Filters - Desktop */}
              <div className="hidden md:block w-64 flex-shrink-0">
                <FilterPanel
                  filters={filters}
                  selectedType={selectedType}
                  selectedCountry={selectedCountry}
                  selectedRegion={selectedRegion}
                  selectedGrape={selectedGrape}
                  priceRange={priceRange}
                  onTypeChange={(v: string) => { setSelectedType(v); setSelectedCountry(''); setSelectedRegion(''); setSelectedGrape(''); }}
                  onCountryChange={(v: string) => { setSelectedCountry(v); setSelectedRegion(''); setSelectedGrape(''); }}
                  onRegionChange={(v: string) => { setSelectedRegion(v); setSelectedGrape(''); }}
                  onGrapeChange={setSelectedGrape}
                  onPriceChange={setPriceRange}
                  onReset={resetFilters}
                />
              </div>

              {/* Mobile Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 md:hidden"
                    onClick={() => setShowFilters(false)}
                  >
                    <motion.div
                      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25 }}
                      className="absolute right-0 top-0 h-full w-80 bg-background border-l border-border p-6 overflow-y-auto"
                      onClick={(e: any) => e?.stopPropagation?.()}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-lg font-bold">Filtros</h3>
                        <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-secondary"><X className="w-5 h-5" /></button>
                      </div>
                      <FilterPanel
                        filters={filters}
                        selectedType={selectedType}
                        selectedCountry={selectedCountry}
                        selectedRegion={selectedRegion}
                        selectedGrape={selectedGrape}
                        priceRange={priceRange}
                        onTypeChange={(v: string) => { setSelectedType(v); setSelectedCountry(''); setSelectedRegion(''); setSelectedGrape(''); }}
                        onCountryChange={(v: string) => { setSelectedCountry(v); setSelectedRegion(''); setSelectedGrape(''); }}
                        onRegionChange={(v: string) => { setSelectedRegion(v); setSelectedGrape(''); }}
                        onGrapeChange={setSelectedGrape}
                        onPriceChange={setPriceRange}
                        onReset={resetFilters}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wine Grid */}
              <div className="flex-1">
                {/* Active filters display */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedType && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {selectedType} <button onClick={() => setSelectedType('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedCountry && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {selectedCountry} <button onClick={() => setSelectedCountry('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedRegion && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {selectedRegion} <button onClick={() => setSelectedRegion('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedGrape && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {selectedGrape} <button onClick={() => setSelectedGrape('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground text-sm">{wines?.length ?? 0} vinos encontrados</p>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_: any, i: number) => (
                      <div key={i} className="bg-card rounded-xl h-80 animate-pulse" />
                    ))}
                  </div>
                ) : (wines?.length ?? 0) === 0 ? (
                  <div className="text-center py-20">
                    <Wine className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No se encontraron vinos con los filtros seleccionados</p>
                    <button onClick={resetFilters} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Limpiar filtros</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(wines ?? []).map((wine: WineItem, i: number) => (
                      <motion.div key={wine?.id ?? i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }}>
                        <WineCard wine={wine} onClick={() => handleWineClick(wine)} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'maridaje' && (
          <motion.div key="maridaje" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                <button onClick={handleBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold gold-text">{settings?.restaurantName ?? 'La Vinoteca'}</h2>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
              {!selectedDish ? (
                <div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="font-display text-4xl font-bold mb-2">Selecciona un Platillo</h1>
                    <p className="text-muted-foreground">Elige un platillo para ver nuestras recomendaciones de vino</p>
                  </motion.div>

                  {loadingDishes ? (
                    <div className="text-center py-12 text-muted-foreground">Cargando platillos...</div>
                  ) : dishes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No hay platillos disponibles</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dishes.map((dish: any) => (
                        <motion.button
                          key={dish.id}
                          onClick={() => handleSelectDish(dish)}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className="text-left bg-card rounded-xl border border-border/30 p-6 hover:border-primary/50 transition-all"
                          style={{ boxShadow: 'var(--shadow-md)' }}
                        >
                          {dish.imageUrl && (
                            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                              <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" sizes="300px" />
                            </div>
                          )}
                          <h3 className="font-display text-lg font-bold mb-2">{dish.name}</h3>
                          {dish.description && <p className="text-sm text-muted-foreground">{dish.description}</p>}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <motion.button
                    onClick={() => setSelectedDish(null)}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver a platillos
                  </motion.button>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="font-display text-3xl font-bold mb-4">{selectedDish.name}</h1>
                    {selectedDish.description && <p className="text-muted-foreground mb-8">{selectedDish.description}</p>}

                    <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                      <Wine className="w-6 h-6 text-primary" /> Vinos Recomendados
                    </h2>

                    {recommendedWines.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-xl">
                        No hay recomendaciones de vino para este platillo aún
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedWines.map((wine: WineItem) => (
                          <WineCard key={wine.id} wine={wine} onClick={() => { setSelectedWine(wine); setView('detail'); }} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'detail' && selectedWine && (
          <motion.div key="detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
            <WineDetail wine={selectedWine} onBack={handleBack} restaurantName={settings?.restaurantName ?? 'La Vinoteca'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}