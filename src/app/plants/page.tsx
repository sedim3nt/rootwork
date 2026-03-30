'use client';

import { useState, useMemo } from 'react';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';
import plants from '@/data/plants.json';

const allFamilies = [...new Set(plants.map((p) => p.family))].sort();

export default function PlantsPage() {
  const [familyFilter, setFamilyFilter] = useState('');
  const [sort, setSort] = useState<'alpha' | 'family'>('alpha');

  const filtered = useMemo(() => {
    let list = familyFilter ? plants.filter((p) => p.family === familyFilter) : [...plants];
    if (sort === 'alpha') list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));
    return list;
  }, [familyFilter, sort]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          All Plants
        </h1>
        <p className="text-text-muted mt-1">{plants.length} medicinal plants</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={familyFilter}
          onChange={(e) => setFamilyFilter(e.target.value)}
          className="bg-surface border border-border rounded-[var(--radius-card)] px-3 py-2 text-sm text-text focus:outline-none focus:border-burnt"
        >
          <option value="">All families</option>
          {allFamilies.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'alpha' | 'family')}
          className="bg-surface border border-border rounded-[var(--radius-card)] px-3 py-2 text-sm text-text focus:outline-none focus:border-burnt"
        >
          <option value="alpha">Alphabetical</option>
          <option value="family">By Family</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plant) => (
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

      <Disclaimer />
    </div>
  );
}
