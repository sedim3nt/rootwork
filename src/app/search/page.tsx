'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import plants from '@/data/plants.json';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';

const fuse = new Fuse(plants, {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'latinName', weight: 1.5 },
    { name: 'family', weight: 1 },
    { name: 'traditionalUses', weight: 1 },
    { name: 'modernUses', weight: 1 },
    { name: 'compounds', weight: 0.8 },
  ],
  threshold: 0.4,
  includeScore: true,
});

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<typeof plants>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const res = fuse.search(query).map((r) => r.item);
    setResults(res);
  }, [query]);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-parchment mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Search Plants
        </h1>
        <div className="relative max-w-2xl">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, symptom, compound, or use…"
            autoFocus
            className="w-full bg-surface border border-border rounded-[var(--radius-card)] pl-11 pr-4 py-3 text-text placeholder:text-text-muted/60 focus:outline-none focus:border-burnt focus:ring-1 focus:ring-burnt/30 transition-colors"
          />
        </div>
      </div>

      {query.trim().length >= 2 && (
        <p className="text-sm text-text-muted">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((plant) => (
          <PlantCard
            key={plant.slug}
            slug={plant.slug}
            name={plant.name}
            latinName={plant.latinName}
            family={plant.family}
            uses={plant.traditionalUses}
          />
        ))}
      </div>

      {query.trim().length >= 2 && results.length === 0 && (
        <p className="text-center text-text-muted py-12">No plants found matching your search. Try a different term.</p>
      )}

      <Disclaimer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-text-muted py-12 text-center">Loading search…</div>}>
      <SearchContent />
    </Suspense>
  );
}
