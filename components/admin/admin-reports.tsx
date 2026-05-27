'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Printer, TrendingUp, TrendingDown, AlertTriangle, Filter } from 'lucide-react';
import { toast } from 'sonner';

type Adjustment = {
  id: string;
  wine: {
    id: string;
    name: string;
    type: string;
    price: number;
    costPrice: number;
    grape: string;
    country: string;
    region: string;
  };
  type: string;
  quantity: number;
  reason: string | null;
  notes: string | null;
  createdAt: string;
};

type ReportData = {
  startDate: string;
  endDate: string;
  totalAdjustments: number;
  byWine: Record<string, any>;
  raw: Adjustment[];
};

const REASON_LABELS: Record<string, string> = {
  'venta': '💰 Venta',
  'Botella rota': '🔨 Botella rota',
  'broken': '🔨 Botella rota',
  'Control de calidad': '🔍 Control de calidad',
  'Perdida en traslado': '🚚 Pérdida en traslado',
  'lost': '🚨 Pérdida/Robo',
  'spoiled': '⚠️ Vino dañado',
  'expired': '📅 Vencido',
  'tasting': '🍷 Prueba/Degustación',
  'promotion': '🎁 Promoción/Obsequio',
  'shrinkage': '📉 Merma/Evaporación',
  'defect': '❌ Defecto de fabricación',
  'other': '✏️ Otra',
};

const FILTER_OPTIONS = [
  { value: 'all', label: '📋 Todos los movimientos' },
  { value: 'ventas', label: '💰 Solo Ventas' },
  { value: 'aumentos', label: '➕ Solo Aumentos (reposición)' },
  { value: 'mermas', label: '📉 Solo Mermas (roturas, pérdidas, etc.)' },
];

function getReasonLabel(reason: string | null): string {
  if (!reason) return '-';
  return REASON_LABELS[reason] || reason;
}

