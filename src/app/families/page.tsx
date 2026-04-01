import Link from 'next/link';
import { families, getPlantsByFamily } from '@/lib/data';
import Disclaimer from '@/components/ui/Disclaimer';

export const metadata = {
  title: 'Plant Families — Rootwork',
  description: 'Browse medicinal plants by botanical family.',
};

export default function FamiliesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          Plant Families
        </h1>
        <p className="text-text-muted mt-1">{families.length} botanical families</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {families.map((fam) => {
          const plantCount = fam.plants.length;
          return (
            <Link
              key={fam.slug}
              href={`/families/${fam.slug}`}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-5 hover:border-burnt/40 hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {fam.name.replace(' Family', '')}
              </h3>
              <p className="text-sm text-text-muted mt-0.5">{fam.latin}</p>
              <p className="text-xs text-burnt mt-2">{plantCount} plant{plantCount !== 1 ? 's' : ''}</p>
            </Link>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}
