import type { ReactNode } from 'react';

export const metadata = {
  title: '{{PROJECT_TITLE}}',
  description: '{{PROJECT_DESCRIPTION}}',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