export function AdminReports() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter the raw data based on active filter
  const filteredData = useMemo(() => {
    if (!report) return [];
    const raw = report.raw;
    switch (activeFilter) {
      case 'ventas':
        return raw.filter((a) => a.type === 'decrease' && a.reason === 'venta');
      case 'aumentos':
        return raw.filter((a) => a.type === 'increase');
      case 'mermas':
        return raw.filter((a) => a.type === 'decrease' && a.reason !== 'venta');
      default:
        return raw;
    }
  }, [report, activeFilter]);

  // Compute summary from filtered data
  const summary = useMemo(() => {
    const totalMov = filteredData.length;
    const totalInc = filteredData.filter((a) => a.type === 'increase').reduce((s, a) => s + a.quantity, 0);
    const totalDec = filteredData.filter((a) => a.type === 'decrease').reduce((s, a) => s + a.quantity, 0);
    return { totalMov, totalInc, totalDec };
  }, [filteredData]);

  const filterLabel = FILTER_OPTIONS.find((f) => f.value === activeFilter)?.label || 'Todos';

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) { toast.error('Selecciona ambas fechas'); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/inventory-adjustments/report?startDate=${startDate}&endDate=${endDate}`);
      if (r?.ok) {
        const data = await r.json();
        setReport(data);
        setActiveFilter('all');
        toast.success('Reporte generado');
      } else {
        toast.error('Error al generar reporte');
      }
    } catch { toast.error('Error'); }
    setLoading(false);
  };

  const handlePrintReport = () => {
    if (!report) return;
    const content = generateReportHTML();
    const newWin = window.open('', '', 'height=800,width=1000');
    if (newWin) {
      newWin.document.write(content);
      newWin.document.close();
      setTimeout(() => newWin.print(), 250);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    try {
      const htmlContent = generateReportHTML();
      const filterSlug = activeFilter === 'all' ? '' : `-${activeFilter}`;
      const r = await fetch('/api/html-to-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent, filename: `reporte${filterSlug}-${startDate}-${endDate}` }),
      });
      if (r?.ok) {
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte${filterSlug}-${startDate}-${endDate}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('PDF descargado');
      }
    } catch { toast.error('Error al descargar PDF'); }
  };

  const generateReportHTML = (): string => {
    if (!report) return '';
    const date = new Date().toLocaleDateString('es-MX');

    // Title based on filter
    const titleMap: Record<string, string> = {
      'all': '📊 Reporte de Movimientos de Inventario',
      'ventas': '💰 Reporte de Ventas',
      'aumentos': '➕ Reporte de Reposiciones',
      'mermas': '📉 Reporte de Mermas',
    };
    const title = titleMap[activeFilter] || titleMap['all'];

    let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #8B6914; text-align: center; border-bottom: 3px solid #8B6914; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #f0e6d2; color: #333; padding: 10px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #faf8f5; }
          .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
          .card { background: #f9f7f4; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .increase { color: #22c55e; font-weight: bold; }
          .decrease { color: #ef4444; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
          .filter-badge { background: #f0e6d2; padding: 4px 12px; border-radius: 12px; font-size: 13px; display: inline-block; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p style="text-align: center; color: #666;">
          Período: <strong>${startDate}</strong> al <strong>${endDate}</strong><br>
          Generado: ${date}
          ${activeFilter !== 'all' ? `<br><span class="filter-badge">Filtro: ${filterLabel.replace(/[^\w\s()áéíóúñÁÉÍÓÚÑ,./]/g, '').trim()}</span>` : ''}
        </p>
    `;

    // Summary
    html += `
      <div class="summary">
        <div class="card">
          <h3 style="margin: 0 0 10px 0; color: #8B6914;">📝 Movimientos</h3>
          <p style="font-size: 24px; margin: 0; font-weight: bold; color: #8B6914;">${summary.totalMov}</p>
        </div>
        ${summary.totalInc > 0 ? `
        <div class="card">
          <h3 style="margin: 0 0 10px 0; color: #22c55e;">➕ Total Agregado</h3>
          <p style="font-size: 24px; margin: 0; font-weight: bold; color: #22c55e;">${summary.totalInc} botellas</p>
        </div>` : ''}
        ${summary.totalDec > 0 ? `
        <div class="card">
          <h3 style="margin: 0 0 10px 0; color: #ef4444;">➖ Total Reducido</h3>
          <p style="font-size: 24px; margin: 0; font-weight: bold; color: #ef4444;">${summary.totalDec} botellas</p>
        </div>` : ''}
      </div>
    `;

    // By wine detail (recomputed from filtered data)
    const byWineFiltered: Record<string, { wine: any; totalIncrease: number; totalDecrease: number }> = {};
    for (const adj of filteredData) {
      if (!byWineFiltered[adj.wine.id]) {
        byWineFiltered[adj.wine.id] = { wine: adj.wine, totalIncrease: 0, totalDecrease: 0 };
      }
      if (adj.type === 'increase') byWineFiltered[adj.wine.id].totalIncrease += adj.quantity;
      else byWineFiltered[adj.wine.id].totalDecrease += adj.quantity;
    }

    if (Object.keys(byWineFiltered).length > 0) {
      html += '<h2>Detalle por Vino</h2>';
      html += '<table>';
      html += '<tr><th>Vino</th><th>Tipo</th><th>Aumentado</th><th>Reducido</th><th>Neto</th></tr>';
      for (const [, data] of Object.entries(byWineFiltered)) {
        const wine = data.wine;
        const inc = data.totalIncrease;
        const dec = data.totalDecrease;
        const net = inc - dec;
        html += `
          <tr>
            <td><strong>${wine.name}</strong><br><small>${wine.grape} - ${wine.country}</small></td>
            <td>${wine.type}</td>
            <td class="increase">${inc > 0 ? '+' + inc : '-'}</td>
            <td class="decrease">${dec > 0 ? '-' + dec : '-'}</td>
            <td><strong>${net >= 0 ? '+' : ''}${net}</strong></td>
          </tr>
        `;
      }
      html += '</table>';
    }

    // All adjustments
    html += '<h2>Historial de Movimientos</h2>';
    html += '<table>';
    html += '<tr><th>Fecha</th><th>Vino</th><th>Tipo</th><th>Cantidad</th><th>Razón</th><th>Notas</th></tr>';

    for (const adj of filteredData) {
      const typeIcon = adj.type === 'increase' ? '➕' : '➖';
      const typeClass = adj.type === 'increase' ? 'increase' : 'decrease';
      const d = new Date(adj.createdAt).toLocaleDateString('es-MX');
      const t = new Date(adj.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      html += `
        <tr>
          <td>${d} ${t}</td>
          <td>${adj.wine.name}</td>
          <td class="${typeClass}">${typeIcon} ${adj.type === 'increase' ? 'Aumento' : 'Reducción'}</td>
          <td class="${typeClass}"><strong>${adj.type === 'increase' ? '+' : '-'}${adj.quantity}</strong></td>
          <td>${getReasonLabel(adj.reason)}</td>
          <td>${adj.notes || '-'}</td>
        </tr>
      `;
    }
    html += '</table>';

    html += '<div class="footer"><p>Este reporte fue generado automáticamente por el sistema de inventario.</p></div>';
    html += '</body></html>';
    return html;
  };

  return (
    <div>
      {/* Date Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border/30 p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <h3 className="font-display text-lg font-bold mb-4">Generar Reporte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Desde</label>
            <input type="date" value={startDate} onChange={(e: any) => setStartDate(e?.target?.value ?? '')}
              className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Hasta</label>
            <input type="date" value={endDate} onChange={(e: any) => setEndDate(e?.target?.value ?? '')}
              className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerateReport} disabled={loading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" /> {loading ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Report Display */}
      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Type Filter Tabs */}
          <div className="bg-card rounded-xl border border-border/30 p-4 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filtrar por tipo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeFilter === opt.value
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button onClick={handlePrintReport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors w-full sm:w-auto">
              <Printer className="w-4 h-4" /> Imprimir {activeFilter !== 'all' ? `(${filterLabel.replace(/[^\w\s()áéíóúñÁÉÍÓÚÑ]/g, '').trim()})` : ''}
            </button>
            <button onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto">
              <Download className="w-4 h-4" /> Descargar PDF
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border/30 p-5" style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Movimientos</p>
                  <p className="text-3xl font-bold text-primary">{summary.totalMov}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border/30 p-5" style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Agregado</p>
                  <p className="text-3xl font-bold text-green-400">
                    +{summary.totalInc}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400/30" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border/30 p-5" style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Reducido</p>
                  <p className="text-3xl font-bold text-red-400">
                    -{summary.totalDec}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400/30" />
              </div>
            </motion.div>
          </div>

          {/* No results message */}
          {filteredData.length === 0 && (
            <div className="bg-card rounded-xl border border-border/30 p-8 text-center mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
              <p className="text-muted-foreground">No hay movimientos para el filtro seleccionado en este período.</p>
            </div>
          )}

          {/* Adjustments Table */}
          {filteredData.length > 0 && (
            <div className="bg-card rounded-xl border border-border/30 overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/50">
                      <th className="text-left p-3 font-medium">Fecha</th>
                      <th className="text-left p-3 font-medium">Vino</th>
                      <th className="text-center p-3 font-medium">Tipo</th>
                      <th className="text-right p-3 font-medium">Cantidad</th>
                      <th className="text-left p-3 font-medium">Razón</th>
                      <th className="text-left p-3 font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((adj: Adjustment) => (
                      <tr key={adj.id} className="border-b border-border/20 hover:bg-secondary/30">
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(adj.createdAt).toLocaleDateString('es-MX')} {new Date(adj.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{adj.wine.name}</p>
                          <p className="text-xs text-muted-foreground">{adj.wine.grape} - {adj.wine.country}</p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            adj.type === 'increase' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {adj.type === 'increase' ? '➕ Aumento' : '➖ Reducción'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">
                          <span className={adj.type === 'increase' ? 'text-green-400' : 'text-red-400'}>
                            {adj.type === 'increase' ? '+' : '-'}{adj.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-xs">{getReasonLabel(adj.reason)}</td>
                        <td className="p-3 text-xs text-muted-foreground">{adj.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
