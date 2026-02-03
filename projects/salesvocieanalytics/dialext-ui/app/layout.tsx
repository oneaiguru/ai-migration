import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: 'Voice Analytics — UI Demo',
  description: 'Voice Analytics sales call analytics platform demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-slate-900">
        <header className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <h1 className="text-xl font-semibold">Voice Analytics — UI Demo</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
