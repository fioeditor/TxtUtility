import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TextUtility — batch text editor',
  description: 'Clean, transform, sort and compare text right in your browser. No account needed; your text stays on your device.',
  applicationName: 'TextUtility',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
