'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface GardenEntry {
  slug: string;
  note?: string;
}

interface GardenContextType {
  saved: GardenEntry[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  setNote: (slug: string, note: string) => void;
  getNote: (slug: string) => string;
  count: number;
}

const GardenContext = createContext<GardenContextType | null>(null);

const STORAGE_KEY = 'rootwork-garden';

function loadGarden(): GardenEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGarden(entries: GardenEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* quota exceeded — silently fail */ }
}

export function GardenProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<GardenEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSaved(loadGarden());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveGarden(saved);
  }, [saved, loaded]);

  const isSaved = useCallback((slug: string) => saved.some((e) => e.slug === slug), [saved]);

  const toggle = useCallback((slug: string) => {
    setSaved((prev) =>
      prev.some((e) => e.slug === slug)
        ? prev.filter((e) => e.slug !== slug)
        : [...prev, { slug }]
    );
  }, []);

  const setNote = useCallback((slug: string, note: string) => {
    setSaved((prev) =>
      prev.map((e) => (e.slug === slug ? { ...e, note } : e))
    );
  }, []);

  const getNote = useCallback((slug: string) => {
    return saved.find((e) => e.slug === slug)?.note ?? '';
  }, [saved]);

  return (
    <GardenContext.Provider value={{ saved, isSaved, toggle, setNote, getNote, count: saved.length }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error('useGarden must be used within GardenProvider');
  return ctx;
}
