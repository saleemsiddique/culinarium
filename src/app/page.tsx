import ButtonPrimary from "@/components/buttonPrimary";
import ButtonSecondary from "@/components/buttonSecondary";
import InfoBox from "@/components/infoBox";
import PricingCard from "@/components/pricingCard";

export default function Home() {
  const pricingData = [
    {
      title: "Básico",
      description: "Mas texto por rellenar",
      originalPrice: "7,99€",
      discountedPrice: "3,99€",
      features: ["First Item", "Second Item", "Third Item"],
    },
    {
      title: "Medio",
      description: "Mas texto por rellenar",
      originalPrice: "20,99€",
      discountedPrice: "4,99€",
      features: [
        "First Item",
        "Second Item",
        "Third Item",
        "Third Item",
        "Third Item",
      ],
    },
    {
      title: "Pesado",
      description: "Mas texto por rellenar",
      originalPrice: "39,99€",
      discountedPrice: "7,99€",
      features: [
        "First Item",
        "Second Item",
        "Third Item",
        "Third Item",
        "Third Item",
        "Third Item",
        "Third Item",
      ],
    },
  ];

  return (
    <main className="h-screen w-full bg-[var(--background)]">
      {/*Video Introduction*/}
      <section className="relative flex justify-center items-center pt-32 min-h-[600px] md:min-h-[720px]">
        <video
          className="absolute top-15 left-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
        >
          <source src="/test-video.mp4" type="video/mp4" />
        </video>
        <div className="relative text-center z-10 text-white px-4">
          <div className="font-bold font-mono text-4xl md:text-6xl">
            WELCOME TO CULINARIUM
          </div>
          <div className="text-sm font-semibold mt-2">
            Tu proxima receta, a un clic de distancia
          </div>
          <div className="mt-6 space-x-4">
            <ButtonPrimary />
            <ButtonSecondary />
          </div>
        </div>
      </section>

      {/* Key Features */}

      <section className="flex flex-col justify-evenly items-center pt-20 py-20 px-4 md:px-8 md:flex-row">
        <InfoBox></InfoBox>
        <InfoBox></InfoBox>
        <InfoBox></InfoBox>
      </section>

      {/* Pricing */}

      <section className="flex flex-col justify-between items-center py-20 px-4 md:px-8">
        <div className="text-center">
          <div className="font-bold font-mono text-xl md:text-2xl">PRICING</div>
          <div className="font-bold font-mono text-2xl md:text-4xl">
            Bibendum amet at molestie mattis.
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 mt-10 md:flex-row md:gap-6">
          {pricingData.map((plan, index) => (
            <PricingCard key={index} {...plan}/>
          ))}
        </div>
      </section>
    </main>
  );
}
