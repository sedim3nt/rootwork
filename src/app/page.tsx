import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';
import { plants, categories, families } from '@/lib/data';

// Pick 6 deterministic "featured" plants spread across the list
const featured = [0, 15, 30, 50, 70, 90].map((i) => plants[i % plants.length]);

// Filter to categories that have uses and plantRefs
const browseCategories = categories.filter((c) => c.uses.length > 0 && c.plantRefs.length > 0);
const browseFamilies = families.slice(0, 12);

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-8 pb-4">
        <h1 className="text-5xl sm:text-6xl font-bold text-parchment tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Rootwork
        </h1>
        <p className="mt-4 text-lg text-text-muted max-w-xl mx-auto">
          100 medicinal plants. Traditional knowledge meets modern safety science.
        </p>
        <div className="mt-8 max-w-lg mx-auto">
          <SearchBar large />
        </div>
      </section>

      {/* Browse by Symptom */}
      <section>
        <h2 className="text-2xl font-semibold text-parchment mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          By Symptom
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {browseCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/uses/${cat.slug}`}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-4 hover:border-burnt/40 hover:shadow-sm transition-all group"
            >
              <h3 className="font-medium text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {cat.name}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {cat.plantRefs.filter((r) => !r.startsWith('00-')).length} plants
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/uses" className="text-sm text-burnt hover:underline">View all categories →</Link>
        </div>
      </section>

      {/* Browse by Family */}
      <section>
        <h2 className="text-2xl font-semibold text-parchment mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          By Family
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {browseFamilies.map((fam) => (
            <Link
              key={fam.slug}
              href={`/families/${fam.slug}`}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-4 hover:border-burnt/40 hover:shadow-sm transition-all group"
            >
              <h3 className="font-medium text-parchment group-hover:text-burnt transition-colors text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                {fam.name.replace(' Family', '')}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">{fam.commonName}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/families" className="text-sm text-burnt hover:underline">View all families →</Link>
        </div>
      </section>

      {/* Featured Plants */}
      <section>
        <h2 className="text-2xl font-semibold text-parchment mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Featured Plants
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((plant) => (
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
        <div className="mt-4">
          <Link href="/plants" className="text-sm text-burnt hover:underline">View all 100 plants →</Link>
        </div>
      </section>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
