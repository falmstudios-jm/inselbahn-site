import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helgoland verschenken | Geschenkgutscheine Inselbahn",
  description:
    "Das perfekte Geschenk für Helgoland-Liebhaber. Gutscheine ab 10 EUR für geführte Inselrundfahrten. 3 Jahre gültig, Teileinlösung möglich.",
};

export default function GutscheinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
