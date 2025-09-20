"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  InputOTPSlot,
  InputOTPGroup,
  InputOTP,
} from "@/components/ui/otp-input";
import { useSendVerificationEmail, useVerifyEmail } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { useRouter } from "@/i18n/navigation";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const role = searchParams.get("role");
  const token = searchParams.get("token");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const isMountedRef = useRef(true);

  const t = useTranslations("auth.verifyEmail");

  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resendCode, isPending: isResending } =
    useSendVerificationEmail();

  // useEffect(() => {
  //   localStorage.setItem("token", token || "");
  //   if (email && role && token) {
  //     router.replace(
  //       role === "super_admin" ||
  //         role === "financial_admin" ||
  //         role === "support_admin"
  //         ? "/choose-business"
  //         : role === "customer"
  //           ? "/customer"
  //           : role === "supplier"
  //             ? "/supplier"
  //             : "/"
  //     );
  //   }
  // }, [email, role, token]);

  // useEffect(() => {
  //   if (!email) return;

  //   const storageKey = `verification_${email}`;
  //   const hasBeenSent = sessionStorage.getItem(storageKey);

  //   if (!hasBeenSent) {
  //     resendCode({ email });
  //     sessionStorage.setItem(storageKey, "true");
  //   }
  // }, [email, isResending]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        if (isMountedRef.current) {
          setTimer((prev) => prev - 1);
        }
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, isTimerRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleResendCode = () => {
    if (!email || isResending) return;
    resendCode({ email });
    setOtp("");
    setTimer(60);
    setIsTimerRunning(true);
  };

  const handleVerify = (value: string) => {
    setOtp(value);
    if (value.length === 6 && email && role && token) {
      // Use setTimeout to avoid blocking the input event
      setTimeout(() => {
        try {
          if (isMountedRef.current) {
            const formattedOtp = value.replace(
              /^(.{2})(.{2})(.{2})$/,
              "$1 $2 $3"
            );
            verifyEmail({ email, token, role, code: formattedOtp });
            setOtp("");
          }
        } catch (error) {
          console.error("Error in verification:", error);
        }
      }, 0);
    }
  };

  if (!email || !role || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>{t("invalidVerification")}</CardTitle>
            <CardDescription>{t("invalidVerificationDesc")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isVerifying) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description", { email: email || "" })}
        </p>
        <p className="text-muted-foreground font-semibold">{t("checkSpam")}</p>
      </div>
      <Card className="w-[400px]">
        <CardContent className="space-y-6 pt-6 flex flex-col items-center">
          <InputOTP
            value={otp}
            onChange={handleVerify}
            disabled={isVerifying}
            maxLength={6}
            autoFocus
            type="text"
          >
            <InputOTPGroup className="gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="relative">
                  <InputOTPSlot
                    index={i}
                    className={cn(
                      isVerifying &&
                        otp.length === 6 &&
                        "animate-pulse bg-muted"
                    )}
                  />
                  {isVerifying && otp.length === 6 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: "1s",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              disabled={isTimerRunning || isResending}
              onClick={handleResendCode}
            >
              {isResending ? t("resendingCode") : t("resendCode")}
              {isTimerRunning && ` (${timer}s)`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
