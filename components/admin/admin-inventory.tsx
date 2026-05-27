'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PlusCircle, Edit3, Trash2, AlertTriangle, ChevronDown, X, Upload, Wine, Plus, Minus, Zap, Download, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { WINE_TYPE_IMAGES } from '@/lib/constants';
import { ClearInventoryModal } from './clear-inventory-modal';

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
  costPrice: number;
  stock: number;
  minStock: number;
  avgConsumption: number;
  imageUrl: string | null;
  cloudStoragePath: string | null;
  isPublicImage: boolean;
  description: string | null;
  tastingNotes: string | null;
  active: boolean;
};

const emptyWine: Partial<WineItem> = {
  name: '', type: 'Tinto', country: '', region: '', grape: '', classification: '', vintage: '',
  price: 0, costPrice: 0, stock: 0, minStock: 3, avgConsumption: 6, imageUrl: '', description: '', tastingNotes: '', active: true,
};

export function AdminInventory() {
  const [wines, setWines] = useState<WineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editWine, setEditWine] = useState<Partial<WineItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterStockAlert, setFilterStockAlert] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustWine, setAdjustWine] = useState<WineItem | null>(null);
  const [adjustType, setAdjustType] = useState<'increase' | 'decrease'>('increase');
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [showClearInventory, setShowClearInventory] = useState(false);

  const fetchWines = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/wines?showAll=true');
      const data = await r?.json();
      setWines(data ?? []);
    } catch { setWines([]); }
    setLoading(false);
  };

  useEffect(() => { fetchWines(); }, []);

  const filtered = (wines ?? []).filter((w: WineItem) => {
    const matchSearch = !search || (w?.name ?? '').toLowerCase().includes(search.toLowerCase()) || (w?.grape ?? '').toLowerCase().includes(search.toLowerCase());
    const matchAlert = !filterStockAlert || ((w?.stock ?? 0) <= (w?.minStock ?? 3) && (w?.stock ?? 0) > 0);
    return matchSearch && matchAlert;
  });

  const handleCreate = () => {
    setEditWine({ ...emptyWine });
    setShowModal(true);
  };

  const handleEdit = (wine: WineItem) => {
    setEditWine({ ...wine });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este vino?')) return;
    try {
      await fetch(`/api/wines/${id}`, { method: 'DELETE' });
      toast.success('Vino eliminado');
      fetchWines();
    } catch { toast.error('Error al eliminar'); }
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Tipo', 'País', 'Región', 'Cepa', 'Clasificación', 'Añada', 'P. Costo', 'P. Venta', 'Stock', 'Min. Stock', 'Consumo Promedio', 'Valor Total', 'Activo'];
    const rows = (wines ?? []).map((w: WineItem) => [
      w.name,
      w.type,
      w.country,
      w.region,
      w.grape,
      w.classification || '-',
      w.vintage || '-',
      w.costPrice.toFixed(2),
      w.price.toFixed(2),
      w.stock,
      w.minStock,
      w.avgConsumption,
      (w.costPrice * w.stock).toFixed(2),
      w.active ? 'Sí' : 'No',
    ]);
    const csv = [headers, ...rows].map((r: any) => r.map((cell: any) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventario exportado a CSV');
  };

  const handleAdjustStock = (wine: WineItem, type: 'increase' | 'decrease') => {
    setAdjustWine(wine);
    setAdjustType(type);
    setAdjustQty(1);
    setAdjustReason('');
    setAdjustNotes('');
    setShowAdjustModal(true);
  };

  const handleSaveAdjustment = async () => {
    if (!adjustWine) return;
    if (adjustType === 'decrease' && !adjustReason.trim()) { toast.error('Razón requerida'); return; }
    if (adjustQty <= 0) { toast.error('Cantidad inválida'); return; }
    
    try {
      const r = await fetch('/api/inventory-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wineId: adjustWine.id,
          type: adjustType,
          quantity: adjustQty,
          reason: adjustReason.trim() || null,
          notes: adjustNotes.trim() || null,
        }),
      });
      if (r?.ok) {
        toast.success(`Stock ${adjustType === 'increase' ? 'aumentado' : 'reducido'}`);
        setShowAdjustModal(false);
        fetchWines();
      } else {
        const err = await r?.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error');
      }
    } catch { toast.error('Error al ajustar stock'); }
  };

  const handleSave = async () => {
    if (!editWine?.name) { toast.error('Nombre requerido'); return; }
    setSaving(true);
    try {
      const isNew = !editWine?.id;
      const url = isNew ? '/api/wines/create' : `/api/wines/${editWine?.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const body: any = { ...editWine };
      if (isNew) delete body.id;
      body.price = parseFloat(String(body?.price ?? 0));
      body.costPrice = parseFloat(String(body?.costPrice ?? 0));
      body.stock = parseInt(String(body?.stock ?? 0));
      body.minStock = parseInt(String(body?.minStock ?? 3));
      body.avgConsumption = parseInt(String(body?.avgConsumption ?? 6));
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r?.ok) {
        toast.success(isNew ? 'Vino creado' : 'Vino actualizado');
        setShowModal(false);
        setEditWine(null);
        fetchWines();
      } else {
        const err = await r?.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error al guardar');
      }
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const { uploadUrl, cloud_storage_path } = await presignedRes?.json() ?? {};
      if (!uploadUrl) throw new Error('No upload URL');

      const headers: Record<string, string> = { 'Content-Type': file.type };
      const urlParams = new URL(uploadUrl);
      const signedHeaders = urlParams.searchParams.get('X-Amz-SignedHeaders') ?? '';
      if (signedHeaders.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }

      await fetch(uploadUrl, { method: 'PUT', headers, body: file });

      // Build public URL from S3
      const bucketMatch = uploadUrl.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com/);
      const bucketName = bucketMatch?.[1] ?? '';
      const region = bucketMatch?.[2] ?? 'us-east-1';
      const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;

      setEditWine((prev: any) => ({ ...(prev ?? {}), imageUrl: publicUrl, cloudStoragePath: cloud_storage_path, isPublicImage: true }));
      toast.success('Imagen subida');
    } catch (e: any) {
      console.error(e);
      toast.error('Error al subir imagen');
    }
    setUploadingImage(false);
  };

  const lowStockCount = (wines ?? []).filter((w: WineItem) => (w?.stock ?? 0) > 0 && (w?.stock ?? 0) <= (w?.minStock ?? 3)).length;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nombre o cepa..." value={search} onChange={(e: any) => setSearch(e?.target?.value ?? '')}
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
          />
        </div>
        {lowStockCount > 0 && (
          <button onClick={() => setFilterStockAlert(!filterStockAlert)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStockAlert ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            <AlertTriangle className="w-4 h-4" /> Stock bajo ({lowStockCount})
          </button>
        )}
        <button onClick={handleExportCSV}
          disabled={wines.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="Descargar inventario en formato CSV"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
        <button onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" /> Nuevo Vino
        </button>
        <button onClick={() => setShowClearInventory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-900/30 transition-colors whitespace-nowrap border border-red-900/40"
          title="Establecer todo el inventario a cero"
        >
          <Zap className="w-4 h-4" /> Limpiar Todo
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/30 overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/50">
                <th className="text-left p-3 font-medium">Vino</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">País/Región</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Cepa</th>
                <th className="text-right p-3 font-medium">P. Venta</th>
                <th className="text-right p-3 font-medium hidden md:table-cell">P. Costo</th>
                <th className="text-right p-3 font-medium">Stock</th>
                <th className="text-center p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_: any, i: number) => (
                  <tr key={i}><td colSpan={8} className="p-3"><div className="h-10 bg-secondary/50 rounded animate-pulse" /></td></tr>
                ))
              ) : (filtered ?? []).map((wine: WineItem) => {
                const isLow = (wine?.stock ?? 0) > 0 && (wine?.stock ?? 0) <= (wine?.minStock ?? 3);
                const isOut = (wine?.stock ?? 0) === 0;
                return (
                  <tr key={wine?.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-10 flex-shrink-0 bg-secondary rounded overflow-hidden">
                          <Image src={wine?.imageUrl || WINE_TYPE_IMAGES[wine?.type ?? 'Tinto'] || ''} alt={wine?.name ?? ''} fill className="object-contain" sizes="32px" />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{wine?.name ?? ''}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{wine?.type ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">{wine?.type ?? ''}</td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-xs">{wine?.country ?? ''}</span>
                      {wine?.region && <span className="text-xs text-muted-foreground"> / {wine.region}</span>}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs">{wine?.grape ?? ''}</td>
                    <td className="p-3 text-right font-medium">${wine?.price?.toLocaleString?.('es-MX') ?? '0'}</td>
                    <td className="p-3 text-right hidden md:table-cell text-muted-foreground">${wine?.costPrice?.toLocaleString?.('es-MX') ?? '0'}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isOut ? 'bg-destructive/20 text-destructive' : isLow ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {wine?.stock ?? 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleAdjustStock(wine, 'increase')} className="p-1.5 rounded-lg hover:bg-green-500/20 transition-colors text-muted-foreground hover:text-green-400" title="Aumentar stock">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAdjustStock(wine, 'decrease')} className="p-1.5 rounded-lg hover:bg-yellow-500/20 transition-colors text-muted-foreground hover:text-yellow-400" title="Reducir stock">
                          <Minus className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(wine)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(wine?.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && (filtered?.length ?? 0) === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Wine className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No se encontraron vinos</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && editWine && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); setEditWine(null); }}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              onClick={(e: any) => e?.stopPropagation?.()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">{editWine?.id ? 'Editar Vino' : 'Nuevo Vino'}</h2>
                <button onClick={() => { setShowModal(false); setEditWine(null); }} className="p-1 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Nombre *</label>
                  <input value={editWine?.name ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), name: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo</label>
                  <select value={editWine?.type ?? 'Tinto'} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), type: e?.target?.value ?? 'Tinto' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none">
                    {['Tinto', 'Blanco', 'Rosado', 'Espumoso', 'Dulce'].map((t: string) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Cepa</label>
                  <input value={editWine?.grape ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), grape: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">País</label>
                  <input value={editWine?.country ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), country: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Región</label>
                  <input value={editWine?.region ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), region: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Clasificación</label>
                  <input value={editWine?.classification ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), classification: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Añada</label>
                  <input value={editWine?.vintage ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), vintage: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Precio Venta (MXN)</label>
                  <input type="number" min={0} value={editWine?.price ?? 0} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), price: e?.target?.value ?? 0 }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Precio Costo (MXN)</label>
                  <input type="number" min={0} value={editWine?.costPrice ?? 0} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), costPrice: e?.target?.value ?? 0 }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock</label>
                  <input type="number" min={0} value={editWine?.stock ?? 0} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), stock: parseInt(e?.target?.value ?? '0') }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock Mínimo</label>
                  <input type="number" min={0} value={editWine?.minStock ?? 3} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), minStock: parseInt(e?.target?.value ?? '3') }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Promedio Consumo</label>
                  <input type="number" min={1} value={editWine?.avgConsumption ?? 6} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), avgConsumption: parseInt(e?.target?.value ?? '6') }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                  <p className="text-xs text-muted-foreground mt-1">Cantidad sugerida para pedidos</p>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Imagen</label>
                  <div className="flex items-center gap-4">
                    {editWine?.imageUrl && (
                      <div className="relative w-16 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={editWine.imageUrl} alt="preview" fill className="object-contain" sizes="64px" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm cursor-pointer hover:bg-secondary/80 transition-colors">
                        <Upload className="w-4 h-4" /> {uploadingImage ? 'Subiendo...' : 'Descargar'}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                          onChange={(e: any) => { const f = e?.target?.files?.[0]; if (f) handleImageUpload(f); }} />
                      </label>
                      <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm cursor-pointer hover:bg-primary/90 transition-colors">
                        <Camera className="w-4 h-4" /> {uploadingImage ? 'Capturando...' : 'Tomar foto'}
                        <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploadingImage}
                          onChange={(e: any) => { const f = e?.target?.files?.[0]; if (f) handleImageUpload(f); }} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Descripción</label>
                  <textarea rows={3} value={editWine?.description ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), description: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Notas de Cata</label>
                  <textarea rows={3} value={editWine?.tastingNotes ?? ''} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), tastingNotes: e?.target?.value ?? '' }))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none resize-none" />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" checked={editWine?.active ?? true} onChange={(e: any) => setEditWine((p: any) => ({ ...(p ?? {}), active: e?.target?.checked ?? true }))}
                    className="accent-primary" id="active-check" />
                  <label htmlFor="active-check" className="text-sm">Activo (visible en carta)</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/30">
                <button onClick={() => { setShowModal(false); setEditWine(null); }}
                  className="px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {showAdjustModal && adjustWine && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowAdjustModal(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border/30 w-full max-w-md max-h-[90vh] flex flex-col"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              onClick={(e: any) => e?.stopPropagation?.()}
            >
              <div className="flex items-center justify-between p-6 pb-2">
                <h2 className="font-display text-lg font-bold">
                  {adjustType === 'increase' ? '➕ Aumentar Stock' : '➖ Reducir Stock'}
                </h2>
                <button onClick={() => setShowAdjustModal(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto flex-1 px-6 pb-6">
              <p className="text-sm text-muted-foreground mb-4">{adjustWine?.name}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock actual: <span className="font-bold text-primary">{adjustWine?.stock ?? 0}</span></label>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Cantidad</label>
                  <input type="number" min={1} value={adjustQty} onChange={(e: any) => setAdjustQty(parseInt(e?.target?.value ?? '1'))}
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                </div>
                {adjustType === 'decrease' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Razón de reducción *</label>
                    <select value={adjustReason} onChange={(e: any) => setAdjustReason(e?.target?.value ?? '')}
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none">
                      <option value="">Seleccionar razón...</option>
                      <option value="broken">🔨 Botella rota</option>
                      <option value="lost">🚨 Pérdida/Robo</option>
                      <option value="spoiled">⚠️ Vino dañado</option>
                      <option value="expired">📅 Vencido</option>
                      <option value="tasting">🍷 Prueba/Degustación</option>
                      <option value="promotion">🎁 Promoción/Obsequio</option>
                      <option value="shrinkage">📉 Merma/Evaporación</option>
                      <option value="defect">❌ Defecto de fabricación</option>
                      <option value="other">✏️ Otra razón</option>
                    </select>
                  </div>
                )}
                {adjustReason === 'other' && adjustType === 'decrease' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Especificar razón</label>
                    <input type="text" value={adjustReason === 'other' ? adjustNotes : ''} onChange={(e: any) => setAdjustNotes(e?.target?.value ?? '')}
                      placeholder="Describe la razón..."
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1 block">Notas adicionales (opcional)</label>
                  <textarea rows={2} value={adjustNotes} onChange={(e: any) => setAdjustNotes(e?.target?.value ?? '')}
                    placeholder="Comentarios..."
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none resize-none" />
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    Nuevo stock: <span className="font-bold text-foreground">{adjustType === 'increase' ? (adjustWine?.stock ?? 0) + adjustQty : (adjustWine?.stock ?? 0) - adjustQty}</span>
                  </p>
                </div>
                <button onClick={handleSaveAdjustment}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  Confirmar ajuste
                </button>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Inventory Modal */}
      <ClearInventoryModal 
        isOpen={showClearInventory} 
        onClose={() => {
          setShowClearInventory(false);
          fetchWines(); // Refresh the wines list after clearing
        }} 
      />
    </div>
  );
}
