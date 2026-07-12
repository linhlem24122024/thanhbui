import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyChoose from "@/components/WhyChoose";
import Pricing from "@/components/Pricing";
import Timeline from "@/components/Timeline";
import Instructor from "@/components/Instructor";
import PolicySection from "@/components/PolicySection";
import FaqSection from "@/components/FaqSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import StickyMobileCta from "@/components/StickyMobileCta";
import PopupProvider from "@/components/PopupProvider";

export default function Home() {
  return (
    <PopupProvider>
      <TopBar />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <Hero />
        <WhyChoose />
        <Pricing />
        <Timeline />
        <Instructor />
        <PolicySection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </PopupProvider>
  );
}
