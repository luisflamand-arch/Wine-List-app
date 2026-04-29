import { MeseroClient } from '@/components/mesero/mesero-client';

export const metadata = {
  title: 'Panel Mesero - Aprobaciones de Pedidos',
  description: 'Panel para que meseros aprueben o rechacen pedidos de comensales',
};

export default function MeseroPage() {
  return <MeseroClient />;
}
