import type { Metadata } from 'next';
import InteractionChecker from '@/components/features/InteractionChecker';

export const metadata: Metadata = {
  title: 'Interaction Checker — Rootwork',
  description: 'Check for known interactions and shared cautions between medicinal plants.',
};

export default function InteractionsPage() {
  return <InteractionChecker />;
}
