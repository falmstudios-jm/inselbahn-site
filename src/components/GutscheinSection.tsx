import Image from "next/image";
import Link from "next/link";

const giftCards = [
  {
    title: "1\u00D7 Unterland-Tour",
    price: "11,00",
    illustration: "/images/inselbahn-illustration-unterland.svg",
    alt: "Unterland-Tour Illustration",
    bg: "bg-amber-50",
  },
  {
    title: "1\u00D7 Premium-Tour",
    price: "22,00",
    illustration: "/images/inselbahn-illustration-premium.svg",
    alt: "Premium-Tour Illustration",
    bg: "bg-[#f0f4f8]",
  },
  {
    title: "Familien-Gutschein",
    price: "ab 34,00",
    illustration: "/images/inselbahn-illustration-premium.svg",
    alt: "Familien-Gutschein Illustration",
    bg: "bg-red-50",
  },
];

export default function GutscheinSection() {
  return (
    <section className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
            Geschenkidee
          </span>
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-3 leading-tight">
            Helgoland verschenken
          </h2>
          <p className="text-dark/60 text-base md:text-lg max-w-2xl mx-auto">
            Das perfekte Geschenk f&uuml;r Inselliebhaber
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {giftCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Illustration */}
              <div className={`flex items-center justify-center h-[120px] ${card.bg}`}>
                <Image
                  src={card.illustration}
                  alt={card.alt}
                  width={200}
                  height={90}
                  className="h-[80px] w-auto"
                />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-dark mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-dark mb-4">{card.price}&nbsp;&euro;</p>

                <Link
                  href="/gutschein"
                  className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Jetzt schenken
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-dark/40 text-xs mt-8">
          G&uuml;ltig f&uuml;r 3 Jahre &middot; Teileinl&ouml;sung m&ouml;glich &middot; Restwert bleibt erhalten
        </p>
      </div>
    </section>
  );
}
