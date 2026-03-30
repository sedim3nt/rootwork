import Link from 'next/link';
import Badge from './Badge';

interface PlantCardProps {
  slug: string;
  name: string;
  latinName: string;
  family: string;
  uses: string[];
}

export default function PlantCard({ slug, name, latinName, family, uses }: PlantCardProps) {
  return (
    <Link
      href={`/plants/${slug}`}
      className="block bg-surface border border-border rounded-[var(--radius-card)] p-5 hover:border-burnt/40 hover:shadow-md transition-all group"
    >
      <h3 className="text-lg font-semibold text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
        {name}
      </h3>
      <p className="text-sm italic text-text-muted mt-0.5">{latinName}</p>
      <div className="mt-2">
        <Badge variant="burnt">{family}</Badge>
      </div>
      {uses.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {uses.slice(0, 3).map((use) => (
            <Badge key={use}>{use}</Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
