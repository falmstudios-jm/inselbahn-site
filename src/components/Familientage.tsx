import Image from "next/image";

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
      {label}
    </span>
  );
}

export default function Familientage() {
  return (
    <section className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Photo */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/images/666b81a83e5b0865626a34fe_helgolandbahn-1-2.jpg"
              alt="Familientage Inselbahn"
              fill
              className="object-cover"
            />
          </div>
          {/* Right: Text */}
          <div>
            <SectionPill label="Familientage" />
            <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-6 leading-tight">
              Kinder fahren kostenlos!
            </h2>
            <p className="text-lg md:text-xl font-semibold text-amber-500 mb-4">
              Auf ausgew&auml;hlten Touren fahren Kinder kostenlos!
            </p>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-4">
              An bestimmten Tagen und Uhrzeiten ist die Inselbahn besonders
              familienfreundlich: Bei der Unterland-Tour um 14:30 Uhr fahren alle
              Kinder kostenlos. Die perfekte Gelegenheit f&uuml;r einen entspannten
              Familienausflug auf Helgoland.
            </p>
            <p className="text-dark/40 text-sm">
              Nur in Begleitung mindestens eines zahlenden Erwachsenen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
