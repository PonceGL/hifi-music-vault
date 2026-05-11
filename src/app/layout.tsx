import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Music Files Manager',
  description: 'Local music library management for audiophiles and collectors.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
      data-theme="dark"
    >
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-text-primary">
        {children}
      </body>
    </html>
  );
}
