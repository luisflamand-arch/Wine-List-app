'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wine, Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

type Stats = {
  totalWines: number;
  activeWines: number;
  outOfStock: number;
  lowStock: number;
  byType: Record<string, number>;
  byCountry: Record<string, number>;
  totalValue: number;
};

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setDisplay(Math.floor(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{display?.toLocaleString?.('es-MX') ?? '0'}{suffix}</span>;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r?.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_: any, i: number) => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}</div>;
  if (!stats) return <p className="text-muted-foreground">Error al cargar estadísticas</p>;

  const cards = [
    { icon: Wine, label: 'Total Vinos', value: stats?.totalWines ?? 0, color: 'text-primary' },
    { icon: Package, label: 'En Stock', value: stats?.activeWines ?? 0, color: 'text-green-400' },
    { icon: AlertTriangle, label: 'Stock Bajo', value: stats?.lowStock ?? 0, color: 'text-yellow-400' },
    { icon: DollarSign, label: 'Valor Inventario', value: stats?.totalValue ?? 0, color: 'text-primary', prefix: '$' },
  ];

  const typeEntries = Object.entries(stats?.byType ?? {}).sort((a: any, b: any) => (b?.[1] ?? 0) - (a?.[1] ?? 0));
  const countryEntries = Object.entries(stats?.byCountry ?? {}).sort((a: any, b: any) => (b?.[1] ?? 0) - (a?.[1] ?? 0));
  const maxType = Math.max(...typeEntries.map((e: any) => e?.[1] ?? 0), 1);
  const maxCountry = Math.max(...countryEntries.map((e: any) => e?.[1] ?? 0), 1);

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-5 border border-border/30" style={{ boxShadow: 'var(--shadow-md)' }}
          >
            {c?.icon && <c.icon className={`w-6 h-6 ${c?.color ?? ''} mb-3`} />}
            <p className="text-2xl font-display font-bold">
              <AnimatedNumber value={c?.value ?? 0} prefix={c?.prefix ?? ''} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{c?.label ?? ''}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-5 border border-border/30" style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h3 className="font-display text-base font-bold mb-4">Por Tipo</h3>
          <div className="space-y-3">
            {typeEntries.map(([type, count]: any, i: number) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{type}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((count ?? 0) / maxType) * 100}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    className="h-full bg-primary rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-5 border border-border/30" style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h3 className="font-display text-base font-bold mb-4">Por País</h3>
          <div className="space-y-3">
            {countryEntries.map(([country, count]: any, i: number) => (
              <div key={country}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{country}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((count ?? 0) / maxCountry) * 100}%` }} transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                    className="h-full bg-accent rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Low stock alert */}
      {(stats?.lowStock ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-400">Alerta de Stock Bajo</p>
            <p className="text-sm text-muted-foreground">{stats.lowStock} vinos están en o por debajo del stock mínimo. Revisa el inventario.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
