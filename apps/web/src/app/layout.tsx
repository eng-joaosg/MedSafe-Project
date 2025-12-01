import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-primary-500 min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="pt-30 text-center w-full grow">
            <Logo />
            <p className="pt-4">Suas informações de emergência sempre à mão.</p>
            <div className="mx-auto w-full max-w-3xl">{children}</div>
          </main>
          <div className="w-full flex justify-center">
            <p className="text-xs text-center max-w-2xl md:text-sm mt-18 md:mt-4">
              Mantenha seus dados médicos e contatos de emergência atualizados e acessíveis em qualquer situação.
              Gere um QR code seguro e facilite o atendimento rápido quando necessário.
            </p>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
