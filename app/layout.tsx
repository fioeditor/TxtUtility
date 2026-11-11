import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'TextUtility — batch text editor',
  description: 'Clean, transform, sort and compare text right in your browser. No account needed; your text stays on your device.',
  applicationName: 'TextUtility',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('textutility.theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`}</Script>
        {children}
      </body>
    </html>
  );
}
