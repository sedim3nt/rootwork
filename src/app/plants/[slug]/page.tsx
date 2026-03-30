import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import SafetyCard from '@/components/ui/SafetyCard';
import PlantCard from '@/components/ui/PlantCard';
import Disclaimer from '@/components/ui/Disclaimer';
import SaveButton from '@/components/ui/SaveButton';
import { plants, getRelatedPlants } from '@/lib/data';
import plantImages from '@/data/plant-images.json';

export function generateStaticParams() {
  return plants.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const plant = plants.find((p) => p.slug === slug);
    if (!plant) return { title: 'Plant Not Found' };
    return {
      title: `${plant.name} — Rootwork`,
      description: `${plant.name} (${plant.latinName}): traditional uses, preparations, safety, and modern applications.`,
    };
  });
}

export default async function PlantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plant = plants.find((p) => p.slug === slug);
  if (!plant) notFound();

  const related = getRelatedPlants(plant);
  const descriptionEntries = Object.entries(plant.description);

  const familySlug = plant.family.toLowerCase().replace(/\s+/g, '-') + '-family';
  const imagePath = (plantImages as Record<string, string>)[plant.slug];

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${plant.name} (${plant.latinName})`,
    description: `${plant.name}: traditional uses, preparations, safety, and modern applications in plant medicine.`,
    about: {
      '@type': 'Thing',
      name: plant.latinName,
      alternateName: plant.name,
    },
    mainEntity: {
      '@type': 'MedicalWebPage',
      name: plant.name,
      about: plant.latinName,
      lastReviewed: new Date().toISOString().split('T')[0],
    },
  };

  const hasCompounds = plant.compounds.length > 0;
  const hasTraditionalUses = plant.traditionalUses.length > 0;
  const hasModernUses = plant.modernUses.length > 0;

  const rightColumnContent = (
    <>
      {hasCompounds && (
        <div>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Active Compounds
          </h2>
          <div className="flex flex-wrap gap-2">
            {plant.compounds.map((c) => (
              <Badge key={c} variant="burnt">{c}</Badge>
            ))}
          </div>
        </div>
      )}

      {hasTraditionalUses && (
        <div>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Traditional Uses
          </h2>
          <ul className="space-y-2">
            {plant.traditionalUses.map((use, i) => (
              <li key={i} className="text-sm text-parchment pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-burnt">{use}</li>
            ))}
          </ul>
        </div>
      )}

      {hasModernUses && (
        <div>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Modern Applications
          </h2>
          <ul className="space-y-2">
            {plant.modernUses.map((use, i) => (
              <li key={i} className="text-sm text-parchment pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-burnt">{use}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
            {plant.name}
          </h1>
          <p className="text-lg italic text-text-muted mt-1">{plant.latinName}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="burnt" href={`/families/${familySlug}`}>{plant.family}</Badge>
            {plant.nativeRange && <Badge>{plant.nativeRange}</Badge>}
          </div>
        </div>
        <SaveButton slug={plant.slug} size="md" />
      </header>

      {/* Description */}
      {descriptionEntries.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Description
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {descriptionEntries.map(([key, value]) => (
              <div key={key} className="bg-surface border border-border rounded-[var(--radius-card)] p-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 capitalize">{key}</h3>
                <p className="text-sm text-parchment">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Botanical Image + Compounds/Uses (2-column if image exists) */}
      {imagePath ? (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Image
              src={imagePath}
              alt={`Botanical illustration of ${plant.name} (${plant.latinName})`}
              width={570}
              height={760}
              className="w-full h-auto rounded-[var(--radius-card)]"
            />
          </div>
          <div className="space-y-8">
            {rightColumnContent}
          </div>
        </section>
      ) : (
        <section className="space-y-10">
          {rightColumnContent}
        </section>
      )}

      {/* Safety */}
      <SafetyCard
        contraindications={plant.contraindications}
        sideEffects={plant.sideEffects}
        drugInteractions={plant.drugInteractions}
        partsUsed={plant.partsUsed}
      />

      {/* Preparations */}
      {plant.preparations.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Preparation Methods
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {plant.preparations.map((prep, i) => (
              <div key={i} className="bg-surface border border-border rounded-[var(--radius-card)] p-4">
                <p className="text-sm text-parchment">{prep}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Plants */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-parchment mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Related Plants
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((p) => (
              <PlantCard key={p.slug} slug={p.slug} name={p.name} latinName={p.latinName} family={p.family} uses={p.traditionalUses} />
            ))}
          </div>
        </section>
      )}

      <Disclaimer />
    </div>
  );
}
