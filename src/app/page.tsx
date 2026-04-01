import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TourCards from "@/components/TourCards";
import Schedule from "@/components/Schedule";
import Reviews from "@/components/Reviews";
import GettingThere from "@/components/GettingThere";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import BookingWidget from "@/components/BookingWidget";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TourCards />
        <Schedule />
        <Reviews />
        <GettingThere />
        <FAQ />
        <Contact />
        <BookingWidget />
      </main>
      <Footer />
      <AnnouncementBanner />
    </>
  );
}
