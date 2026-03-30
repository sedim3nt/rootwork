'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import plants from '@/data/plants.json';

interface PlantResult {
  slug: string;
  name: string;
  latinName: string;
  family: string;
}

const fuse = new Fuse(plants, {
  keys: ['name', 'latinName', 'family', 'traditionalUses', 'modernUses', 'compounds'],
  threshold: 0.35,
  includeScore: true,
});

interface SearchBarProps {
  large?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({ large, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlantResult[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    setSelectedIndex(-1);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const res = fuse.search(value).slice(0, 8).map((r) => ({
      slug: r.item.slug,
      name: r.item.name,
      latinName: r.item.latinName,
      family: r.item.family,
    }));
    setResults(res);
    setOpen(res.length > 0);
  }

  function navigate(slug: string) {
    setOpen(false);
    setQuery('');
    router.push(`/plants/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter' && query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) navigate(results[selectedIndex].slug);
      else router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search plants by name, symptom, or use…"
          autoFocus={autoFocus}
          className={`w-full bg-surface border border-border rounded-[var(--radius-card)] pl-11 pr-4 text-text placeholder:text-text-muted/60 focus:outline-none focus:border-burnt focus:ring-1 focus:ring-burnt/30 transition-colors ${large ? 'py-4 text-lg' : 'py-2.5 text-sm'}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-2 w-full bg-surface border border-border rounded-[var(--radius-card)] shadow-lg overflow-hidden">
          {results.map((plant, i) => (
            <button
              key={plant.slug}
              onClick={() => navigate(plant.slug)}
              className={`w-full text-left px-4 py-3 flex items-baseline gap-2 transition-colors ${i === selectedIndex ? 'bg-cream-dark/40' : 'hover:bg-cream-dark/20'}`}
            >
              <span className="font-medium text-parchment">{plant.name}</span>
              <span className="text-sm italic text-text-muted">{plant.latinName}</span>
              <span className="ml-auto text-xs text-burnt">{plant.family}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
