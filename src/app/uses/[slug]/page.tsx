import { notFound } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';
import { categories, plants, type Plant } from '@/lib/data';

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const category = categories.find((c) => c.slug === slug);
    if (!category) return { title: 'Category Not Found' };
    return {
      title: `${category.name} — Rootwork`,
      description: `Medicinal plants for ${category.name.toLowerCase()}: ${category.plants.slice(0, 3).map((p: {name:string}) => p.name).join(', ')}`,
    };
  });
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const categoryPlants = category.plants.map((ref: {slug: string}) => plants.find((p) => p.slug === ref.slug)).filter(Boolean) as Plant[];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          {category.name}
        </h1>
      </header>

      {/* Uses */}
      {category.plants.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Applications
          </h2>
          <div className="flex flex-wrap gap-2">
            {category.plants.map((use: {slug:string,name:string}) => (
              <Badge key={use.slug} variant="burnt">{use.name}</Badge>
            ))}
          </div>
        </section>
      )}

      {/* Plants in this category */}
      <section>
        <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Plants
        </h2>
        {categoryPlants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryPlants.map((p) => (
              <PlantCard key={p.slug} slug={p.slug} name={p.name} latinName={p.latinName} family={p.family} uses={p.traditionalUses} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No plants linked to this category yet.</p>
        )}
      </section>

      <Disclaimer />
    </div>
  );
}
