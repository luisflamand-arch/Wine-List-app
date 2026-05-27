'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Wine, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { WINE_TYPE_IMAGES } from '@/lib/constants';

type WineRequestItem = {
  id: string;
  wineId: string;
  tableName: string;
  quantity: number;
  status: string;
  notes: string | null;
  createdAt: string;
  wine: {
    id: string;
    name: string;
    type: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    grape: string;
    country: string;
    region: string;
  };
};

export function AdminRequests() {
  const [requests, setRequests] = useState<WineRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'pending' ? '?status=pending' : '';
      const r = await fetch(`/api/wine-requests${params}`);
      const data = await r?.json();
      setRequests(data ?? []);
    } catch { setRequests([]); }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Auto-refresh every 15 seconds for pending requests
  useEffect(() => {
    if (filter !== 'pending') return;
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, [filter, fetchRequests]);

  const handleAction = async (id: string, status: 'confirmed' | 'rejected') => {
    try {
      const r = await fetch(`/api/wine-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r?.ok) {
        toast.success(status === 'confirmed' ? 'Solicitud confirmada - stock descontado' : 'Solicitud rechazada');
        fetchRequests();
      } else {
        const err = await r?.json().catch(() => ({}));
        toast.error(err?.error ?? 'Error');
      }
    } catch { toast.error('Error al procesar'); }
  };

  const pendingCount = requests.filter((r: WineRequestItem) => r.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}>
            Pendientes {pendingCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-destructive text-white rounded-full text-xs">{pendingCount}</span>}
          </button>
          <button onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}>
            Todas
          </button>
        </div>
        <button onClick={fetchRequests} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && requests.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_: any, i: number) => (
            <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No hay solicitudes {filter === 'pending' ? 'pendientes' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {requests.map((req: WineRequestItem) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                className={`bg-card rounded-xl border p-4 ${
                  req.status === 'pending' ? 'border-primary/30' :
                  req.status === 'confirmed' ? 'border-green-500/20 opacity-70' : 'border-destructive/20 opacity-50'
                }`} style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-16 flex-shrink-0 bg-secondary rounded-lg overflow-hidden">
                    <Image src={req.wine?.imageUrl || WINE_TYPE_IMAGES[req.wine?.type ?? 'Tinto'] || ''} alt={req.wine?.name ?? ''} fill className="object-contain" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{req.wine?.name ?? ''}</h4>
                    <p className="text-xs text-muted-foreground">{req.wine?.type} • {req.wine?.grape} • {req.wine?.country}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded">{req.tableName}</span>
                      <span className="text-xs text-muted-foreground">Cantidad: {req.quantity}</span>
                      <span className="text-xs font-medium text-primary">${((req.wine?.price ?? 0) * req.quantity).toLocaleString('es-MX')}</span>
                      {req.notes && <span className="text-xs text-muted-foreground italic">{req.notes}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Stock actual: {req.wine?.stock ?? 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <button onClick={() => handleAction(req.id, 'confirmed')}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" title="Confirmar">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleAction(req.id, 'rejected')}
                          className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors" title="Rechazar">
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'
                      }`}>
                        {req.status === 'confirmed' ? 'Confirmada' : 'Rechazada'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
