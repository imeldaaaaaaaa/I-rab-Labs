import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Irab Lab — Bedah I‘rab Interaktif",
  description: 'Belajar Nahwu dengan latihan bertahap, visual interaktif, dan progres belajar.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}

