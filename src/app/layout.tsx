import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://helgolandbahn.de"),
  title: "Inselbahn Helgoland — Rundfahrten & Touren",
  description:
    "Entdecken Sie Helgoland mit der Inselbahn! Unterland-Tour (45 Min) und exklusive Premium-Tour (90 Min) mit Ausstieg an der Langen Anna. Tickets online buchen.",
  keywords: [
    "Helgoland",
    "Inselbahn",
    "Rundfahrt",
    "Tour",
    "Lange Anna",
    "Helgoland Tour",
    "Inselbahn Helgoland",
    "Helgoland Sehenswürdigkeiten",
    "Helgoland Ausflug",
  ],
  openGraph: {
    title: "Inselbahn Helgoland — Rundfahrten & Touren",
    description:
      "Entdecken Sie Helgoland mit der Inselbahn! Unterland-Tour und exklusive Premium-Tour mit Ausstieg an der Langen Anna.",
    url: "https://helgolandbahn.de",
    siteName: "Inselbahn Helgoland",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/images/inselbahn-hero.png",
        width: 1200,
        height: 630,
        alt: "Inselbahn Helgoland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inselbahn Helgoland — Rundfahrten & Touren",
    description:
      "Entdecken Sie Helgoland mit der Inselbahn! Unterland-Tour und exklusive Premium-Tour.",
    images: ["/images/inselbahn-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Inselbahn Helgoland",
  description:
    "Geführte Inselrundfahrten auf Helgoland mit der Inselbahn. Unterland-Tour und Premium-Tour mit Ausstieg an der Langen Anna.",
  url: "https://helgolandbahn.de",
  telephone: "+491604170905",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Am Falm",
    addressLocality: "Helgoland",
    postalCode: "27498",
    addressCountry: "DE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 54.1785,
    longitude: 7.8884,
  },
  openingHours: "Mo-Su 11:00-16:00",
  priceRange: "6\u20AC - 22\u20AC",
  image: "https://helgolandbahn.de/images/inselbahn-hero.png",
  sameAs: [
    "https://www.tripadvisor.de/Attraction_Review-g187410-d27144771-Reviews-Inselbahn_Helgoland-Helgoland_Schleswig_Holstein.html",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-montserrat)]">
        {children}
        <Script
          defer
          data-domain="helgolandbahn.de"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
