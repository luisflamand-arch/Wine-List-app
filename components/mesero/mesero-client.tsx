'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, CheckCircle, XCircle, LogOut, LogIn, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface PendingOrder {
  id: string;
  wineId: string;
  tableName: string;
  quantity: number;
  status: string;
  approvalStatus: string;
  notes?: string;
  createdAt: string;
  wine: {
    id: string;
    name: string;
    type: string;
    price: number;
    stock: number;
    imageUrl?: string;
    grape: string;
    region: string;
    country: string;
  };
}

export function MeseroClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
    // Redirect admin users to their dashboard
    if (session?.user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [status, router, session?.user?.role]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPendingOrders();
    }
  }, [status]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (status === 'authenticated') fetchPendingOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, status]);

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/pending-approvals');
      if (!res.ok) throw new Error('Error al cargar ordenes');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const res = await fetch(`/api/pending-approvals/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!res.ok) throw new Error('Error al aprobar');
      toast.success('Pedido aprobado');
      fetchPendingOrders();
    } catch (err: any) {
      toast.error(err.message || 'Error al aprobar');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const res = await fetch(`/api/pending-approvals/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (!res.ok) throw new Error('Error al rechazar');
      toast.success('Pedido rechazado');
      fetchPendingOrders();
    } catch (err: any) {
      toast.error(err.message || 'Error al rechazar');
    } finally {
      setProcessing(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Wine className="w-12 h-12 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold gold-text">Panel Mesero</h1>
            <p className="text-sm text-muted-foreground">Aprobaciones de Pedidos</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground/80 hover:bg-secondary/80'
              }`}
            >
              {autoRefresh ? 'Auto-actualización: ON' : 'Auto-actualización: OFF'}
            </button>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/admin/login' })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-600 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border/30 p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Pendientes</p>
            <p className="font-display text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/30 p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Tu Rol</p>
            <p className="font-display text-xl font-bold capitalize">{session.user?.name || 'Mesero'}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/30 p-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
            }`} />
            <span className="text-sm">{autoRefresh ? 'Buscando ordenes...' : 'Actualización manual'}</span>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 bg-secondary/30 rounded-xl">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <p className="text-lg font-semibold mb-1">No hay pedidos pendientes</p>
            <p className="text-sm text-muted-foreground">Todas las ordenes han sido procesadas</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card rounded-xl border border-border/30 overflow-hidden"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Wine Image */}
                    <div className="flex-shrink-0 relative w-full sm:w-20 h-28 sm:h-28 rounded-lg overflow-hidden bg-secondary">
                      {order.wine?.imageUrl ? (
                        <Image src={order.wine.imageUrl} alt={order.wine.name} fill className="object-cover" sizes="100px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wine className="w-10 h-10 text-primary/30" />
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display font-bold text-lg">{order.wine?.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {order.wine?.type} · {order.wine?.grape}
                          </p>
                        </div>
                        <span className="text-sm font-semibold gold-text">${order.wine?.price.toLocaleString('es-MX')}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Mesa:</span> <span className="font-semibold">{order.tableName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cantidad:</span> <span className="font-semibold">{order.quantity} bot.</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stock:</span> <span className="font-semibold">{order.wine?.stock}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Origen:</span> <span className="font-semibold">{order.wine?.region}</span>
                        </div>
                      </div>

                      {order.notes && (
                        <p className="text-sm text-muted-foreground italic mb-3">Nota: {order.notes}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 sm:pt-0 sm:flex-col">
                      <button
                        onClick={() => handleApproveOrder(order.id)}
                        disabled={processing === order.id}
                        className="flex-1 sm:flex-none py-2.5 px-4 bg-green-600/20 text-green-600 rounded-lg hover:bg-green-600/30 transition-colors font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processing === order.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Aprobar</span>
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order.id)}
                        disabled={processing === order.id}
                        className="flex-1 sm:flex-none py-2.5 px-4 bg-red-600/20 text-red-600 rounded-lg hover:bg-red-600/30 transition-colors font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processing === order.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Rechazar</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
