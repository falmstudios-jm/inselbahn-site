import Image from "next/image";

export default function Familientage() {
  return (
    <section className="relative px-5 md:px-10 lg:px-20 py-16 md:py-24 overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/666b81a83e5b0865626a34fe_helgolandbahn-1-2.jpg"
          alt=""
          fill
          className="object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-dark/60" />
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block text-4xl mb-4" aria-hidden="true">
          &#x1F46A;
        </span>
        <h2 className="text-[28px] md:text-[40px] font-bold text-white mb-4 leading-tight">
          Familientage
        </h2>
        <p className="text-lg md:text-xl font-semibold text-amber-300 mb-6">
          Auf ausgew&auml;hlten Touren fahren Kinder kostenlos!
        </p>
        <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-4">
          An bestimmten Tagen und Uhrzeiten ist die Inselbahn besonders
          familienfreundlich: Bei der Unterland-Tour um 14:30 Uhr fahren alle
          Kinder kostenlos. Die perfekte Gelegenheit f&uuml;r einen entspannten
          Familienausflug auf Helgoland.
        </p>
        <p className="text-white/60 text-sm">
          Nur in Begleitung mindestens eines zahlenden Erwachsenen.
        </p>
      </div>
    </section>
  );
}
