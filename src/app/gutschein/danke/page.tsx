import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gutschein gekauft - Inselbahn Helgoland',
  description: 'Vielen Dank für Ihren Gutscheinkauf bei der Inselbahn Helgoland.',
};

export default function GutscheinDankePage() {
  return (
    <>
      <Header />
    <main className="min-h-screen bg-white px-5 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
          Vielen Dank!
        </h1>
        <p className="text-lg text-dark/60 leading-relaxed mb-8">
          Ihr Geschenkgutschein wurde erfolgreich gekauft.
          <br />
          Sie erhalten den Gutscheincode und alle Details in K&uuml;rze per E-Mail.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zur&uuml;ck zur Startseite
        </Link>
      </div>
    </main>
      <Footer />
    </>
  );
}
