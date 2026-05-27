'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface ClearInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClearInventoryModal({ isOpen, onClose }: ClearInventoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  const handleClearInventory = async () => {
    if (confirmText !== 'LIMPIAR TODO') {
      toast.error('Por favor, escribe "LIMPIAR TODO" para confirmar');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/inventory/clear-all', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear inventory');
      }

      const data = await response.json();
      toast.success(`Inventario eliminado: ${data.updatedCount} vinos actualizados`);
      setConfirmText('');
      setStep('warning');
      onClose();
    } catch (error) {
      console.error('Error clearing inventory:', error);
      toast.error('Error al limpiar el inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setStep('warning');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-zinc-900 rounded-lg shadow-xl max-w-md w-full border border-zinc-800">
              {step === 'warning' ? (
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Limpiar Todo el Inventario</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Esta accion no se puede deshacer
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-200">
                      Esta accion establecera el stock de TODOS los vinos a cero. Esta accion no se puede deshacer.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Confirmar Accion</h3>
                    <p className="text-sm text-zinc-400">
                      Escribe "LIMPIAR TODO" para confirmar que deseas eliminar todo el inventario:
                    </p>
                  </div>

                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder='Escribe "LIMPIAR TODO"'
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('warning')}
                      className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
                      disabled={isLoading}
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleClearInventory}
                      disabled={isLoading || confirmText !== 'LIMPIAR TODO'}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                      {isLoading ? 'Limpiando...' : 'Eliminar Todo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
