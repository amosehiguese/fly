import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const options = {
  mode: "payment" as const,
  amount: 1000, // This is 10.00 SEK (amount in öre)
  currency: "sek",
  appearance: {
    theme: "stripe" as const,
  },
};

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
