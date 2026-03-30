import type { Metadata } from 'next';
import MyGarden from '@/components/features/MyGarden';

export const metadata: Metadata = {
  title: 'My Garden — Rootwork',
  description: 'Your personal collection of saved medicinal plants.',
};

export default function GardenPage() {
  return <MyGarden />;
}
