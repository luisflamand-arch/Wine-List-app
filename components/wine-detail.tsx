'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Wine, MapPin, Grape, Calendar, Tag, Star, Globe, CheckCircle, X, Utensils } from 'lucide-react';
import { WINE_TYPE_IMAGES, WINE_TYPE_COLORS } from '@/lib/constants';
import { WineBlockingModal } from '@/components/wine-blocking-modal';

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
  imageUrl: string | null;
  description: string | null;
  tastingNotes: string | null;
};

export function WineDetail({ wine, onBack, restaurantName }: { wine: WineItem; onBack: () => void; restaurantName: string }) {
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [tableName, setTableName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pairings, setPairings] = useState<any[]>([]);
  const [loadingPairings, setLoadingPairings] = useState(true);
  const [blockingModalOpen, setBlockingModalOpen] = useState(false);
  const [blockingOrderId, setBlockingOrderId] = useState<string>('');

  useEffect(() => {
    const fetchPairings = async () => {
      try {
        const res = await fetch(`/api/pairings?wineId=${wine?.id}`);
        if (res.ok) {
          setPairings(await res.json());
        }
      } catch (e) {
        // Silently fail
      } finally {
        setLoadingPairings(false);
      }
    };
    fetchPairings();
  }, [wine?.id]);

  const handleSelect = async () => {
    if (!tableName.trim()) return;
    setSending(true);
    try {
      const r = await fetch('/api/wine-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wineId: wine?.id, tableName: tableName.trim(), quantity, notes: notes.trim() || null }),
      });
      if (r?.ok) {
        const data = await r.json();
        setBlockingOrderId(data.id);
        setShowSelectModal(false);
        setBlockingModalOpen(true);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setSending(false);
  };

  const handleBlockingApproved = () => {
    setBlockingModalOpen(false);
    setBlockingOrderId('');
    setTableName('');
    setQuantity(1);
    setNotes('');
  };

  const handleBlockingRejected = () => {
    setBlockingModalOpen(false);
    setBlockingOrderId('');
  };
  const imgSrc = wine?.imageUrl || WINE_TYPE_IMAGES[wine?.type ?? 'Tinto'] || WINE_TYPE_IMAGES.Tinto;
  const typeColor = WINE_TYPE_COLORS[wine?.type ?? 'Tinto'] ?? '#722F37';

  const details = [
    { icon: Globe, label: 'País', value: wine?.country },
    { icon: MapPin, label: 'Región', value: wine?.region },
    { icon: Grape, label: 'Cepa', value: wine?.grape },
    { icon: Tag, label: 'Clasificación', value: wine?.classification },
    { icon: Calendar, label: 'Añada', value: wine?.vintage },
  ].filter((d: any) => d?.value);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-lg font-bold gold-text">{restaurantName}</h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex justify-center">
            <div className="relative w-full max-w-sm aspect-[2/3] bg-gradient-to-b from-secondary to-card rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <Image src={imgSrc} alt={wine?.name ?? 'Vino'} fill className="object-contain p-8" sizes="400px" />
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: typeColor }}>
                  {wine?.type ?? ''}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
            {wine?.classification && (
              <span className="inline-block w-fit px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary mb-3">{wine.classification}</span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">{wine?.name ?? ''}</h1>
            <div className="font-display text-4xl font-bold text-primary mb-6">${wine?.price?.toLocaleString?.('es-MX') ?? '0'} <span className="text-base font-normal text-muted-foreground">MXN</span></div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(details ?? []).map((d: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3"
                >
                  {d?.icon && <d.icon className="w-4 h-4 text-primary flex-shrink-0" />}
                  <div>
                    <p className="text-xs text-muted-foreground">{d?.label ?? ''}</p>
                    <p className="text-sm font-medium">{d?.value ?? ''}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            {wine?.description && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
                <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                  <Wine className="w-4 h-4 text-primary" /> Descripción
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{wine.description}</p>
              </motion.div>
            )}

            {/* Tasting Notes */}
            {wine?.tastingNotes && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-card rounded-xl p-5 border border-border/30 mb-6" style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> Notas de Cata
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{wine.tastingNotes}</p>
              </motion.div>
            )}

            
            {/* Pairings Section */}
            {!loadingPairings && pairings.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="bg-card rounded-xl p-5 border border-border/30 mb-6" style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" /> Maridaje Recomendado
                </h3>
                <div className="space-y-2">
                  {pairings.map((pairing: any, idx: number) => (
                    <motion.div key={pairing.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.56 + idx * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-primary font-bold text-lg flex-shrink-0">✓</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pairing.dish.name}</p>
                        {pairing.dish.description && <p className="text-xs text-muted-foreground mt-0.5">{pairing.dish.description}</p>}
                        {pairing.notes && <p className="text-xs text-primary/70 mt-1 italic">{pairing.notes}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Select Wine Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              onClick={() => setShowSelectModal(true)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-display text-lg font-bold hover:bg-primary/90 transition-colors"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              🍷 Seleccionar este vino
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Selection Modal */}
      <AnimatePresence>
        {showSelectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => !sending && setShowSelectModal(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border/30 w-full max-w-sm p-6"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              onClick={(e: any) => e?.stopPropagation?.()}
            >
              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                  <h3 className="font-display text-xl font-bold mb-2">¡Solicitud Enviada!</h3>
                  <p className="text-sm text-muted-foreground">Un operador confirmará tu selección en breve.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold">Solicitar Vino</h3>
                    <button onClick={() => setShowSelectModal(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{wine?.name}</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mesa / Nombre *</label>
                      <input value={tableName} onChange={(e: any) => setTableName(e?.target?.value ?? '')}
                        placeholder="Ej: Mesa 5, Terraza 2..."
                        className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cantidad</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold">−</button>
                        <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Notas (opcional)</label>
                      <input value={notes} onChange={(e: any) => setNotes(e?.target?.value ?? '')}
                        placeholder="Alguna indicación especial..."
                        className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                    </div>
                    <button onClick={handleSelect} disabled={!tableName.trim() || sending}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {sending ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                    <p className="text-xs text-center text-muted-foreground">El operador deberá confirmar su solicitud</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocking Modal */}
      <WineBlockingModal
        isOpen={blockingModalOpen}
        orderId={blockingOrderId}
        tableName={tableName}
        wineName={wine?.name || ''}
        quantity={quantity}
        onApproved={handleBlockingApproved}
        onRejected={handleBlockingRejected}
      />
    </div>
  );
}
