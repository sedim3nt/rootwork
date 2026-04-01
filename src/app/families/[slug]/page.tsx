import { notFound } from 'next/navigation';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';
import { families, plants } from '@/lib/data';

export function generateStaticParams() {
  return families.map((f) => ({ slug: f.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const family = families.find((f) => f.slug === slug);
    if (!family) return { title: 'Family Not Found' };
    return {
      title: `${family.name} — Rootwork`,
      description: `Explore ${family.plants.length} medicinal plants in the ${family.name} family (${family.latin}).`,
    };
  });
}

export default async function FamilyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const family = families.find((f) => f.slug === slug);
  if (!family) notFound();

  const familyPlants = family.plants
    .map((ref) => plants.find((p) => p.slug === ref.slug))
    .filter((p): p is typeof plants[0] => p != null);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          {family.name}
        </h1>
        {family.latin && (
          <p className="text-lg text-text-muted mt-1 italic">{family.latin}</p>
        )}
        <p className="text-sm text-text-muted mt-2">
          {family.plants.length} medicinal plant{family.plants.length !== 1 ? 's' : ''} in this family
        </p>
      </header>

      {/* Plants in this family */}
      <section>
        <h2 className="text-2xl font-bold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Plants
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyPlants.map((plant) => (
            <PlantCard
              key={plant.slug}
              slug={plant.slug}
              name={plant.name}
              latinName={plant.latinName}
              family={plant.family}
              uses={plant.traditionalUses?.slice(0, 3) || []}
            />
          ))}
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
