'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Plus, Loader, Download, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { WINE_TYPE_IMAGES } from '@/lib/constants';

type Wine = {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  price: number;
  stock: number;
  imageUrl: string | null;
};

type PhysicalCount = Wine & {
  physicalCount: number;
};

type GroupedByType = {
  [key: string]: { [country: string]: PhysicalCount[] };
};

export function AdminPhysicalInventory() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<PhysicalCount[]>([]);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['Blanco', 'Rosado']));
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Wine type order: Blanco/Rosado first, then Tinto
  const typeOrder: { [key: string]: number } = {
    'Blanco': 0,
    'Rosado': 1,
    'Tinto': 2,
    'Espumoso': 3,
    'Dulce': 4,
  };

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wines?showAll=true');
      if (res.ok) {
        const data = await res.json();
        setWines(data.sort((a: Wine, b: Wine) => {
          // Sort by type first, then by country
          const typeA = typeOrder[a.type] ?? 99;
          const typeB = typeOrder[b.type] ?? 99;
          if (typeA !== typeB) return typeA - typeB;
          return (a.country || '').localeCompare(b.country || '');
        }));
        // Initialize counts with 0 for all wines
        setCounts(data.map((w: Wine) => ({ ...w, physicalCount: 0 })));
      }
    } catch (error) {
      console.error('Error fetching wines:', error);
      toast.error('Error al cargar vinos');
    } finally {
      setLoading(false);
    }
  };

  const groupByTypeAndCountry = (): GroupedByType => {
    const grouped: GroupedByType = {};
    counts.forEach((count) => {
      if (!grouped[count.type]) grouped[count.type] = {};
      if (!grouped[count.type][count.country]) grouped[count.type][count.country] = [];
      grouped[count.type][count.country].push(count);
    });
    return grouped;
  };

  const handleCountChange = (wineId: string, value: number) => {
    setCounts((prev) =>
      prev.map((c) => (c.id === wineId ? { ...c, physicalCount: value } : c))
    );
  };

  const toggleType = (type: string) => {
    const newSet = new Set(expandedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setExpandedTypes(newSet);
  };

  const toggleCountry = (country: string) => {
    const newSet = new Set(expandedCountries);
    if (newSet.has(country)) {
      newSet.delete(country);
    } else {
      newSet.add(country);
    }
    setExpandedCountries(newSet);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let successCount = 0;
      for (const count of counts) {
        if (count.physicalCount > 0 || count.stock !== 0) {
          const res = await fetch('/api/physical-inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wineId: count.id,
              physicalCount: count.physicalCount,
              notes: `Physical count taken`,
            }),
          });
          if (res.ok) successCount++;
        }
      }
      toast.success(`${successCount} registros de conteo creados`);
      setCounts(counts.map((c) => ({ ...c, physicalCount: 0 })));
      setShowSummary(false);
    } catch (error) {
      console.error('Error submitting counts:', error);
      toast.error('Error al guardar conteos');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('Limpiar todos los conteos?')) {
      setCounts(counts.map((c) => ({ ...c, physicalCount: 0 })));
      toast.success('Conteos limpiados');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Pais', 'Vino', 'Stock Sistema', 'Conteo Fisico', 'Diferencia'];
    const rows = counts.map((c) => [
      c.type,
      c.country,
      c.name,
      c.stock,
      c.physicalCount,
      c.physicalCount - c.stock,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_fisico_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const grouped = groupByTypeAndCountry();
  const discrepancies = counts.filter((c) => c.physicalCount !== c.stock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border/30" style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold mb-1">Inventario Fisico</h2>
            <p className="text-sm text-muted-foreground">Conteo manual de vinos por tipo y pais</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleClearAll}
              disabled={counts.every((c) => c.physicalCount === 0)}
              className="px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar todo
            </button>
            <button onClick={handleExportCSV}
              disabled={counts.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>

        {/* Summary */}
        {counts.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-muted-foreground mb-1">Total vinos</p>
              <p className="font-bold">{counts.length}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-muted-foreground mb-1">Contados</p>
              <p className="font-bold">{counts.filter((c) => c.physicalCount > 0).length}</p>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-900/40">
              <p className="text-yellow-200 mb-1">Discrepancias</p>
              <p className="font-bold text-yellow-300">{discrepancies.length}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Wine List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {Object.keys(grouped)
            .sort((a, b) => (typeOrder[a] ?? 99) - (typeOrder[b] ?? 99))
            .map((type) => (
              <motion.div key={type} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Type Header */}
                <button
                  onClick={() => toggleType(type)}
                  className="w-full flex items-center justify-between bg-card border border-border/30 rounded-lg p-4 hover:bg-secondary/20 transition-colors"
                >
                  <span className="font-display font-bold">{type}</span>
                  {expandedTypes.has(type) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Countries */}
                <AnimatePresence>
                  {expandedTypes.has(type) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 pl-4 mt-2"
                    >
                      {Object.keys(grouped[type])
                        .sort()
                        .map((country) => (
                          <motion.div key={`${type}-${country}`}>
                            {/* Country Header */}
                            <button
                              onClick={() => toggleCountry(country)}
                              className="w-full flex items-center justify-between bg-secondary/50 rounded-lg p-3 hover:bg-secondary/70 transition-colors"
                            >
                              <span className="font-medium">{country}</span>
                              <span className="text-xs text-muted-foreground mr-2">
                                ({grouped[type][country].length})
                              </span>
                              {expandedCountries.has(country) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>

                            {/* Wines */}
                            <AnimatePresence>
                              {expandedCountries.has(country) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-2 pl-4 mt-2"
                                >
                                  {grouped[type][country].map((wine) => {
                                    const difference = wine.physicalCount - wine.stock;
                                    const isDiscrepancy = difference !== 0;

                                    return (
                                      <motion.div
                                        key={wine.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                          isDiscrepancy
                                            ? 'bg-yellow-900/10 border-yellow-900/30'
                                            : 'bg-secondary/30 border-border/30'
                                        }`}
                                      >
                                        {/* Wine Image */}
                                        <div className="relative w-10 h-12 flex-shrink-0 bg-secondary rounded overflow-hidden">
                                          <Image
                                            src={wine.imageUrl || WINE_TYPE_IMAGES[wine.type] || ''}
                                            alt={wine.name}
                                            fill
                                            className="object-contain"
                                            sizes="40px"
                                          />
                                        </div>

                                        {/* Wine Info */}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium line-clamp-1">{wine.name}</p>
                                          <p className="text-xs text-muted-foreground">{wine.type} • {wine.country}</p>
                                        </div>

                                        {/* Stock */}
                                        <div className="text-right">
                                          <p className="text-xs text-muted-foreground">Sistema</p>
                                          <p className="font-bold">{wine.stock}</p>
                                        </div>

                                        {/* Input */}
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            min={0}
                                            value={wine.physicalCount}
                                            onChange={(e) =>
                                              handleCountChange(wine.id, parseInt(e.target.value) || 0)
                                            }
                                            className="w-16 px-2 py-1 bg-secondary rounded text-sm text-center border border-border/50 focus:border-primary focus:outline-none"
                                            placeholder="0"
                                          />
                                        </div>

                                        {/* Difference */}
                                        {isDiscrepancy && (
                                          <div
                                            className={`text-right px-2 py-1 rounded text-sm font-bold ${
                                              difference > 0
                                                ? 'bg-green-900/20 text-green-400'
                                                : 'bg-red-900/20 text-red-400'
                                            }`}
                                          >
                                            {difference > 0 ? '+' : ''}{difference}
                                          </div>
                                        )}
                                      </motion.div>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
        </div>
      )}

      {/* Action Buttons */}
      {counts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-4"
        >
          {discrepancies.length > 0 && (
            <div className="flex-1 bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">{discrepancies.length} discrepancias encontradas</p>
                <p className="text-xs text-yellow-300/70">Revisa los vinos marcados antes de guardar</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowSummary(true)}
            disabled={counts.every((c) => c.physicalCount === 0)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Check className="w-4 h-4" /> Guardar Conteo
          </button>
        </motion.div>
      )}

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center p-4"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-card rounded-2xl border border-border/30 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="font-display text-lg font-bold mb-4">Resumen del Conteo</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Total vinos contados:</span>
                    <span className="font-bold">{counts.filter((c) => c.physicalCount > 0).length}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Discrepancias:</span>
                    <span className="font-bold text-yellow-400">{discrepancies.length}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Stock total sistema:</span>
                    <span className="font-bold">{counts.reduce((s, c) => s + c.stock, 0)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Stock total contado:</span>
                    <span className="font-bold">{counts.reduce((s, c) => s + c.physicalCount, 0)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="flex-1 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Guardando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
