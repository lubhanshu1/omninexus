import type { Metadata } from 'next';
import './globals.css';
import FloatingNav from '../components/FloatingNav';

export const metadata: Metadata = {
  title: 'OmniNexus OS',
  description: 'Temporal Workforce Intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200 m-0 p-0">
        {children}
        <FloatingNav />
      </body>
    </html>
  );
}
