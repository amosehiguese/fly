import React from "react";
import { Button } from "./button";
import { Check } from "lucide-react";

type PricingFeature = {
  title: string;
  included: boolean;
};

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const PricingCard = ({
  title,
  description,
  price,
  features,
  popular = false,
  buttonText = "Get Started",
  onButtonClick,
}: PricingCardProps) => {
  return (
    <div
      className={`
        relative rounded-xl border p-6 shadow-sm transition-all
        ${popular ? "border-red-600 shadow-md" : "border-gray-200"}
      `}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
          Popular
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-gray-500">{description}</p>
      </div>

      <div className="my-6">
        <span className="text-3xl font-bold">SEK {price}</span>
        {price !== "Custom" && (
          <span className="text-gray-500 ml-1">/move</span>
        )}
      </div>

      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`mr-3 rounded-full p-1 ${feature.included ? "text-red-600" : "text-gray-300"}`}
            >
              <Check className="h-4 w-4" />
            </div>
            <span
              className={feature.included ? "text-gray-700" : "text-gray-400"}
            >
              {feature.title}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button
          onClick={onButtonClick}
          className={`w-full ${popular ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}`}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
