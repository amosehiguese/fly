"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  Upload,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useDriverAuth } from "@/hooks/driver";
import { toast } from "sonner";
import { handleDriverMutationError } from "@/api";
import { useSearchParams } from "next/navigation";

// Steps for the driver registration process
enum RegistrationStep {
  PERSONAL_INFO = 0,
  LICENSE_INFO = 1,
  VEHICLE_INFO = 2,
}

export default function DriverSignupPage() {
  const t = useTranslations("driver.auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get("id");
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(
    RegistrationStep.PERSONAL_INFO
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [licenseImage, setLicenseImage] = useState<File | null>(null);

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Get the driver registration function from the hook
  const { registerDriver } = useDriverAuth();

  // State for form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate current step form fields
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === RegistrationStep.PERSONAL_INFO) {
      if (!fullName.trim()) newErrors.fullName = t("requiredField");
      if (!phone.trim()) newErrors.phone = t("requiredField");
      if (!email.trim()) newErrors.email = t("requiredField");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = t("invalidEmail");
      }
      if (!password) newErrors.password = t("requiredField");
      else if (password.length < 6) newErrors.password = t("passwordMinLength");
      if (!confirmPassword) newErrors.confirmPassword = t("requiredField");
      else if (password !== confirmPassword)
        newErrors.confirmPassword = t("passwordsDontMatch");
    } else if (currentStep === RegistrationStep.LICENSE_INFO) {
      if (!licenseNumber.trim()) newErrors.licenseNumber = t("requiredField");
      if (!expiryDate) newErrors.expiryDate = t("requiredField");
      if (!licenseType) newErrors.licenseType = t("requiredField");
      if (!licenseImage) newErrors.licenseImage = t("requiredField");
    } else if (currentStep === RegistrationStep.VEHICLE_INFO) {
      // Vehicle info step is optional - only validate terms if any vehicle info is provided
      if ((vehicleType || vehicleReg) && !agreeToTerms) {
        newErrors.agreeToTerms = t("termsAgreement");
      }
      // If vehicle type is provided, registration is required
      if (vehicleType && !vehicleReg.trim()) {
        newErrors.vehicleReg = t("requiredField");
      }
      // If vehicle registration is provided, type is required
      if (vehicleReg && !vehicleType) {
        newErrors.vehicleType = t("requiredField");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (!validateCurrentStep()) {
      // If validation failed, show error and don't proceed
      toast.error("Vänligen fyll i alla obligatoriska fält");
      return;
    }

    if (currentStep < RegistrationStep.VEHICLE_INFO) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form to API
      submitRegistration();
    }
  };

  // Submit registration data
  const submitRegistration = () => {
    const formData = {
      fullName,
      phoneNumber: phone,
      email,
      password,
      licenseNumber,
      licenseExpDate: expiryDate,
      licenseType,
      vehicleType,
      plateNumber: vehicleReg,
      licenseImage: licenseImage || undefined,
      vehicleImage: vehiclePhoto || undefined,
      // No vehicle registration document in the UI, but API expects it
      vehicleRegDoc: undefined,
      supplierId,
    };

    registerDriver.mutate(formData, {
      onSuccess: () => {
        toast.success("Registrering lyckades! Du kan nu logga in.");
        router.push("/driver-login");
      },
      onError: handleDriverMutationError,
    });
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > RegistrationStep.PERSONAL_INFO) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/"); // Back to home
    }
  };

  // Handle license file upload
  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseImage(e.target.files[0]);
    }
  };

  // Handle vehicle photo upload
  const handleVehiclePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVehiclePhoto(e.target.files[0]);
    }
  };

  // Render the progress bar
  const renderProgressBar = () => {
    const totalSteps = 3;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
      <div className="w-full mb-6">
        <div className="flex justify-between mb-2 text-sm text-gray-500">
          <span>
            {currentStep + 1} {t("of")} {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Render step title
  const renderStepTitle = () => {
    switch (currentStep) {
      case RegistrationStep.PERSONAL_INFO:
        return t("stepPersonalInfo");
      case RegistrationStep.LICENSE_INFO:
        return t("stepLicenseInfo");
      case RegistrationStep.VEHICLE_INFO:
        return t("stepVehicleInfo");
      default:
        return "";
    }
  };

  // Render the form based on the current step
  const renderForm = () => {
    switch (currentStep) {
      case RegistrationStep.PERSONAL_INFO:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">{t("fullNamePlaceholder")}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("fullNamePlaceholder")}
                className={`mt-1 ${errors.fullName ? "border-red-500" : ""}`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">{t("phonePlaceholder")}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phonePlaceholder")}
                className={`mt-1 ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{t("emailSignupPlaceholder")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailSignupPlaceholder")}
                className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">{t("passwordSignupPlaceholder")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordSignupPlaceholder")}
                  className={`mt-1 ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[calc(50%-8px)]"
                >
                  {showPassword ? (
                    <EyeOff size={16} className="text-gray-500" />
                  ) : (
                    <Eye size={16} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">
                {t("confirmPasswordSignupPlaceholder")}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordSignupPlaceholder")}
                  className={`mt-1 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[calc(50%-8px)]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} className="text-gray-500" />
                  ) : (
                    <Eye size={16} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case RegistrationStep.LICENSE_INFO:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="licenseNumber">{t("licenseNumber")}</Label>
              <Input
                id="licenseNumber"
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder={t("licenseNumber")}
                className={`mt-1 ${errors.licenseNumber ? "border-red-500" : ""}`}
              />
              {errors.licenseNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.licenseNumber}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expiryDate">{t("expiryDate")}</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`mt-1 ${errors.expiryDate ? "border-red-500" : ""}`}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="licenseType">{t("licenseType")}</Label>
              <Select value={licenseType} onValueChange={setLicenseType}>
                <SelectTrigger
                  className={`mt-1 ${errors.licenseType ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder={t("selectLicenseType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="licenseUpload">{t("uploadLicense")}</Label>
              <div className="mt-1 flex items-center justify-center w-full">
                <label
                  htmlFor="licenseUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        {t("clickToUpload")}
                      </span>{" "}
                      {t("orDragDrop")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("imageFileNote")}
                    </p>
                  </div>
                  <input
                    id="licenseUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLicenseUpload}
                  />
                </label>
              </div>
              {licenseImage && (
                <p className="mt-2 text-sm text-gray-500">
                  {t("selected")}: {licenseImage.name}
                </p>
              )}
              {errors.licenseImage && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.licenseImage}
                </p>
              )}
            </div>
          </div>
        );

      case RegistrationStep.VEHICLE_INFO:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicleType">{t("vehicleType")}</Label>
              <Input
                id="vehicleType"
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder={t("vehicleType")}
                className={`mt-1 ${errors.vehicleType ? "border-red-500" : ""}`}
              />
              {errors.vehicleType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.vehicleType}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="vehicleReg">{t("vehicleRegNumber")}</Label>
              <Input
                id="vehicleReg"
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder={t("vehicleRegNumber")}
                className={`mt-1 ${errors.vehicleReg ? "border-red-500" : ""}`}
              />
              {errors.vehicleReg && (
                <p className="text-red-500 text-xs mt-1">{errors.vehicleReg}</p>
              )}
            </div>

            <div>
              <Label htmlFor="vehiclePhoto">{t("uploadVehiclePhoto")}</Label>
              <div className="mt-1 flex items-center justify-center w-full">
                <label
                  htmlFor="vehiclePhoto"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        {t("clickToUpload")}
                      </span>{" "}
                      {t("orDragDrop")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("imageFileNote")}
                    </p>
                  </div>
                  <input
                    id="vehiclePhoto"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleVehiclePhotoUpload}
                  />
                </label>
              </div>
              {vehiclePhoto && (
                <p className="mt-2 text-sm text-gray-500">
                  {t("selected")}: {vehiclePhoto.name}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreements"
                checked={agreeToTerms}
                onCheckedChange={(checked) =>
                  setAgreeToTerms(checked as boolean)
                }
              />
              <label
                htmlFor="agreements"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("iAgree")}{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="text-green-600 hover:underline"
                >
                  {t("termsAgreement")}
                </Link>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Button text based on step
  const getButtonText = () => {
    if (currentStep === RegistrationStep.VEHICLE_INFO) {
      return t("finish");
    }
    return t("next");
  };

  return (
    <div className="min-h-screen bg-[url('/1.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl p-4 flex flex-col bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="mb-4">
            <button onClick={handleBack} className="p-2 -ml-2">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          {renderProgressBar()}

          {/* Page title */}
          <h1 className="text-2xl font-bold mb-6">{t("signupTitle")}</h1>

          {/* Step title */}
          <h2 className="text-xl font-semibold mb-4">{renderStepTitle()}</h2>

          {/* Form */}
          <div className="flex-grow">
            {registerDriver.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-800 text-sm">{t("registrationError")}</p>
                </div>
              </div>
            )}
            {renderForm()}
          </div>

          {/* Action button */}
          <div className="mt-8">
            <Button
              onClick={handleNext}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
              disabled={
                registerDriver.isPending &&
                currentStep === RegistrationStep.VEHICLE_INFO
              }
            >
              {registerDriver.isPending &&
              currentStep === RegistrationStep.VEHICLE_INFO ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("registering")}
                </>
              ) : (
                getButtonText()
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}