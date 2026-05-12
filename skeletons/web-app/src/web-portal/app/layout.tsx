import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: '{{PROJECT_TITLE}}',
  description: '{{PROJECT_DESCRIPTION}}',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
