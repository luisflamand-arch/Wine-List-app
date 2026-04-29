'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, ArrowLeft, ChevronRight, Utensils } from 'lucide-react';

interface WineInfo {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  grape: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  tastingNotes?: string;
  classification?: string;
  vintage?: string;
}

interface Pairing {
  id: string;
  dishName: string;
  dishDescription?: string;
  dishImageUrl?: string;
  wines: WineInfo[];
}

export function PairingsClient() {
  const router = useRouter();
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPairing, setSelectedPairing] = useState<Pairing | null>(null);
  const [selectedWine, setSelectedWine] = useState<WineInfo | null>(null);

  useEffect(() => {
    fetchPairings();
  }, []);

  const fetchPairings = async () => {
    try {
      const res = await fetch('/api/pairings');
      const data = await res.json();
      setPairings(data);
    } catch (err) {
      console.error('Error fetching pairings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Utensils className="w-12 h-12 mx-auto text-primary mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando maridajes...</p>
        </div>
      </div>
    );
  }

  // Wine detail view
  if (selectedWine) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
            <button onClick={() => setSelectedWine(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg font-bold truncate">{selectedWine.name}</h2>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border/30 overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
            {/* Wine image */}
            <div className="relative w-full aspect-[3/2] bg-black/20">
              {selectedWine.imageUrl ? (
                <Image src={selectedWine.imageUrl} alt={selectedWine.name} fill className="object-contain p-8" sizes="800px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wine className="w-24 h-24 text-primary/30" />
                </div>
              )}
            </div>
            {/* Wine info */}
            <div className="p-6 space-y-4">
              <h1 className="font-display text-3xl font-bold gold-text">{selectedWine.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">{selectedWine.type}</span>
                {selectedWine.vintage && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground/80">{selectedWine.vintage}</span>}
                {selectedWine.classification && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground/80">{selectedWine.classification}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Uva:</span> <span className="font-medium">{selectedWine.grape}</span></div>
                <div><span className="text-muted-foreground">País:</span> <span className="font-medium">{selectedWine.country}</span></div>
                <div><span className="text-muted-foreground">Región:</span> <span className="font-medium">{selectedWine.region}</span></div>
                <div><span className="text-muted-foreground">Stock:</span> <span className="font-medium">{selectedWine.stock} botellas</span></div>
              </div>
              {selectedWine.description && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Descripción</h3>
                  <p className="text-sm leading-relaxed">{selectedWine.description}</p>
                </div>
              )}
              {selectedWine.tastingNotes && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Notas de cata</h3>
                  <p className="text-sm leading-relaxed italic">{selectedWine.tastingNotes}</p>
                </div>
              )}
              <div className="pt-4 border-t border-border/30">
                <span className="font-display text-3xl font-bold gold-text">${selectedWine.price.toLocaleString('es-MX')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dish detail view (selected pairing)
  if (selectedPairing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
            <button onClick={() => setSelectedPairing(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg font-bold truncate">{selectedPairing.dishName}</h2>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Dish hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden mb-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
              {selectedPairing.dishImageUrl ? (
                <Image src={selectedPairing.dishImageUrl} alt={selectedPairing.dishName} fill className="object-cover" sizes="500px" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <Utensils className="w-20 h-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold text-center mb-2">{selectedPairing.dishName}</h1>
            {selectedPairing.dishDescription && (
              <p className="text-center text-muted-foreground mb-8">{selectedPairing.dishDescription}</p>
            )}
          </motion.div>

          {/* Wine recommendations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <Wine className="w-5 h-5 text-primary" /> Vinos Recomendados
            </h2>
            {selectedPairing.wines.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-xl">
                <p className="text-muted-foreground">No hay vinos disponibles en este momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPairing.wines.map((wine, idx) => (
                  <motion.button
                    key={wine.id}
                    onClick={() => setSelectedWine(wine)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-full bg-card rounded-xl border border-border/30 p-4 hover:border-primary/50 transition-all text-left flex items-center gap-4 group"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    {/* Wine mini image */}
                    <div className="flex-shrink-0 relative w-14 h-20 bg-black/10 rounded-lg overflow-hidden">
                      {wine.imageUrl ? (
                        <Image src={wine.imageUrl} alt={wine.name} fill className="object-cover" sizes="60px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wine className="w-6 h-6 text-primary/30" />
                        </div>
                      )}
                    </div>
                    {/* Wine info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-base truncate group-hover:text-primary transition-colors">{wine.name}</h3>
                      <p className="text-xs text-muted-foreground">{wine.type} · {wine.grape}</p>
                    </div>
                    {/* Price + arrow */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                      <span className="font-display text-lg font-bold gold-text">${wine.price.toLocaleString('es-MX')}</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Main grid view - dish cards
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-xl font-bold gold-text">Maridajes</h2>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {pairings.length === 0 ? (
          <div className="text-center py-16">
            <Utensils className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg">No hay maridajes disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pairings.map((pairing, idx) => (
              <motion.button
                key={pairing.id}
                onClick={() => setSelectedPairing(pairing)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="text-left bg-card rounded-2xl border border-border/30 overflow-hidden hover:border-primary/50 transition-all group"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                {/* Dish image - square */}
                <div className="relative w-full aspect-square bg-secondary">
                  {pairing.dishImageUrl ? (
                    <Image src={pairing.dishImageUrl} alt={pairing.dishName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="w-16 h-16 text-muted-foreground/20" />
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                  {/* Dish name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-xl font-bold text-white drop-shadow-lg">{pairing.dishName}</h3>
                  </div>
                </div>

                {/* Wine recommendations */}
                <div className="p-4 space-y-2">
                  {pairing.wines.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">Sin vinos disponibles</p>
                  ) : (
                    pairing.wines.map((wine) => (
                      <div key={wine.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Wine className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="text-sm truncate">{wine.name}</span>
                        </div>
                        <span className="text-sm font-semibold gold-text flex-shrink-0">${wine.price.toLocaleString('es-MX')}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
