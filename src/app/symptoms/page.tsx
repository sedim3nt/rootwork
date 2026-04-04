'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import plants from '@/data/plants.json';
import categories from '@/data/categories.json';
import Badge from '@/components/ui/Badge';
import Disclaimer from '@/components/ui/Disclaimer';

type Plant = (typeof plants)[number];

const BODY_SYSTEMS = [
  { id: 'digestive', label: 'Digestive', icon: '🫄', categories: ['digestive-health'] },
  { id: 'respiratory', label: 'Respiratory', icon: '🫁', categories: ['respiratory-health'] },
  { id: 'nervous', label: 'Nervous System', icon: '🧠', categories: ['nervous-system-support', 'sleep-relaxation'] },
  { id: 'immune', label: 'Immune', icon: '🛡️', categories: ['immune-support'] },
  { id: 'circulatory', label: 'Circulatory', icon: '❤️', categories: ['circulatory-health'] },
  { id: 'skin', label: 'Skin & Wounds', icon: '🩹', categories: ['skin-wound-care'] },
  { id: 'womens', label: "Women's Health", icon: '♀️', categories: ['womens-health'] },
  { id: 'urinary', label: 'Urinary', icon: '💧', categories: ['urinary-health'] },
  { id: 'musculoskeletal', label: 'Musculoskeletal', icon: '💪', categories: ['pain-inflammation', 'bone-joint-health'] },
];

function resolvePlantRefs(refs: string[]): Plant[] {
  return refs
    .filter((ref) => !ref.startsWith('00-'))
    .map((ref) => {
      const prefix = ref + '.md';
      return plants.find((p) => p.sourceFile === prefix);
    })
    .filter((p): p is Plant => p != null);
}

