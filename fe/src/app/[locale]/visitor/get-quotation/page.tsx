"use client";

import React, { useCallback, useState, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ApiResponse, QuotationType } from "./schema";
import { quotationService } from "./api";
import { CompanyRelocationForm } from "./quotation-forms/CompanyRelocationForm";
import { MoveOutCleaningForm } from "./quotation-forms/MoveOutCleaningForm";
import { HeavyLiftingForm } from "./quotation-forms/HeavyLiftingForm";
import { JunkRemovalForm } from "./quotation-forms/JunkRemovalForm";
import { EstateClearanceForm } from "./quotation-forms/EstateClearanceForm";
import { toast } from "sonner";
import { EvacuationMoveForm } from "./quotation-forms/EvacuationMoveForm";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import FormProgressIndicator from "./FormProgressIndicator";
import { AxiosError } from "axios";
import { ErrorResponse, handleMutationError } from "@/api";
import { PrivacyMoveForm } from "./quotation-forms/PrivacyMoveForm";
import SuccessModal from "@/components/ui/success-modal";
import Nav from "@/components/homepage/Nav";
import { useLocale, useTranslations } from "next-intl";
import { SecrecyMoveForm } from "./quotation-forms/SecrecyMoveForm";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; errorTitle: string; submissionError: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    errorTitle: string;
    submissionError: string;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{this.props.errorTitle}</AlertTitle>
          <AlertDescription>{this.props.submissionError}</AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// const quotationTypes = [
//   { value: "company-relocation", label: "Company Relocation" },
//   { value: "move-out-cleaning", label: "Move-Out Cleaning" },
//   { value: "storage", label: "Storage" },
//   { value: "heavy-lifting", label: "Heavy Lifting" },
//   { value: "carrying-assistance", label: "Carrying Assistance" },
//   { value: "junk-removal", label: "Junk Removal" },
//   { value: "estate-clearance", label: "Estate Clearance" },
//   { value: "evacuation-move", label: "Evacuation Move" },
//   { value: "privacy-move", label: "Privacy Move" },
// ];

function GetQuotationContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("service_type") as QuotationType | null;
  const formStage: number = parseInt(searchParams.get("stage") || "1", 10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const t = useTranslations("quotation.common");
  const locale = useLocale();
  // console.log("pn", pathname);

  const updateParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleNext = () => {
    router.push(
      pathname + "?" + updateParams("stage", (formStage + 1).toString())
    );
  };

  // const [formStage, setFormStage] = useState(1);
  // const [selectedType, setSelectedType] = React.useState<QuotationType | null>(
  //   null
  // );

  const mutation = useMutation<ApiResponse, AxiosError<ErrorResponse>, unknown>(
    {
      mutationFn: (data) =>
        quotationService.submitQuotation(
          typeParam as QuotationType,
          data as Record<string, unknown>,
          locale
        ),

      onSuccess: (response) => {
        const displayMessage =
          (locale === "sv" ? response.messageSv : response.message) ||
          t("success.title");

        toast.success(displayMessage);
        setShowSuccessModal(true);
      },
      onError: (error) => {
        // console.log("error", error.response);
        // toast.error(error.response?.data?.message || error.message);
        handleMutationError(error, locale);
      },
    }
  );

  const handleSubmit = (data: unknown) => {
    if (!typeParam) return;
    mutation.mutate(data);
  };

  // Add type check to prevent rendering without type
  if (!typeParam) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t("error.title")}</AlertTitle>
        <AlertDescription>{t("error.noServiceType")} </AlertDescription>
      </Alert>
    );
  }

  const renderForm = () => {
    const formProps = {
      onSubmit: handleSubmit,
      mutation,
      formStage,
      handleNext,
    };

    switch (typeParam) {
      case "company-relocation":
        return <CompanyRelocationForm {...formProps} />;
      case "move-out-cleaning":
        return <MoveOutCleaningForm {...formProps} />;
      case "storage":
        return <HeavyLiftingForm {...formProps} />;
      case "junk-removal":
        return <JunkRemovalForm {...formProps} />;
      case "estate-clearance":
        return <EstateClearanceForm {...formProps} />;
      case "evacuation-move":
        return <EvacuationMoveForm {...formProps} />;
      case "private-move":
        return <PrivacyMoveForm {...formProps} />;
      case "secrecy-move":
        return <SecrecyMoveForm {...formProps} />;
      case "heavy-lifting":
        return <HeavyLiftingForm {...formProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  flex-1 ">
      <Nav />
      <Card className="max-w-4xl md:mx-auto mx-4 md:p-4 mt-0 md:my-24">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            {formStage === 1
              ? t("logisticsInformation")
              : formStage === 2
                ? t("serviceDetails")
                : formStage === 3
                  ? t("contactInformation")
                  : t("summary")}
          </CardTitle>
          <CardDescription>
            {formStage === 1
              ? t("logisticsDescription")
              : formStage === 2
                ? t("serviceDetailsDescription")
                : formStage === 3
                  ? t("contactInformationDescription")
                  : t("summaryDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="md:w-[50%] w-full">
            <FormProgressIndicator currentStage={formStage} stages={4} />
          </div>
        </CardContent>
        <CardContent>
          <div className="space-y-8">
            {/* <Select
      value={typeParam || undefined}
      // onValueChange={(value) => setSelectedType(value as QuotationType)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a service type" />
      </SelectTrigger>
      <SelectContent>
        {quotationTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select> */}

            {typeParam && (
              <ErrorBoundary
                errorTitle={t("error.title")}
                submissionError={t("error.submissionError")}
              >
                <div className="space-y-8">{renderForm()}</div>
              </ErrorBoundary>
            )}
          </div>
        </CardContent>
      </Card>
      <SuccessModal
        isOpen={showSuccessModal}
        title={t("success.title")}
        description={t("success.description")}
        buttonText={t("success.buttonText")}
        onButtonClick={() => router.push("/login")}
      />
    </div>
  );
}

export default function GetQuotation() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <GetQuotationContent />
    </Suspense>
  );
}
