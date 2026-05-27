'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BlockingModalProps {
  isOpen: boolean;
  orderId: string;
  tableName: string;
  wineName: string;
  quantity: number;
  onApproved: () => void;
  onRejected: () => void;
}

export function WineBlockingModal({
  isOpen,
  orderId,
  tableName,
  wineName,
  quantity,
  onApproved,
  onRejected,
}: BlockingModalProps) {
  const [status, setStatus] = useState<'waiting' | 'approved' | 'rejected'>('waiting');
  const [isChecking, setIsChecking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen || status !== 'waiting') return;

    // Auto-check status every 2 seconds
    const interval = setInterval(() => {
      checkStatus();
      setTimeElapsed(prev => prev + 2);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, status]);

  const checkStatus = async () => {
    try {
      setIsChecking(true);
      const res = await fetch(`/api/wine-requests/${orderId}/status`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.approvalStatus === 'approved') {
        setStatus('approved');
        setTimeout(() => onApproved(), 1000);
      } else if (data.approvalStatus === 'rejected') {
        setStatus('rejected');
        setTimeout(() => onRejected(), 1000);
      }
    } catch (err) {
      console.error('Error checking status:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl border border-border/30 w-full max-w-sm overflow-hidden text-center"
            style={{ boxShadow: 'var(--shadow-2xl)' }}
          >
            {/* Waiting State */}
            {status === 'waiting' && (
              <div className="p-8 space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center"
                >
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </motion.div>

                <div className="space-y-3">
                  <h2 className="font-display text-2xl font-bold">Esperando Aprobacion</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    La tablet se ha bloqueado temporalmente. Por favor, pasa la tablet al mesero para que apruebe tu seleccion.
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vino:</span>
                    <span className="font-semibold truncate">{wineName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mesa:</span>
                    <span className="font-semibold">{tableName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="font-semibold">{quantity} botellas</span>
                  </div>
                </div>

                <button
                  onClick={checkStatus}
                  disabled={isChecking}
                  className="w-full py-2.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isChecking ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isChecking ? 'Revisando...' : 'Revisar estado'}
                </button>

                <p className="text-xs text-muted-foreground">Se revisa automaticamente cada 2 segundos</p>
              </div>
            )}

            {/* Approved State */}
            {status === 'approved' && (
              <div className="p-8 space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold">Aprobado</h2>
                  <p className="text-sm text-muted-foreground">Tu pedido ha sido aprobado por el mesero. El pedido sera procesado en breve.</p>
                </div>

                <p className="text-xs text-muted-foreground">Puedes cerrar la tablet o volver al menu.</p>
              </div>
            )}

            {/* Rejected State */}
            {status === 'rejected' && (
              <div className="p-8 space-y-6">
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center"
                >
                  <XCircle className="w-8 h-8 text-red-500" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold">No Aprobado</h2>
                  <p className="text-sm text-muted-foreground">El mesero no pudo aprobar tu seleccion en este momento. Por favor, intenta de nuevo con otro vino.</p>
                </div>

                <p className="text-xs text-muted-foreground">La tablet ha sido desbloqueada.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
