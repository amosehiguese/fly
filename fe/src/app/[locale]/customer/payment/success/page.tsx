/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
//@ts-expect-error - import is not type-safe but works at runtime

import confetti from "canvas-confetti";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { useTranslations } from "next-intl";

// Separate component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  console.log(orderId);
  // const searchParams = useSearchParams();
  // const amount = searchParams.get("amount") || 0;
  // const currency = searchParams.get("currency") || "SEK";
  // const orderId = searchParams.get("order_id");
  // const sessionId = searchParams.get("session_id");
  // const paymentIntent = searchParams.get("payment_intent");
  const t = useTranslations("common.payment");
  const router = useRouter();
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (orderId) {
        router.push(`/customer/tip/${orderId}`);
      }
    }, 3000);
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-green-100 rounded-full" />
            <CheckCircle className="w-24 h-24 text-green-500 relative" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            {t("success.title")}
          </h1>
          <p className="text-gray-500">{t("success.description")}</p>
        </motion.div>

        {/* Order Details Card */}

        {/*  */}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          {/* <Button
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => (window.location.href = "/orders")}
          >
            View Order Details
          </Button> */}
          <Button
            // variant="outline"
            className="w-full h-12"
            onClick={() => (window.location.href = `/customer/tip/${orderId}`)}
          >
            {t("success.button.tip")}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
