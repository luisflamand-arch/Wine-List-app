'use client';

type Props = {
  type: string;
  color?: string;
  size?: number;
};

export function WineTypeIcon({ type, color, size = 48 }: Props) {
  const iconColor = color || '#D4AF37';
  
  switch (type) {
    case 'Tinto':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/WINE-logo.svg/250px-WINE-logo.svg.png">
          {/* Wine glass with red wine */}
          <path d="M32 8C32 8 22 8 20 22C18 36 26 38 26 38L26 50H22C21 50 20 51 20 52V54C20 55 21 56 22 56H42C43 56 44 55 44 54V52C44 51 43 50 42 50H38V38C38 38 46 36 44 22C42 8 32 8 32 8Z" stroke={iconColor} strokeWidth="1.5" fill="none" />
          <path d="M21.5 26C23 32 26 34 26 38L26 38H38C38 38 41 32 42.5 26H21.5Z" fill={iconColor} opacity="0.25" />
          <ellipse cx="32" cy="26" rx="10.5" ry="1.5" fill={iconColor} opacity="0.4" />
        </svg>
      );
    case 'Blanco':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Elegant white wine glass - taller, slimmer */}
          <path d="M32 6C32 6 24 6 22 18C20 30 27 33 27 33L28 48H24C23 48 22 49 22 50V52C22 53 23 54 24 54H40C41 54 42 53 42 52V50C42 49 41 48 40 48H36V33C36 33 44 30 42 18C40 6 32 6 32 6Z" stroke={iconColor} strokeWidth="1.5" fill="none" />
          <path d="M23.5 22C24.5 27 27 30 28 33H36C37 30 39.5 27 40.5 22H23.5Z" fill={iconColor} opacity="0.12" />
          <ellipse cx="32" cy="22" rx="8.5" ry="1" fill={iconColor} opacity="0.25" />
        </svg>
      );
    case 'Rosado':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="https://i.etsystatic.com/7110280/r/il/745693/6759354604/il_570xN.6759354604_6tjz.jpg">
          {/* Rose wine - elegant tulip glass */}
          <path d="M32 8C32 8 21 8 20 24C19 34 27 36 27 36L28 49H23C22 49 21 50 21 51V53C21 54 22 55 23 55H41C42 55 43 54 43 53V51C43 50 42 49 41 49H36V36C36 36 45 34 44 24C43 8 32 8 32 8Z" stroke={iconColor} strokeWidth="1.5" fill="none" />
          <path d="M22 28C23 33 27 35 28 36H36C37 35 41 33 42 28H22Z" fill={iconColor} opacity="0.2" />
          <ellipse cx="32" cy="28" rx="10" ry="1.2" fill={iconColor} opacity="0.35" />
        </svg>
      );
    case 'Espumoso':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="https://static.vecteezy.com/system/resources/previews/073/369/875/non_2x/elegant-champagne-flute-with-golden-sparkling-wine-and-effervescent-bubbles-vector.jpg">
          {/* Champagne flute */}
          <path d="M32 4C32 4 26 4 25 16C24 28 30 30 30 30L30.5 48H26C25 48 24 49 24 50V52C24 53 25 54 26 54H38C39 54 40 53 40 52V50C40 49 39 48 38 48H33.5V30C33.5 30 40 28 39 16C38 4 32 4 32 4Z" stroke={iconColor} strokeWidth="1.5" fill="none" />
          <path d="M26 18C26.5 25 30 28 30.5 30H33.5C34 28 37.5 25 38 18H26Z" fill={iconColor} opacity="0.15" />
          {/* Bubbles */}
          <circle cx="30" cy="14" r="1" fill={iconColor} opacity="0.4" />
          <circle cx="33" cy="18" r="0.8" fill={iconColor} opacity="0.3" />
          <circle cx="31" cy="22" r="1.2" fill={iconColor} opacity="0.35" />
          <circle cx="34" cy="12" r="0.7" fill={iconColor} opacity="0.25" />
          <circle cx="29" cy="20" r="0.6" fill={iconColor} opacity="0.3" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="https://static.vecteezy.com/system/resources/thumbnails/052/971/651/small/man-figure-with-bent-arms-raised-silhouette-icon-stick-figure-with-arms-raised-at-head-human-body-gesture-pose-glyph-symbol-isolated-illustration-vector.jpg">
          <path d="M32 8C32 8 22 8 20 22C18 36 26 38 26 38L26 50H22C21 50 20 51 20 52V54C20 55 21 56 22 56H42C43 56 44 55 44 54V52C44 51 43 50 42 50H38V38C38 38 46 36 44 22C42 8 32 8 32 8Z" stroke={iconColor} strokeWidth="1.5" fill="none" />
        </svg>
      );
  }
}
