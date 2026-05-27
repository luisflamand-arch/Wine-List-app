'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, Wine, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Dish {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  pairings: Array<{ id: string; wine: any; notes?: string }>;
}

interface Wine {
  id: string;
  name: string;
  type: string;
}

export function AdminDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editDish, setEditDish] = useState<Partial<Dish> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [selectedWine, setSelectedWine] = useState('');
  const [pairingNotes, setPairingNotes] = useState('');

  useEffect(() => {
    fetchDishes();
    fetchWines();
  }, []);

  const fetchDishes = async () => {
    try {
      const res = await fetch('/api/dishes?active=true');
      if (res.ok) setDishes(await res.json());
    } catch (e) {
      toast.error('Error loading dishes');
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

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true })
      });
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();
      if (!uploadUrl) throw new Error('No upload URL');

      const headers: Record<string, string> = { 'Content-Type': file.type };
      const urlParams = new URL(uploadUrl);
      const signedHeaders = urlParams.searchParams.get('X-Amz-SignedHeaders') ?? '';
      if (signedHeaders.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }

      await fetch(uploadUrl, { method: 'PUT', headers, body: file });
      const bucketMatch = uploadUrl.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com/);
      const publicUrl = `https://images.pexels.com/photos/6419743/pexels-photo-6419743.jpeg`;
      setEditDish((p: any) => ({ ...(p ?? {}), imageUrl: publicUrl, cloudStoragePath: cloud_storage_path }));
      toast.success('Image uploaded');
    } catch (e) {
      toast.error('Error uploading image');
    }
    setUploading(false);
  };

  const handleSaveDish = async () => {
    if (!editDish?.name) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const isNew = !editDish?.id;
      const url = isNew ? '/api/dishes' : `/api/dishes/${editDish?.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editDish) });
      if (res.ok) {
        toast.success(isNew ? 'Dish created' : 'Dish updated');
        fetchDishes();
        setShowModal(false);
        setEditDish(null);
      } else toast.error('Error saving dish');
    } catch (e) {
      toast.error('Error saving dish');
    }
    setSaving(false);
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Delete this dish?')) return;
    try {
      const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Dish deleted');
        fetchDishes();
      } else toast.error('Error deleting');
    } catch (e) {
      toast.error('Error deleting');
    }
  };

  const handleAddPairing = async () => {
    if (!selectedWine || !selectedDish) { toast.error('Select wine'); return; }
    try {
      const res = await fetch('/api/pairings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wineId: selectedWine, dishId: selectedDish.id, notes: pairingNotes })
      });
      if (res.ok) {
        toast.success('Pairing added');
        fetchDishes();
        setSelectedWine('');
        setPairingNotes('');
        setShowPairingModal(false);
      } else toast.error('Error adding pairing');
    } catch (e) {
      toast.error('Error adding pairing');
    }
  };

  const handleRemovePairing = async (pairingId: string) => {
    try {
      const res = await fetch(`/api/pairings/${pairingId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Pairing removed');
        fetchDishes();
      } else toast.error('Error removing pairing');
    } catch (e) {
      toast.error('Error removing pairing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Utensils className="w-5 h-5 text-primary" /> Platillos para Maridaje
        </h3>
        <button onClick={() => { setEditDish({}); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nuevo Platillo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando platillos...</div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No dishes yet. Create one to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map((dish: Dish) => (
            <motion.div key={dish.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 border border-border/30 hover:border-primary/50 transition-colors">
              {dish.imageUrl && (
                <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-secondary">
                  <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" sizes="300px" />
                </div>
              )}
              <h4 className="font-semibold mb-1">{dish.name}</h4>
              {dish.description && <p className="text-xs text-muted-foreground mb-3">{dish.description}</p>}
              <div className="mb-4 p-3 bg-secondary rounded-lg">
                <p className="text-xs font-medium mb-2">Maridajes ({dish.pairings.length})</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {dish.pairings.length > 0 ? (
                    dish.pairings.map(p => (
                      <div key={p.id} className="flex justify-between items-start text-xs bg-background rounded p-2">
                        <span className="flex-1">{p.wine.name} ({p.wine.type})</span>
                        <button onClick={() => handleRemovePairing(p.id)} className="text-red-500 hover:text-red-700">
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No pairings yet</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedDish(dish); setShowPairingModal(true); }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-secondary rounded-lg text-xs hover:bg-secondary/80">
                  <Wine className="w-3 h-3" /> Emparejar
                </button>
                <button onClick={() => { setEditDish(dish); setShowModal(true); }}
                  className="flex items-center gap-1 px-3 py-2 bg-secondary rounded-lg text-xs hover:bg-secondary/80">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => handleDeleteDish(dish.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs hover:bg-red-500/20">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && editDish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-xl p-6 border border-border/30 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editDish?.id ? 'Editar Platillo' : 'Nuevo Platillo'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nombre *</label>
                  <input value={editDish?.name ?? ''} onChange={(e: any) => setEditDish((p: any) => ({ ...(p ?? {}), name: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Descripción</label>
                  <textarea rows={2} value={editDish?.description ?? ''} onChange={(e: any) => setEditDish((p: any) => ({ ...(p ?? {}), description: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Imagen</label>
                  <div className="flex items-center gap-4">
                    {editDish?.imageUrl && (
                      <div className="relative w-16 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={editDish.imageUrl} alt="preview" fill className="object-contain" sizes="64px" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm cursor-pointer hover:bg-secondary/80">
                      <Upload className="w-4 h-4" /> {uploading ? 'Subiendo...' : 'Subir'}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading}
                        onChange={(e: any) => { const f = e?.target?.files?.[0]; if (f) handleImageUpload(f); }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/30">
                <button onClick={() => { setShowModal(false); setEditDish(null); }}
                  className="px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80">Cancelar</button>
                <button onClick={handleSaveDish} disabled={saving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPairingModal && selectedDish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-xl p-6 border border-border/30 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Emparejar "{selectedDish.name}" con Vino</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Selecciona un Vino *</label>
                  <select value={selectedWine} onChange={(e: any) => setSelectedWine(e?.target?.value ?? '')}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none">
                    <option value="">-- Seleccionar vino --</option>
                    {wines.map((w: Wine) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notas (opcional)</label>
                  <textarea rows={2} value={pairingNotes} onChange={(e: any) => setPairingNotes(e?.target?.value ?? '')}
                    placeholder="Ej: Frutas rojas que complementan el platillo..."
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/30">
                <button onClick={() => { setShowPairingModal(false); setSelectedWine(''); setPairingNotes(''); }}
                  className="px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80">Cancelar</button>
                <button onClick={handleAddPairing}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90">
                  Emparejar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
