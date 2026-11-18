import type { Metadata } from 'next';
import './globals.css';
import './creative-sky.css';

export const metadata: Metadata = {
  title: "I‘rab Labs — Ruang Belajar Nahwu",
  description: 'Ruang belajar Nahwu dan I‘rab dengan materi terstruktur, analisis kalimat, dan latihan bertahap.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}

