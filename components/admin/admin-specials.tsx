'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Special {
  id: string;
  wineId: string;
  wine: { id: string; name: string; type: string; price: number };
  title: string;
  description?: string;
  discount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface Wine {
  id: string;
  name: string;
  type: string;
  price: number;
}

export function AdminSpecials() {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSpecial, setEditSpecial] = useState<Partial<Special> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecials();
    fetchWines();
  }, []);

  const fetchSpecials = async () => {
    try {
      const res = await fetch('/api/specials'); // Get all specials (no filtering)
      if (res.ok) setSpecials(await res.json());
    } catch (e) {
      toast.error('Error loading specials');
    } finally {
      setLoading(false);
    }
  };

  const fetchWines = async () => {
    try {
      const res = await fetch('/api/wines?showAll=true');
      if (res.ok) setWines(await res.json());
    } catch (e) {
      toast.error('Error loading wines');
    }
  };

  const handleSaveSpecial = async () => {
    if (!editSpecial?.wineId || !editSpecial?.title || !editSpecial?.startDate || !editSpecial?.endDate) {
      toast.error('Complete all fields');
      return;
    }
    setSaving(true);
    try {
      const isNew = !editSpecial?.id;
      const url = isNew ? '/api/specials' : `/api/specials/${editSpecial?.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSpecial)
      });
      if (res.ok) {
        toast.success(isNew ? 'Special created' : 'Special updated');
        fetchSpecials();
        setShowModal(false);
        setEditSpecial(null);
      } else toast.error('Error saving');
    } catch (e) {
      toast.error('Error saving special');
    }
    setSaving(false);
  };

  const handleDeleteSpecial = async (id: string) => {
    if (!confirm('Delete this special?')) return;
    try {
      const res = await fetch(`/api/specials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Special deleted');
        fetchSpecials();
      } else toast.error('Error deleting');
    } catch (e) {
      toast.error('Error deleting');
    }
  };

  const isActive = (special: Special) => {
    const now = new Date();
    const start = new Date(special.startDate);
    const end = new Date(special.endDate);
    return now >= start && now <= end && special.active;
  };

  const activeSpecials = specials.filter(isActive);
  const inactiveSpecials = specials.filter(s => !isActive(s));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" /> Especiales de la Semana/Mes
        </h3>
        <button onClick={() => {
          const now = new Date();
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          setEditSpecial({
            startDate: now.toISOString().split('T')[0],
            endDate: nextWeek.toISOString().split('T')[0],
            title: 'Especial de la Semana',
            active: true
          });
          setShowModal(true);
        }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nuevo Especial
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando especiales...</div>
      ) : activeSpecials.length === 0 && inactiveSpecials.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No specials yet</div>
      ) : (
        <div className="space-y-6">
          {activeSpecials.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Activos Ahora ({activeSpecials.length})
              </h4>
              <div className="space-y-2">
                {activeSpecials.map((special: Special) => (
                  <motion.div key={special.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{special.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{special.wine.name} ({special.wine.type})</p>
                      {special.description && <p className="text-xs mt-1 text-muted-foreground">{special.description}</p>}
                      {special.discount && <p className="text-xs mt-1 font-semibold text-green-600">-{special.discount}% descuento</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditSpecial(special); setShowModal(true); }}
                        className="px-3 py-2 bg-secondary rounded-lg text-xs hover:bg-secondary/80">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteSpecial(special.id)}
                        className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs hover:bg-red-500/20">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {inactiveSpecials.length > 0 && (
            <div>
              <h4 className="font-semibold text-muted-foreground mb-3">Otros Especiales ({inactiveSpecials.length})</h4>
              <div className="space-y-2 opacity-75">
                {inactiveSpecials.map((special: Special) => (
                  <motion.div key={special.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-card border border-border/30 rounded-xl p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{special.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{special.wine.name} ({special.wine.type})</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(special.startDate).toLocaleDateString('es-MX')} - {new Date(special.endDate).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditSpecial(special); setShowModal(true); }}
                        className="px-3 py-2 bg-secondary rounded-lg text-xs hover:bg-secondary/80">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteSpecial(special.id)}
                        className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs hover:bg-red-500/20">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && editSpecial && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-xl p-6 border border-border/30 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editSpecial?.id ? 'Editar Especial' : 'Nuevo Especial'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Vino *</label>
                  <select value={editSpecial?.wineId ?? ''} onChange={(e: any) => setEditSpecial((p: any) => ({ ...(p ?? {}), wineId: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none">
                    <option value="">-- Seleccionar vino --</option>
                    {wines.map((w: Wine) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.type}) - ${w.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Título *</label>
                  <input value={editSpecial?.title ?? ''} onChange={(e: any) => setEditSpecial((p: any) => ({ ...(p ?? {}), title: e?.target?.value ?? '' }))}
                    placeholder="Ej: Especial de la Semana"
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Descripción</label>
                  <textarea rows={2} value={editSpecial?.description ?? ''} onChange={(e: any) => setEditSpecial((p: any) => ({ ...(p ?? {}), description: e?.target?.value ?? '' }))}
                    placeholder="Ej: Un excelente vino rojo..."
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Descuento (%) - Opcional</label>
                  <input type="number" min={0} max={100} value={editSpecial?.discount ?? ''} onChange={(e: any) => setEditSpecial((p: any) => ({ ...(p ?? {}), discount: e?.target?.value ? parseFloat(e?.target?.value) : null }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Fecha Inicio *</label>
                    <input type="date" value={editSpecial?.startDate ? editSpecial.startDate.split('T')[0] : ''} onChange={(e: any) => setEditSpecial((p: any) => ({ ...(p ?? {}), startDate: e?.target?.value ?? '' }))}
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Fecha Fin *</label>
                    <input type="date" value={editSpecial?.endDate ? editSpecial.endDate.split('T')[0] : ''} onChange={(e: any) => setEditSpecial((p: any) => ({ ...(p ?? {}), endDate: e?.target?.value ?? '' }))}
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/30">
                <button onClick={() => { setShowModal(false); setEditSpecial(null); }}
                  className="px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80">Cancelar</button>
                <button onClick={handleSaveSpecial} disabled={saving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
