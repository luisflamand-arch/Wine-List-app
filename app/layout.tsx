import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { Providers } from '@/components/providers'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })

export const dynamic = "force-dynamic";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: 'La Vinoteca - Carta de Vinos',
  description: 'Descubre nuestra selección curada de vinos de todo el mundo',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: {
    title: 'La Vinoteca - Carta de Vinos',
    description: 'Descubre nuestra selección curada de vinos de todo el mundo',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <ChunkLoadErrorHandler />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
