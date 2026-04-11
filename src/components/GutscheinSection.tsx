import Image from "next/image";
import Link from "next/link";

const giftCards = [
  {
    title: "1\u00D7 Unterland-Tour",
    price: "11,00",
    photo: "/images/helgolandbahn-photo-1.jpg",
    alt: "Unterland-Tour",
  },
  {
    title: "1\u00D7 Premium-Tour",
    price: "22,00",
    photo: "/images/extra-img_2217-large.jpeg",
    alt: "Premium-Tour",
  },
  {
    title: "Alle weiteren Gutscheine",
    price: "ab 10,00",
    photo: "/images/tour-photo-1.jpg",
    alt: "Alle weiteren Gutscheine",
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
              {/* Photo */}
              <div className="relative h-[120px]">
                <Image
                  src={card.photo}
                  alt={card.alt}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-dark mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-dark mb-4">{card.price}&nbsp;&euro;</p>

                <Link
                  href="/gutschein"
                  className="block w-full text-center py-3.5 min-h-[44px] flex items-center justify-center rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
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
