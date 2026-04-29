import { Metadata } from 'next';
import { PairingsClient } from '@/components/pairings-client';

export const metadata: Metadata = {
  title: 'Maridajes - TRATTORIA AL PASSO',
  description: 'Descubre nuestras recomendaciones de vino para cada plato'
};

export default function PairingsPage() {
  return <PairingsClient />;
}
