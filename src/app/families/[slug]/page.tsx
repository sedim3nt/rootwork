import { notFound } from 'next/navigation';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';
import { families, resolvePlantRefs } from '@/lib/data';

export function generateStaticParams() {
  return families.map((f) => ({ slug: f.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const family = families.find((f) => f.slug === slug);
    if (!family) return { title: 'Family Not Found' };
    return {
      title: `${family.name} — Rootwork`,
      description: `${family.commonName}: ${family.characteristics['Key Features']}`,
    };
  });
}

export default async function FamilyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const family = families.find((f) => f.slug === slug);
  if (!family) notFound();

  const familyPlants = resolvePlantRefs(family.plantRefs);
  const chars = Object.entries(family.characteristics);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          {family.name.replace(' Family', '')}
        </h1>
        <p className="text-lg text-text-muted mt-1">{family.commonName}</p>
      </header>

      {/* Characteristics */}
      {chars.length > 0 && (
        <section className="space-y-4">
          {chars.map(([key, value]) => (
            <div key={key} className="bg-surface border border-border rounded-[var(--radius-card)] p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">{key}</h3>
              <p className="text-sm text-parchment">{value}</p>
            </div>
          ))}
        </section>
      )}

      {/* Plants in this family */}
      <section>
        <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Plants in this Family
        </h2>
        {familyPlants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyPlants.map((p) => (
              <PlantCard key={p.slug} slug={p.slug} name={p.name} latinName={p.latinName} family={p.family} uses={p.traditionalUses} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No plants linked to this family yet.</p>
        )}
      </section>

      <Disclaimer />
    </div>
  );
}
