'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGarden } from '@/lib/garden-context';
import plants from '@/data/plants.json';
import PlantCard from '@/components/ui/PlantCard';
import SaveButton from '@/components/ui/SaveButton';
import Disclaimer from '@/components/ui/Disclaimer';

export default function MyGarden() {
  const { saved, setNote, getNote } = useGarden();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const gardenPlants = saved
    .map((entry) => plants.find((p) => p.slug === entry.slug))
    .filter((p): p is (typeof plants)[number] => p != null);

  function startEditing(slug: string) {
    setEditingSlug(slug);
    setNoteText(getNote(slug));
  }

  function saveNote(slug: string) {
    setNote(slug, noteText);
    setEditingSlug(null);
  }

  function generateShareUrl() {
    const slugs = saved.map((e) => e.slug).join(',');
    const encoded = btoa(slugs);
    const url = `${window.location.origin}/garden?share=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  }

  if (gardenPlants.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🌱</div>
        <h2 className="text-2xl font-semibold text-parchment mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Your garden is empty
        </h2>
        <p className="text-text-muted max-w-md mx-auto mb-6">
          Browse plants and save the ones that speak to you. Tap the heart icon on any plant to add it here.
        </p>
        <Link
          href="/plants"
          className="inline-block bg-burnt text-cream px-6 py-3 rounded-[var(--radius-card)] text-sm font-medium hover:bg-burnt/90 transition-colors"
        >
          Browse Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
            My Garden
          </h1>
          <p className="text-text-muted mt-1">{gardenPlants.length} plant{gardenPlants.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button
          onClick={generateShareUrl}
          className="text-sm bg-surface border border-border rounded-[var(--radius-card)] px-4 py-2 text-text-muted hover:border-burnt/40 hover:text-burnt transition-colors"
        >
          Share Garden
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gardenPlants.map((plant) => (
          <div key={plant.slug} className="relative">
            <div className="absolute top-3 right-3 z-10">
              <SaveButton slug={plant.slug} />
            </div>
            <PlantCard
              slug={plant.slug}
              name={plant.name}
              latinName={plant.latinName}
              family={plant.family}
              uses={plant.traditionalUses}
            />
            <div className="mt-1 px-1">
              {editingSlug === plant.slug ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Why I saved this…"
                    className="flex-1 text-xs bg-surface border border-border rounded px-2 py-1 text-text placeholder:text-text-muted/60 focus:outline-none focus:border-burnt"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveNote(plant.slug)}
                  />
                  <button onClick={() => saveNote(plant.slug)} className="text-xs text-burnt hover:underline">Save</button>
                </div>
              ) : (
                <button
                  onClick={() => startEditing(plant.slug)}
                  className="text-xs text-text-muted hover:text-burnt transition-colors"
                >
                  {getNote(plant.slug) || '+ Add a note'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
