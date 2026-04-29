'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Wine, Upload, X, Camera, Save, Utensils, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface WineOption {
  id: string;
  name: string;
  type: string;
  price: number;
  stock: number;
}

interface PairingItem {
  id: string;
  dishName: string;
  dishDescription: string | null;
  dishImageUrl: string | null;
  premiumWineId: string;
  mediumWineId: string;
  economicWineId: string;
  premiumWine: WineOption;
  mediumWine: WineOption;
  economicWine: WineOption;
}

export function AdminPairings() {
  const [pairings, setPairings] = useState<PairingItem[]>([]);
  const [wines, setWines] = useState<WineOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ dishName: '', dishDescription: '', dishImageUrl: '', premiumWineId: '', mediumWineId: '', economicWineId: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, wRes] = await Promise.all([
        fetch('/api/pairings?admin=true'),
        fetch('/api/wines?showAll=true'),
      ]);
      const pData = await pRes.json();
      const wData = await wRes.json();
      setPairings(Array.isArray(pData) ? pData : []);
      setWines(Array.isArray(wData) ? wData : []);
    } catch (err) {
      console.error('Error loading pairings:', err);
      toast.error('Error al cargar maridajes');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: `dish-${Date.now()}-${file.name}`, contentType: file.type, isPublic: true }),
      });
      const { url, cloud_storage_path, bucket, region } = await presignedRes.json();
      
      // Upload to S3
      const headers: Record<string, string> = { 'Content-Type': file.type };
      // Check if content-disposition is in signed headers
      if (url.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }
      await fetch(url, { method: 'PUT', headers, body: file });

      const publicUrl = `https://placehold.co/1200x600/e2e8f0/1e293b?text=photo_of_a_dish_or_meal__representing_a_food_image`;
      setForm(prev => ({ ...prev, dishImageUrl: publicUrl }));
      toast.success('Imagen subida correctamente');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.dishName || !form.premiumWineId || !form.mediumWineId || !form.economicWineId) {
      toast.error('Completa los campos requeridos: nombre y 3 vinos');
      return;
    }

    try {
      const body = {
        dishName: form.dishName,
        dishDescription: form.dishDescription || null,
        dishImageUrl: form.dishImageUrl || null,
        premiumWineId: form.premiumWineId,
        mediumWineId: form.mediumWineId,
        economicWineId: form.economicWineId,
      };

      const url = editingId ? `/api/pairings/${editingId}` : '/api/pairings';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }

      toast.success(editingId ? 'Maridaje actualizado' : 'Maridaje creado');
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar maridaje');
    }
  };

  const handleEdit = (p: PairingItem) => {
    setEditingId(p.id);
    setForm({
      dishName: p.dishName,
      dishDescription: p.dishDescription || '',
      dishImageUrl: p.dishImageUrl || '',
      premiumWineId: p.premiumWineId,
      mediumWineId: p.mediumWineId,
      economicWineId: p.economicWineId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este maridaje?')) return;
    try {
      await fetch(`/api/pairings/${id}`, { method: 'DELETE' });
      toast.success('Maridaje eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ dishName: '', dishDescription: '', dishImageUrl: '', premiumWineId: '', mediumWineId: '', economicWineId: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Utensils className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Maridajes</h2>
          <p className="text-sm text-muted-foreground">Gestiona las recomendaciones de vino para cada platillo</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Maridaje
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl border border-border/30 w-full max-w-lg max-h-[90vh] flex flex-col"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              {/* Modal header */}
              <div className="p-6 border-b border-border/30 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{editingId ? 'Editar Maridaje' : 'Nuevo Maridaje'}</h3>
                <button onClick={resetForm} className="p-1 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Dish name */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Nombre del Platillo *</label>
                  <input
                    value={form.dishName}
                    onChange={(e) => setForm(prev => ({ ...prev, dishName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
                    placeholder="Ej: Provoleta"
                  />
                </div>

                {/* Dish description */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Descripción (opcional)</label>
                  <input
                    value={form.dishDescription}
                    onChange={(e) => setForm(prev => ({ ...prev, dishDescription: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
                    placeholder="Breve descripción del platillo"
                  />
                </div>

                {/* Dish image */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Foto del Platillo</label>
                  {form.dishImageUrl ? (
                    <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden bg-secondary mb-2">
                      <Image src={form.dishImageUrl} alt="Platillo" fill className="object-cover" sizes="200px" />
                      <button
                        onClick={() => setForm(prev => ({ ...prev, dishImageUrl: '' }))}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors border border-dashed border-border"
                      >
                        <ImageIcon className="w-4 h-4" /> {uploading ? 'Subiendo...' : 'Seleccionar'}
                      </button>
                      <button
                        onClick={() => cameraRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors border border-dashed border-border"
                      >
                        <Camera className="w-4 h-4" /> Cámara
                      </button>
                    </div>
                  )}
                </div>

                {/* Wine selectors */}
                {(['premiumWineId', 'mediumWineId', 'economicWineId'] as const).map((field, idx) => (
                  <div key={field}>
                    <label className="text-sm font-medium mb-1 block">Vino {idx + 1} *</label>
                    <select
                      value={form[field]}
                      onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
                    >
                      <option value="">Selecciona un vino</option>
                      {wines.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} — {w.type} — ${w.price.toLocaleString('es-MX')}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Modal footer */}
              <div className="p-6 border-t border-border/30 flex gap-3">
                <button onClick={resetForm} className="flex-1 py-2.5 bg-secondary rounded-lg text-sm font-semibold hover:bg-secondary/80 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pairings list */}
      {pairings.length === 0 ? (
        <div className="text-center py-16 bg-secondary/30 rounded-xl">
          <Utensils className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No hay maridajes creados aún</p>
          <p className="text-sm text-muted-foreground">Haz clic en "Nuevo Maridaje" para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pairings.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border/30 overflow-hidden"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Dish image */}
              <div className="relative w-full aspect-square bg-secondary">
                {p.dishImageUrl ? (
                  <Image src={p.dishImageUrl} alt={p.dishName} fill className="object-cover" sizes="300px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Utensils className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-display font-bold text-lg mb-3">{p.dishName}</h3>
                {p.dishDescription && <p className="text-xs text-muted-foreground mb-3">{p.dishDescription}</p>}
                <div className="space-y-2">
                  {[p.premiumWine, p.mediumWine, p.economicWine].map((wine, i) => (
                    <div key={wine?.id || i} className="flex items-center gap-2 text-sm">
                      <Wine className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="truncate flex-1">{wine?.name || 'Vino no encontrado'}</span>
                      <span className="text-xs font-semibold gold-text">${wine?.price?.toLocaleString('es-MX') ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
