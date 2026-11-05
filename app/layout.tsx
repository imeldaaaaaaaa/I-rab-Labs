import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "I‘rab Labs — Petualangan Nahwu Interaktif",
  description: 'Petualangan belajar Nahwu dan I‘rab dengan peta materi, tantangan bertahap, dan maskot burung hantu.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}

