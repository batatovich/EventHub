import { redirect } from 'next/navigation';

export default function RootPage() {
  console.log('RootPage redirect triggered');
  redirect('/en');
}