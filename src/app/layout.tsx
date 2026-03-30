import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rootwork — Plant Medicine Reference',
  description: 'A free, beautiful reference for 100+ medicinal plants. Search by symptom, browse by family, learn preparation methods.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-border bg-cream/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
            <a href="/" className="text-xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
              Rootwork
            </a>
            <nav className="hidden md:flex gap-6 text-sm text-text-muted">
              <a href="/search" className="hover:text-burnt transition-colors">Search</a>
              <a href="/plants" className="hover:text-burnt transition-colors">All Plants</a>
              <a href="/families" className="hover:text-burnt transition-colors">Families</a>
              <a href="/uses" className="hover:text-burnt transition-colors">Uses</a>
              <a href="/preparations" className="hover:text-burnt transition-colors">Preparations</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
        <footer className="border-t border-border bg-surface-muted">
          <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-text-muted">
            <p>Rootwork — A free plant medicine reference by <a href="https://spirittree.dev" className="text-burnt hover:underline">SpiritTree</a></p>
            <p className="mt-2 text-xs">For educational purposes only. Not medical advice. Always consult a healthcare provider.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
