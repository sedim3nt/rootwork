import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';
import { plants, categories, families } from '@/lib/data';

// Pick 6 deterministic "featured" plants spread across the list
const featured = [0, 15, 30, 50, 70, 90].map((i) => plants[i % plants.length]);

// Filter to categories that have plants
const browseCategories = categories.filter((c) => c.plants.length > 0);
const browseFamilies = families.slice(0, 12);

// Plant of the Day — deterministic based on day of year
function getPlantOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return plants[dayOfYear % plants.length];
}

const plantOfTheDay = getPlantOfTheDay();

// Quick symptom shortcuts
const quickSymptoms = browseCategories.slice(0, 3);

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

      {/* Plant of the Day */}
      <section>
        <h2 className="text-2xl font-semibold text-parchment mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Plant of the Day
        </h2>
        <Link
          href={`/plants/${plantOfTheDay.slug}`}
          className="block bg-surface border-2 border-burnt/30 rounded-[var(--radius-card)] p-6 hover:border-burnt/60 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {plantOfTheDay.name}
              </h3>
              <p className="text-sm italic text-text-muted mt-0.5">{plantOfTheDay.latinName}</p>
            </div>
            <span className="text-3xl">🌿</span>
          </div>
          <p className="mt-3 text-sm text-parchment">
            <span className="font-medium text-burnt">Did you know?</span>{' '}
            {plantOfTheDay.traditionalUses[0]}
          </p>
        </Link>
      </section>

      {/* Ask the Garden CTA */}
      <section>
        <Link
          href="/ask"
          className="block bg-sienna text-cream rounded-[var(--radius-card)] p-8 hover:bg-sienna/90 transition-colors group text-center"
        >
          <div className="text-3xl mb-2">🌿</div>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Ask the Garden
          </h2>
          <p className="text-cream/80 max-w-md mx-auto">
            Ask natural language questions about plant medicine. &quot;What helps with anxiety?&quot; &quot;Tell me about adaptogens.&quot;
          </p>
        </Link>
      </section>

      {/* What's Wrong? Quick Links */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
            What&apos;s Wrong?
          </h2>
          <Link href="/symptoms" className="text-sm text-burnt hover:underline">All symptoms →</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickSymptoms.map((cat) => (
            <Link
              key={cat.slug}
              href="/symptoms"
              className="bg-surface border border-border rounded-[var(--radius-card)] p-4 text-center hover:border-burnt/40 hover:shadow-sm transition-all group"
            >
              <h3 className="font-medium text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {cat.name}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {cat.plants.length} plants
              </p>
            </Link>
          ))}
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
                {cat.plants.length} plants
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
              <p className="text-xs text-text-muted mt-0.5">{fam.latin}</p>
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
