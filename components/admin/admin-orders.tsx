'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Send, Trash2, Plus, Minus, FileText, Share2, MessageCircle, Mail, ClipboardCopy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type LowStockWine = {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  grape: string;
  stock: number;
  minStock: number;
  avgConsumption: number;
  costPrice: number;
  price: number;
};

type OrderItem = {
  wineId: string;
  wineName: string;
  wineType: string;
  quantity: number;
  costPrice: number;
  country: string;
  region: string;
  grape: string;
};

type PurchaseOrder = {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    wineId: string;
    quantity: number;
    wine: { id: string; name: string; type: string; grape: string; country: string; region: string; costPrice: number };
  }>;
};

export function AdminOrders() {
  const [lowStockWines, setLowStockWines] = useState<LowStockWine[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pastOrders, setPastOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareOrder, setShareOrder] = useState<PurchaseOrder | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/purchase-orders?action=low-stock').then(r => r?.json()),
      fetch('/api/purchase-orders').then(r => r?.json()),
      fetch('/api/settings').then(r => r?.json()),
    ]).then(([low, orders, s]: any[]) => {
      setLowStockWines(low ?? []);
      setPastOrders(orders ?? []);
      setSettings(s ?? {});
      // Auto-populate order items from low stock wines
      const items: OrderItem[] = (low ?? []).map((w: LowStockWine) => ({
        wineId: w.id,
        wineName: w.name,
        wineType: w.type,
        quantity: w.avgConsumption || 6,
        costPrice: w.costPrice || 0,
        country: w.country,
        region: w.region,
        grape: w.grape,
      }));
      setOrderItems(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateQty = (wineId: string, delta: number) => {
    setOrderItems(prev => prev.map((item: OrderItem) =>
      item.wineId === wineId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (wineId: string) => {
    setOrderItems(prev => prev.filter((item: OrderItem) => item.wineId !== wineId));
  };

  const totalCost = orderItems.reduce((sum: number, item: OrderItem) => sum + (item.costPrice * item.quantity), 0);
  const totalBottles = orderItems.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0);

  const generateOrderText = (order?: PurchaseOrder) => {
    const name = settings?.restaurantName || 'La Vinoteca';
    const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const items = order ? order.items.map((i: any) => i) : orderItems;
    const line = '──────────────────────────────';
    
    let text = `${line}\n`;
    text += `🍷 PEDIDO DE VINOS\n`;
    text += `${name}\n`;
    text += `Fecha: ${date}\n`;
    text += `${line}\n\n`;

    if (order) {
      items.forEach((item: any, idx: number) => {
        text += `${idx + 1}. ${item.wine?.name ?? ''}\n`;
        text += `   Tipo: ${item.wine?.type ?? ''} | Cepa: ${item.wine?.grape ?? ''}\n`;
        text += `   Origen: ${item.wine?.country ?? ''} - ${item.wine?.region ?? ''}\n`;
        text += `   Cantidad: ${item.quantity} botellas\n`;
        if (item.wine?.costPrice > 0) text += `   Precio unit.: $${item.wine.costPrice.toLocaleString('es-MX')}\n`;
        text += `\n`;
      });
      const total = items.reduce((s: number, i: any) => s + ((i.wine?.costPrice ?? 0) * i.quantity), 0);
      const bottles = items.reduce((s: number, i: any) => s + i.quantity, 0);
      text += `${line}\n`;
      text += `Total: ${bottles} botellas`;
      if (total > 0) text += ` | $${total.toLocaleString('es-MX')} MXN`;
    } else {
      items.forEach((item: OrderItem, idx: number) => {
        text += `${idx + 1}. ${item.wineName}\n`;
        text += `   Tipo: ${item.wineType} | Cepa: ${item.grape}\n`;
        text += `   Origen: ${item.country} - ${item.region}\n`;
        text += `   Cantidad: ${item.quantity} botellas\n`;
        if (item.costPrice > 0) text += `   Precio unit.: $${item.costPrice.toLocaleString('es-MX')}\n`;
        text += `\n`;
      });
      text += `${line}\n`;
      text += `Total: ${totalBottles} botellas`;
      if (totalCost > 0) text += ` | $${totalCost.toLocaleString('es-MX')} MXN`;
    }

    if (orderNotes || order?.notes) text += `\n\nNotas: ${orderNotes || order?.notes || ''}`;
    text += `\n${line}`;
    return text;
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) { toast.error('No hay items en el pedido'); return; }
    try {
      const r = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems.map((i: OrderItem) => ({ wineId: i.wineId, quantity: i.quantity })),
          notes: orderNotes || null,
        }),
      });
      if (r?.ok) {
        const order = await r.json();
        toast.success('Pedido creado exitosamente');
        setShareOrder(order);
        setShowShareModal(true);
        // Refresh past orders
        const ordersRes = await fetch('/api/purchase-orders');
        const orders = await ordersRes?.json();
        setPastOrders(orders ?? []);
      } else {
        toast.error('Error al crear pedido');
      }
    } catch { toast.error('Error al crear pedido'); }
  };

  const handleShareWhatsApp = (order?: PurchaseOrder) => {
    try {
      const text = generateOrderText(order);
      const encoded = encodeURIComponent(text);
      const url = `https://wa.me/?text=${encoded}`;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error('No se pudo abrir WhatsApp. Intenta copiar el pedido al portapapeles.');
    }
  };

  const handleShareEmail = (order?: PurchaseOrder) => {
    try {
      const name = settings?.restaurantName || 'La Vinoteca';
      const text = generateOrderText(order);
      const subject = encodeURIComponent(`Pedido de Vinos - ${name}`);
      const body = encodeURIComponent(text);
      const url = `mailto:?subject=${subject}&body=${body}`;
      const a = document.createElement('a');
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error('No se pudo abrir el correo. Intenta copiar el pedido al portapapeles.');
    }
  };

  const handleCopyToClipboard = (order?: PurchaseOrder) => {
    const text = generateOrderText(order);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast.success('Pedido copiado al portapapeles')).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('Pedido copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar. Selecciona el texto manualmente.');
    }
  };

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setShowPast(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showPast ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}>
          <ShoppingCart className="w-4 h-4 inline mr-1" /> Nuevo Pedido
          {orderItems.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-destructive text-white rounded-full text-xs">{orderItems.length}</span>}
        </button>
        <button onClick={() => setShowPast(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPast ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}>
          <FileText className="w-4 h-4 inline mr-1" /> Historial
        </button>
      </div>

      {!showPast ? (
        <>
          {/* Low stock info */}
          {lowStockWines.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-400">{lowStockWines.length} vinos debajo del stock mínimo se agregaron automáticamente al pedido.</p>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_: any, i: number) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>
          ) : orderItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No hay vinos con stock bajo. ¡Todo en orden!</p>
            </div>
          ) : (
            <>
              {/* Order items */}
              <div className="bg-card rounded-xl border border-border/30 overflow-hidden mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/50">
                        <th className="text-left p-3 font-medium">Vino</th>
                        <th className="text-center p-3 font-medium hidden sm:table-cell">Stock Actual</th>
                        <th className="text-center p-3 font-medium">Cantidad</th>
                        <th className="text-right p-3 font-medium hidden sm:table-cell">Costo Unit.</th>
                        <th className="text-right p-3 font-medium hidden sm:table-cell">Subtotal</th>
                        <th className="text-center p-3 font-medium w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item: OrderItem) => {
                        const lsw = lowStockWines.find((w: LowStockWine) => w.id === item.wineId);
                        return (
                          <tr key={item.wineId} className="border-b border-border/20 hover:bg-secondary/30">
                            <td className="p-3">
                              <p className="font-medium text-sm">{item.wineName}</p>
                              <p className="text-xs text-muted-foreground">{item.wineType} • {item.grape} • {item.country}</p>
                            </td>
                            <td className="p-3 text-center hidden sm:table-cell">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">{lsw?.stock ?? '?'} / {lsw?.minStock ?? '?'}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => updateQty(item.wineId, -1)} className="p-1 rounded hover:bg-secondary"><Minus className="w-3 h-3" /></button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button onClick={() => updateQty(item.wineId, 1)} className="p-1 rounded hover:bg-secondary"><Plus className="w-3 h-3" /></button>
                              </div>
                            </td>
                            <td className="p-3 text-right hidden sm:table-cell text-muted-foreground">${item.costPrice.toLocaleString('es-MX')}</td>
                            <td className="p-3 text-right hidden sm:table-cell font-medium">${(item.costPrice * item.quantity).toLocaleString('es-MX')}</td>
                            <td className="p-3 text-center">
                              <button onClick={() => removeItem(item.wineId)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary + Notes + Action */}
              <div className="bg-card rounded-xl border border-border/30 p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-foreground">{totalBottles} botellas</span></p>
                    {totalCost > 0 && <p className="text-sm text-muted-foreground">Costo estimado: <span className="font-bold text-primary">${totalCost.toLocaleString('es-MX')} MXN</span></p>}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block">Notas del pedido (opcional)</label>
                  <textarea rows={2} value={orderNotes} onChange={(e: any) => setOrderNotes(e?.target?.value ?? '')}
                    placeholder="Ej: Proveedor preferido, dirección de entrega..."
                    className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none resize-none" />
                </div>
                <button onClick={handleCreateOrder}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  <Send className="w-4 h-4" /> Realizar Pedido
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        /* Past Orders */
        <div>
          {pastOrders.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No hay pedidos anteriores</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastOrders.map((order: PurchaseOrder) => (
                <div key={order.id} className="bg-card rounded-xl border border-border/30 p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">Pedido del {new Date(order.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">{order.items.length} etiquetas • {order.items.reduce((s: number, i: any) => s + i.quantity, 0)} botellas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>{order.status === 'sent' ? 'Enviado' : 'Borrador'}</span>
                      <button onClick={() => handleCopyToClipboard(order)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground" title="Copiar">
                        <ClipboardCopy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShareWhatsApp(order)} className="p-1.5 rounded-lg hover:bg-green-500/20 text-muted-foreground hover:text-green-400" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShareEmail(order)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400" title="Email">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1 border-t border-border/10">
                        <span className="truncate flex-1">{item.wine?.name ?? ''} ({item.wine?.type})</span>
                        <span className="text-muted-foreground ml-2">{item.quantity} btls</span>
                      </div>
                    ))}
                  </div>
                  {order.notes && <p className="text-xs text-muted-foreground mt-2 italic">Notas: {order.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && shareOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-2xl border border-border/30 w-full max-w-md p-6"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              onClick={(e: any) => e?.stopPropagation?.()}
            >
              <h3 className="font-display text-lg font-bold mb-4 gold-text">¡Pedido Creado!</h3>
              <p className="text-sm text-muted-foreground mb-6">Tu pedido ha sido guardado. ¿Cómo deseas compartirlo?</p>
              <div className="space-y-3">
                <button onClick={() => { handleShareWhatsApp(shareOrder); setShowShareModal(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600/30 transition-colors">
                  <MessageCircle className="w-5 h-5" /> Enviar por WhatsApp
                </button>
                <button onClick={() => { handleShareEmail(shareOrder); setShowShareModal(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors">
                  <Mail className="w-5 h-5" /> Enviar por Correo
                </button>
                <button onClick={() => { handleCopyToClipboard(shareOrder); setShowShareModal(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors">
                  <ClipboardCopy className="w-5 h-5" /> Copiar al Portapapeles
                </button>
              </div>
              <button onClick={() => setShowShareModal(false)} className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cerrar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
