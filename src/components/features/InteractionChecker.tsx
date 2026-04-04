'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import Link from 'next/link';
import plants from '@/data/plants.json';
import Disclaimer from '@/components/ui/Disclaimer';

type Plant = (typeof plants)[number];

const fuse = new Fuse(plants, {
  keys: ['name', 'latinName'],
  threshold: 0.3,
});

export default function InteractionChecker() {
  const [selected, setSelected] = useState<Plant[]>([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (search.length < 1) return [];
    return fuse.search(search).slice(0, 6).map((r) => r.item).filter((p) => !selected.some((s) => s.slug === p.slug));
  }, [search, selected]);

  function addPlant(plant: Plant) {
    setSelected((prev) => [...prev, plant]);
    setSearch('');
    setDropdownOpen(false);
  }

  function removePlant(slug: string) {
    setSelected((prev) => prev.filter((p) => p.slug !== slug));
  }

  const analysis = useMemo(() => {
    if (selected.length < 2) return null;

    const allContraindications = selected.map((p) => ({ name: p.name, items: p.contraindications }));
    const allInteractions = selected.map((p) => ({ name: p.name, items: p.drugInteractions }));
    const allSideEffects = selected.map((p) => ({ name: p.name, items: p.sideEffects }));

    // Find shared contraindications (keyword overlap)
    const sharedContra: string[] = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        for (const ci of selected[i].contraindications) {
          for (const cj of selected[j].contraindications) {
            const wordsI = ci.toLowerCase().split(/\s+/);
            const wordsJ = cj.toLowerCase().split(/\s+/);
            const shared = wordsI.filter((w) => w.length > 4 && wordsJ.includes(w));
            if (shared.length > 0) {
              sharedContra.push(`${selected[i].name} & ${selected[j].name}: both mention "${shared[0]}" in contraindications`);
            }
          }
        }
      }
    }

    // Find overlapping effect categories
    const effectKeywords = ['sedat', 'blood pressure', 'blood thin', 'anticoagul', 'diuretic', 'hypoglycemi', 'estrogen', 'liver', 'kidney', 'immuno'];
    const overlapping: string[] = [];
    for (const keyword of effectKeywords) {
      const matching = selected.filter((p) => {
        const all = [...p.drugInteractions, ...p.sideEffects, ...p.contraindications].join(' ').toLowerCase();
        return all.includes(keyword);
      });
      if (matching.length >= 2) {
        overlapping.push(`${matching.map((m) => m.name).join(', ')} — shared concern: "${keyword}" effects`);
      }
    }

    return { allContraindications, allInteractions, allSideEffects, sharedContra, overlapping };
  }, [selected]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          Interaction Checker
        </h1>
        <p className="text-text-muted mt-1">
          Select two or more plants to check for known interactions and shared cautions.
        </p>
      </div>

      {/* Plant selector */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
          onFocus={() => search.length >= 1 && setDropdownOpen(true)}
          placeholder="Search for a plant to add…"
          className="w-full bg-surface border border-border rounded-[var(--radius-card)] px-4 py-3 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-burnt focus:ring-1 focus:ring-burnt/30 transition-colors"
        />
        {dropdownOpen && searchResults.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-surface border border-border rounded-[var(--radius-card)] shadow-lg overflow-hidden">
            {searchResults.map((plant) => (
              <button
                key={plant.slug}
                onClick={() => addPlant(plant)}
                className="w-full text-left px-4 py-2.5 hover:bg-cream-dark/20 transition-colors"
              >
                <span className="font-medium text-parchment">{plant.name}</span>
                <span className="text-xs italic text-text-muted ml-2">{plant.latinName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected plants */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((p) => (
            <span key={p.slug} className="inline-flex items-center gap-1.5 bg-burnt/10 text-burnt text-sm px-3 py-1.5 rounded-[4px]">
              <Link href={`/plants/${p.slug}`} className="hover:underline">{p.name}</Link>
              <button onClick={() => removePlant(p.slug)} className="hover:text-safety transition-colors">&times;</button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {selected.length >= 2 && analysis && (
        <div className="space-y-6">
          {/* Shared concerns */}
          {(analysis.sharedContra.length > 0 || analysis.overlapping.length > 0) && (
            <div className="bg-safety-bg border border-safety/20 rounded-[var(--radius-card)] p-5">
              <h2 className="text-lg font-semibold text-safety mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Shared Cautions Found
              </h2>
              <ul className="space-y-2">
                {analysis.sharedContra.map((item, i) => (
                  <li key={i} className="text-sm text-parchment pl-4 relative before:content-['⚠'] before:absolute before:left-0">{item}</li>
                ))}
                {analysis.overlapping.map((item, i) => (
                  <li key={`o-${i}`} className="text-sm text-parchment pl-4 relative before:content-['⚠'] before:absolute before:left-0">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.sharedContra.length === 0 && analysis.overlapping.length === 0 && (
            <div className="bg-safe-bg border border-safe/20 rounded-[var(--radius-card)] p-5">
              <h2 className="text-lg font-semibold text-safe mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                No Known Interactions Found
              </h2>
              <p className="text-sm text-parchment">
                No known interactions found in our database. This doesn&apos;t mean none exist — always consult a professional.
              </p>
            </div>
          )}

          {/* Individual plant details */}
          {analysis.allContraindications.map((entry) => (
            <div key={entry.name} className="bg-surface border border-border rounded-[var(--radius-card)] p-5">
              <h3 className="font-semibold text-parchment mb-3" style={{ fontFamily: 'var(--font-display)' }}>{entry.name}</h3>
              {entry.items.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-safety uppercase tracking-wide mb-1">Contraindications</h4>
                  <ul className="space-y-1">
                    {entry.items.map((item, i) => <li key={i} className="text-sm text-parchment pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-safety">{item}</li>)}
                  </ul>
                </div>
              )}
              {analysis.allInteractions.find((a) => a.name === entry.name)?.items.length! > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-safety uppercase tracking-wide mb-1">Drug Interactions</h4>
                  <ul className="space-y-1">
                    {analysis.allInteractions.find((a) => a.name === entry.name)?.items.map((item, i) => (
                      <li key={i} className="text-sm text-parchment pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-safety">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected.length === 1 && (
        <p className="text-sm text-text-muted">Add at least one more plant to check interactions.</p>
      )}

      <div className="bg-caution-bg border border-caution/20 rounded-[var(--radius-card)] p-4 text-sm text-sienna">
        <strong>Important:</strong> This is not medical advice. Always consult a qualified healthcare provider before combining herbal remedies, especially if you take medications.
      </div>

      <Disclaimer />
    </div>
  );
}
