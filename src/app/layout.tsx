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
  metadataBase: new URL("https://www.helgolandbahn.de"),
  title: "Inselbahn Helgoland | Alle Highlights in kurzer Zeit",
  description:
    "Geführte Inselrundfahrten auf Helgoland. Unterland-Tour ab 11 EUR, Premium-Tour ab 22 EUR mit Halt an der Langen Anna. Online buchen!",
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
    "Helgoland Tagesausflug",
    "Lange Anna Helgoland",
    "Helgoland Aktivitäten",
    "Helgoland Rundfahrt buchen",
    "Bimmelbahn Helgoland",
    "Helgoland Bahn",
  ],
  alternates: {
    canonical: "https://www.helgolandbahn.de",
  },
  icons: {
    icon: [
      { url: "/images/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-large.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/images/favicon-large.png", sizes: "180x180" },
  },
  openGraph: {
    title: "Inselbahn Helgoland | Rundfahrten & Touren",
    description:
      "Geführte Inselrundfahrten auf Helgoland. Unterland-Tour und Premium-Tour mit Halt an der Langen Anna. Online buchen!",
    url: "https://www.helgolandbahn.de",
    siteName: "Inselbahn Helgoland",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/images/extra-img_2202-2.jpg",
        width: 1200,
        height: 630,
        alt: "Inselbahn Helgoland - Premium-Tour",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inselbahn Helgoland | Rundfahrten & Touren",
    description:
      "Geführte Inselrundfahrten auf Helgoland. Unterland-Tour und Premium-Tour mit Halt an der Langen Anna.",
    images: ["/images/extra-img_2202-2.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "apple-mobile-web-app-title": "Inselbahn",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Inselbahn Helgoland",
  description:
    "Geführte Inselrundfahrten auf Helgoland mit der Inselbahn. Unterland-Tour und Premium-Tour mit Ausstieg an der Langen Anna.",
  url: "https://www.helgolandbahn.de",
  telephone: "+491604170905",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Von-Aschen-Str. 594",
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
  image: "https://www.helgolandbahn.de/images/extra-img_2202-2.jpg",
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