export default function SymptomsPage() {
  const [step, setStep] = useState(1);
  const [selectedSystem, setSelectedSystem] = useState<typeof BODY_SYSTEMS[number] | null>(null);
  const [selectedUses, setSelectedUses] = useState<string[]>([]);

  const systemCategories = useMemo(() => {
    if (!selectedSystem) return [];
    return categories.filter((c) => selectedSystem.categories.some((sc) => c.slug === sc || c.slug.includes(sc.replace('-', ''))));
  }, [selectedSystem]);

  // If no exact category match, broaden to keyword matching
  const availableUses = useMemo(() => {
    if (!selectedSystem) return [];
    const matched = systemCategories.flatMap((c) => c.plants.map((p: {slug:string,name:string}) => p.name));
    if (matched.length > 0) return [...new Set(matched)];
    // Fallback: search all categories for keyword overlap
    const keywords = selectedSystem.label.toLowerCase().split(/\s+/);
    return categories
      .filter((c) => keywords.some((k) => c.name.toLowerCase().includes(k) || c.slug.includes(k)))
      .flatMap((c) => c.plants.map((p: {slug:string,name:string}) => p.name));
  }, [selectedSystem, systemCategories]);

  const matchingPlants = useMemo(() => {
    if (selectedUses.length === 0) return [];
    // Get plants from matching categories
    const catPlants = systemCategories.flatMap((c) => c.plants.map((ref: {slug: string}) => plants.find((p: any) => p.slug === ref.slug)).filter(Boolean));
    const uniqueSlugs = new Set<string>();
    const unique = catPlants.filter((p): p is NonNullable<typeof p> => p != null).filter((p) => {
      if (uniqueSlugs.has(p.slug)) return false;
      uniqueSlugs.add(p.slug);
      return true;
    });

    // Score by how many selected uses match the plant's uses
    const scored = unique.map((plant) => {
      const allUses = [...plant.traditionalUses, ...plant.modernUses].join(' ').toLowerCase();
      const score = selectedUses.filter((u) => allUses.includes(u.toLowerCase().split(' ')[0])).length;
      return { plant, score };
    });

    // Also search all plants for selected use keywords
    const additionalPlants = plants.filter((p) => {
      if (uniqueSlugs.has(p.slug)) return false;
      const allUses = [...p.traditionalUses, ...p.modernUses].join(' ').toLowerCase();
      return selectedUses.some((u) => allUses.includes(u.toLowerCase().split(' ')[0]));
    });

    const additionalScored = additionalPlants.map((plant) => {
      const allUses = [...plant.traditionalUses, ...plant.modernUses].join(' ').toLowerCase();
      const score = selectedUses.filter((u) => allUses.includes(u.toLowerCase().split(' ')[0])).length;
      return { plant, score };
    });

    return [...scored, ...additionalScored]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((s) => s.plant);
  }, [selectedUses, systemCategories]);

  function toggleUse(use: string) {
    setSelectedUses((prev) =>
      prev.includes(use) ? prev.filter((u) => u !== use) : [...prev, use]
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          What&apos;s Wrong?
        </h1>
        <p className="text-text-muted mt-1">Find plants by following your symptoms.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className={step >= 1 ? 'text-burnt font-medium' : ''}>Body System</span>
        <span>→</span>
        <span className={step >= 2 ? 'text-burnt font-medium' : ''}>Symptoms</span>
        <span>→</span>
        <span className={step >= 3 ? 'text-burnt font-medium' : ''}>Plants</span>
      </div>

      {/* Step 1: Body System */}
      {step === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BODY_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => { setSelectedSystem(sys); setStep(2); setSelectedUses([]); }}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-5 text-center hover:border-burnt/40 hover:shadow-sm transition-all group"
            >
              <div className="text-3xl mb-2">{sys.icon}</div>
              <h3 className="font-medium text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {sys.label}
              </h3>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Symptoms */}
      {step === 2 && selectedSystem && (
        <div>
          <button onClick={() => setStep(1)} className="text-sm text-burnt hover:underline mb-4">
            ← Back to body systems
          </button>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {selectedSystem.icon} {selectedSystem.label} — Select symptoms
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {availableUses.map((use) => (
              <button
                key={use}
                onClick={() => toggleUse(use)}
                className={`text-sm px-3 py-1.5 rounded-[4px] border transition-colors ${
                  selectedUses.includes(use)
                    ? 'bg-burnt text-cream border-burnt'
                    : 'bg-surface border-border text-text-muted hover:border-burnt/40'
                }`}
              >
                {use}
              </button>
            ))}
          </div>
          {selectedUses.length > 0 && (
            <button
              onClick={() => setStep(3)}
              className="bg-burnt text-cream px-6 py-3 rounded-[var(--radius-card)] text-sm font-medium hover:bg-burnt/90 transition-colors"
            >
              Find Plants ({selectedUses.length} symptom{selectedUses.length !== 1 ? 's' : ''} selected)
            </button>
          )}
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && selectedSystem && (
        <div>
          <button onClick={() => setStep(2)} className="text-sm text-burnt hover:underline mb-4">
            ← Back to symptoms
          </button>
          <h2 className="text-xl font-semibold text-parchment mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {matchingPlants.length} plant{matchingPlants.length !== 1 ? 's' : ''} found
          </h2>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {selectedUses.map((u) => <Badge key={u} variant="burnt">{u}</Badge>)}
          </div>

          {matchingPlants.length === 0 ? (
            <p className="text-text-muted">No plants found for your selected symptoms. Try selecting different symptoms.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingPlants.map((plant) => (
                <Link
                  key={plant.slug}
                  href={`/plants/${plant.slug}`}
                  className="block bg-surface border border-border rounded-[var(--radius-card)] p-5 hover:border-burnt/40 hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg font-semibold text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                    {plant.name}
                  </h3>
                  <p className="text-sm italic text-text-muted mt-0.5">{plant.latinName}</p>
                  <div className="mt-2">
                    <Badge variant="burnt">{plant.family}</Badge>
                  </div>
                  {/* Safety warning if has contraindications */}
                  {plant.contraindications.length > 0 && (
                    <div className="mt-3 text-xs text-safety bg-safety-bg rounded-[4px] px-2 py-1">
                      ⚠ {plant.contraindications.length} contraindication{plant.contraindications.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
