"use client";
import PricingCard from "@/components/pricingCard";


export default function Pricing() {
    const pricingData = [
        {
          title: "Básico",
          description: "Mas texto por rellenar",
          originalPrice: "7,99€",
          discountedPrice: "3,99€",
          features: ["First Item", "Second Item", "Third Item"],
          priceId: "price_1Rl9zm2LSjDC5txTe2rXn5LE"
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
          priceId: "price_1RlA0F2LSjDC5txTJFx3ulMv"
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
          priceId: "price_1RlA0R2LSjDC5txTmkLRnvkH"
        },
      ];
      
  return (
    <>
      <div className="text-center">
        <div className="font-bold font-mono text-xl md:text-2xl">PRICING</div>
        <div className="font-bold font-mono text-2xl md:text-4xl">
          Bibendum amet at molestie mattis.
        </div>
      </div>

      <div className="flex flex-col items-center gap-10 mt-10 md:flex-row md:gap-14">
        {pricingData.map((plan, index) => (
          <PricingCard key={index} {...plan}/>
        ))}
      </div>
    </>
  );
}
