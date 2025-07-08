import HeroSection from "@/components/hero";
import InfoBox from "@/components/infoBox";
import FAQ from "@/components/faq";
import Pricing from "@/components/pricing";

export default function Home() {
  

  return (
    <main className="h-full w-full bg-[var(--background)]">
      {/*Video Introduction*/}
      <section className="relative flex justify-center items-center pt-32 min-h-[600px] md:min-h-[820px]">
        <HeroSection/>
      </section>

      {/* Key Features */}

      <section className="flex justify-center items-center w-full">
        <InfoBox></InfoBox>
      </section>

      {/* Pricing */}

      <section className="flex flex-col justify-between items-center py-30 px-4 md:px-8">
        <Pricing/>
      </section>

      {/* FAQ */}
      <section>
        <FAQ/>
      </section>
    </main>
  );
}
