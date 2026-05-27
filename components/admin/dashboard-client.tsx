'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wine, Package, AlertTriangle, DollarSign, LogOut, BarChart3, Settings, List, PlusCircle, Globe, Bell, ShoppingCart, TrendingUp, Utensils, Star, Layers, GlassWater } from 'lucide-react';
import { AdminInventory } from './admin-inventory';
import { AdminSettings } from './admin-settings';
import { AdminStats } from './admin-stats';
import { AdminRequests } from './admin-requests';
import { AdminOrders } from './admin-orders';
import { AdminReports } from './admin-reports';
import { AdminDishes } from './admin-dishes';
import { AdminSpecials } from './admin-specials';
import { AdminPhysicalInventory } from './admin-physical-inventory';
import { AdminPairings } from './admin-pairings';

export function AdminDashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
    // Redirect mesero users to their dashboard
    if (session?.user?.role === 'mesero') {
      router.replace('/mesero');
    }
  }, [status, router, session?.user?.role]);

  // Redirect if user is mesero (should not access admin)
  if (session?.user?.role === 'mesero') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground">Acceso denegado. Redirigiendo...</p>
        </div>
      </div>
    );
  }

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Inventario', icon: List },
    { id: 'physical', label: 'Conteo Fisico', icon: Layers },
    { id: 'dishes', label: 'Platillos', icon: Utensils },
    { id: 'pairings', label: 'Maridajes', icon: GlassWater },
    { id: 'specials', label: 'Especiales', icon: Star },
    { id: 'requests', label: 'Solicitudes', icon: Bell },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'reports', label: 'Reportes', icon: TrendingUp },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wine className="w-6 h-6 text-primary" />
            <h1 className="font-display text-lg font-bold gold-text">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.open('/', '_self')} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Ver carta">
              <Globe className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground hidden sm:inline">{session?.user?.email ?? ''}</span>
            <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="overflow-x-auto scrollbar-hide border-b border-border/50">
          <div className="flex gap-1 -mb-px px-4">
            {tabs.map((tab: any) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap shrink-0 ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab?.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab?.label ?? ''}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <AdminStats />}
        {activeTab === 'inventory' && <AdminInventory />}
        {activeTab === 'physical' && <AdminPhysicalInventory />}
        {activeTab === 'dishes' && <AdminDishes />}
        {activeTab === 'pairings' && <AdminPairings />}
        {activeTab === 'specials' && <AdminSpecials />}
        {activeTab === 'requests' && <AdminRequests />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}
