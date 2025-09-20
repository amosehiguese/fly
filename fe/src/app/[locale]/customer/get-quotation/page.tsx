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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
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

function GetQuotationContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formStage: number = parseInt(searchParams.get("stage") || "1", 10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const locale = useLocale();
  const t = useTranslations("quotation.common");
  const t2 = useTranslations("home.getQuote");
  const tServices = useTranslations("home.getQuote");
  const t3 = useTranslations("getQuote");

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

  const [selectedType, setSelectedType] = React.useState<QuotationType | null>(
    null
  );

  const mutation = useMutation<ApiResponse, AxiosError<ErrorResponse>, unknown>(
    {
      mutationFn: (data: unknown) =>
        quotationService.submitQuotation(
          selectedType as QuotationType,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data as Record<string, any>,
          locale
        ),
      onSuccess: (response) => {
        const displayMessage =
          (locale === "sv" ? response.messageSv : response.message) ||
          t3("success");

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
    if (!selectedType) return;
    if (formStage !== 4) return;
    mutation.mutate(data);
  };

  const renderForm = () => {
    const formProps = {
      onSubmit: handleSubmit,
      mutation,
      formStage,
      handleNext,
    };

    switch (selectedType) {
      case "company-relocation":
        return <CompanyRelocationForm {...formProps} />;
      case "move-out-cleaning":
        return <MoveOutCleaningForm {...formProps} />;
      case "moving-cleaning":
        return <MoveOutCleaningForm {...formProps} />;
      case "heavy-lifting":
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

      default:
        return null;
    }
  };

  const quotationTypes = [
    { value: "private-move", label: tServices("services.privateMove") },
    {
      value: "company-relocation",
      label: tServices("services.companyRelocation"),
    },
    {
      value: "move-out-cleaning",
      label: tServices("services.moveOutCleaning"),
    },
    // { value: "storage", label: "Storage" },
    { value: "heavy-lifting", label: tServices("services.heavyLifting") },
    // { value: "carrying-assistance", label: "Carrying Assistance" },
    // { value: "junk-removal", label: "Junk Removal" },
    { value: "estate-clearance", label: tServices("services.estateClearance") },
    { value: "evacuation-move", label: tServices("services.evacuationMove") },
    { value: "secrecy-move", label: tServices("services.secrecyMove") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Card className="max-w-4xl mx-auto md:p-4 ">
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
              <Select
                value={selectedType || undefined}
                onValueChange={(value) =>
                  setSelectedType(value as QuotationType)
                }
                disabled={formStage !== 1}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t2("form.selectService")} />
                </SelectTrigger>
                <SelectContent>
                  {quotationTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      onClick={() =>
                        setSelectedType(type.value as QuotationType)
                      }
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedType && (
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
          buttonText={
            locale === "sv" ? "Gå till instrumentpanelen" : "Go to dashboard"
          }
          onButtonClick={() => router.push("/customer/")}
        />
      </div>
    </div>
  );
}

export default function GetQuotation() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <GetQuotationContent />
    </Suspense>
  );
}
