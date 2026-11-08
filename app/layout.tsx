import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TextUtility — editor de texto em lote',
  description: 'Limpe, transforme, ordene e compare texto diretamente no navegador. Sem conta; o conteúdo fica no seu dispositivo.',
  applicationName: 'TextUtility',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
