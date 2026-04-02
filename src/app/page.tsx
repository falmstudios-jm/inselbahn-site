import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TourCards from "@/components/TourCards";
import Schedule from "@/components/Schedule";
import Reviews from "@/components/Reviews";
import GutscheinSection from "@/components/GutscheinSection";
import GettingThere from "@/components/GettingThere";
import FAQ from "@/components/FAQ";
import BookingWidget from "@/components/BookingWidget";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import InlineChat from "@/components/InlineChat";
import ChatBubble from "@/components/ChatBubble";
import { getToursWithFallback, getDeparturesWithFallback } from "@/lib/tours";

export default async function Home() {
  const [tours, departures] = await Promise.all([
    getToursWithFallback(),
    getDeparturesWithFallback(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <TourCards tours={tours} />
        <Schedule tours={tours} departures={departures} />
        <Reviews />
        <GutscheinSection />
        <GettingThere />
        <FAQ />
        <InlineChat />
        <BookingWidget />
      </main>
      <Footer />
      <AnnouncementBanner />
      <ChatBubble />
    </>
  );
}
