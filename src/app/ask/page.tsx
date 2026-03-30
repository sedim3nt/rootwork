import type { Metadata } from 'next';
import AskGarden from '@/components/features/AskGarden';

export const metadata: Metadata = {
  title: 'Ask the Garden — Rootwork',
  description: 'Ask natural language questions about medicinal plants and get grounded answers from our database of 100 plants.',
};

export default function AskPage() {
  return <AskGarden />;
}
