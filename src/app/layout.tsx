import type { Metadata } from 'next';
import './globals.css';
import { GardenProvider } from '@/lib/garden-context';
import GardenBadge from '@/components/ui/GardenBadge';
import MobileMenu from '@/components/ui/MobileMenu';

export const metadata: Metadata = {
  title: 'Rootwork — Plant Medicine Reference',
  description: 'A free, beautiful reference for 100+ medicinal plants. Search by symptom, browse by family, learn preparation methods.',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        <GardenProvider>
          <header className="border-b border-border bg-cream/90 backdrop-blur-sm sticky top-0 z-50">
            <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
              <a href="/" className="text-xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
                Rootwork
              </a>
              <nav className="hidden md:flex gap-6 text-sm text-text-muted">
                <a href="/ask" className="hover:text-burnt transition-colors">Ask</a>
                <a href="/search" className="hover:text-burnt transition-colors">Search</a>
                <a href="/plants" className="hover:text-burnt transition-colors">All Plants</a>
                <a href="/families" className="hover:text-burnt transition-colors">Families</a>
                <a href="/uses" className="hover:text-burnt transition-colors">Uses</a>
                <a href="/preparations" className="hover:text-burnt transition-colors">Preparations</a>
                <a href="/explore" className="hover:text-burnt transition-colors">Explore</a>
                <GardenBadge />
              </nav>
              <MobileMenu />
            </div>
          </header>
          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-t border-border">
            <div className="flex justify-around py-2 text-xs text-text-muted">
              <a href="/" className="flex flex-col items-center gap-0.5 px-2 py-1 hover:text-burnt">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
                Home
              </a>
              <a href="/ask" className="flex flex-col items-center gap-0.5 px-2 py-1 hover:text-burnt">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Ask
              </a>
              <a href="/search" className="flex flex-col items-center gap-0.5 px-2 py-1 hover:text-burnt">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Search
              </a>
              <a href="/plants" className="flex flex-col items-center gap-0.5 px-2 py-1 hover:text-burnt">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Plants
              </a>
              <a href="/garden" className="flex flex-col items-center gap-0.5 px-2 py-1 hover:text-burnt">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                Garden
              </a>
            </div>
          </nav>
          <main className="flex-1 mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10">
            {children}
          </main>
          <footer className="border-t border-border bg-surface-muted">
            <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-text-muted">
              <p>Rootwork — A free plant medicine reference by <a href="https://spirittree.dev" className="text-burnt hover:underline">SpiritTree</a></p>
              <p className="mt-2 text-xs">For educational purposes only. Not medical advice. Always consult a healthcare provider.</p>
            </div>
          </footer>
        </GardenProvider>
      </body>
    </html>
  );
}
