"use client";

import { FaCheck } from "react-icons/fa";
import ButtonPrimary from "./buttonPrimary";

interface PricingCardProps {
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  features: string[];
}

export default function PricingCard({
  title,
  description,
  originalPrice,
  discountedPrice,
  features,
}: PricingCardProps) {
  return (
    <div className="text-center flex flex-col border px-10 py-5 bg-gray-600 h-[500px] rounded-lg">
      {/* Header */}
      <div className="pb-5">
        <div className="font-semibold text-3xl">{title}</div>
        <div className="text-sm">{description}</div>
      </div>

      {/* Pricing */}
      <div>
        <p className="line-through text-5xl pb-2">{originalPrice}</p>
        <p className="text-4xl">{discountedPrice}</p>
      </div>

      {/* Button */}
      <div className="py-5">
        <ButtonPrimary />
      </div>

      {/* Feature List */}
      <ul className="list-none space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <FaCheck className="text-green-500 mt-1" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
