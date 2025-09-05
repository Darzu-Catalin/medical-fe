import { paths } from '@/routes/paths';
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect(paths.dashboard.root)
}
