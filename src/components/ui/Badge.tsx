import Link from 'next/link';

type BadgeVariant = 'default' | 'burnt' | 'safety';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  href?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-cream-dark/60 text-sienna',
  burnt: 'bg-burnt/10 text-burnt',
  safety: 'bg-safety-bg text-safety',
};

export default function Badge({ children, variant = 'default', href }: BadgeProps) {
  const classes = `inline-block text-xs font-medium px-2.5 py-1 rounded-full ${variantClasses[variant]}`;

  if (href) {
    return <Link href={href} className={`${classes} hover:opacity-80 transition-opacity`}>{children}</Link>;
  }

  return <span className={classes}>{children}</span>;
}
