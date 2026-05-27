'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Grape, MapPin, Tag } from 'lucide-react';
import { WINE_TYPE_IMAGES, WINE_TYPE_COLORS } from '@/lib/constants';

type WineItem = {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  grape: string;
  classification: string | null;
  price: number;
  imageUrl: string | null;
};

export function WineCard({ wine, onClick }: { wine: WineItem; onClick: () => void }) {
  const imgSrc = wine?.imageUrl || WINE_TYPE_IMAGES[wine?.type ?? 'Tinto'] || WINE_TYPE_IMAGES.Tinto;
  const typeColor = WINE_TYPE_COLORS[wine?.type ?? 'Tinto'] ?? '#722F37';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -6 }}
      className="w-full text-left bg-card rounded-xl overflow-hidden border border-border/30 hover:border-primary/40 transition-all duration-300 group"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-b from-secondary to-card overflow-hidden">
        <Image
          src={imgSrc}
          alt={wine?.name ?? 'Vino'}
          fill
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: typeColor }}
          >
            {wine?.type ?? ''}
          </span>
        </div>
        {wine?.classification && (
          <div className="absolute top-3 right-3">
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary backdrop-blur-sm">
              {wine.classification}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {wine?.name ?? ''}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{wine?.region ?? ''}</span>
          <span className="inline-flex items-center gap-1"><Grape className="w-3 h-3" />{wine?.grape ?? ''}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">${wine?.price?.toLocaleString?.('es-MX') ?? '0'}</span>
          <span className="text-xs text-muted-foreground">{wine?.country ?? ''}</span>
        </div>
      </div>
    </motion.button>
  );
}
