"use client";

import { FaCheck } from "react-icons/fa";
import ButtonPrimary from "./buttonPrimary";
import EmbeddedCheckoutButton from "./EmbeddedCheckoutForm";

interface PricingCardProps {
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  features: string[];
  priceId: string;
}

export default function PricingCard({
  title,
  originalPrice,
  discountedPrice,
  features,
  priceId,
}: PricingCardProps) {
  return (
    <div className="w-[250px] max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700 h-[650px]">
      <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400 text-center">
        {title}
      </h5>
      <div className="flex flex-col items-center text-gray-900 dark:text-white">
        <span className="text-3xl font-semibold line-through text-gray-400">
          {originalPrice}
        </span>
        <span className="text-5xl font-extrabold tracking-tight">
          {discountedPrice}
        </span>
      </div>

      <div className=" mt-10 justify-center w-full text-center">
        <EmbeddedCheckoutButton priceId={priceId} />
      </div>

      <ul role="list" className="space-y-3 my-7">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center min-h-[40px]">
            <FaCheck className="shrink-0 w-4 h-4 text-orange-500   dark:text-blue-500" />
            <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
