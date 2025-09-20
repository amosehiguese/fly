"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDriverProfile } from "@/hooks/driver/useDriverProfile";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { handleMutationError } from "@/api";

export default function EditProfilePage() {
  const router = useRouter();
  const t = useTranslations("driver");
  const locale = useLocale();
  const { useProfile, useEditProfile } = useDriverProfile();
  const { data: profileData, isLoading } = useProfile();
  const editProfileMutation = useEditProfile();

  const profile = profileData?.data;

  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: profile.personalInfo?.phoneNumber || "",
        email: profile.personalInfo?.email || "",
      }));
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("invalidEmail");
    }

    // Phone number validation (basic)
    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t("invalidPhoneNumber");
    }

    // Password validation
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t("currentPasswordRequired");
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = t("passwordTooShort");
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t("passwordsDoNotMatch");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for API (only send changed fields)
    const updateData: Partial<{
      phoneNumber: string;
      email: string;
      currentPassword: string;
      newPassword: string;
    }> = {};

    if (formData.phoneNumber !== (profile?.personalInfo?.phoneNumber || "")) {
      updateData.phoneNumber = formData.phoneNumber;
    }

    if (formData.email !== (profile?.personalInfo?.email || "")) {
      updateData.email = formData.email;
    }

    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    // Check if there are any changes
    if (Object.keys(updateData).length === 0) {
      toast.error(t("noChangesToSave"));
      return;
    }

    try {
      await editProfileMutation.mutateAsync(updateData);
      toast.success(t("profileUpdatedSuccessfully"));
      router.push("/driver/profile");
    } catch (error: unknown) {
      handleMutationError(error, locale);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-green-500 border-b-gray-200 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto mb-2"></div>
          <p>{t("loadingProfile")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-0 md:py-8">
      {/* Header */}
      <div className="bg-white p-4 border-b mb-0 md:mb-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">{t("editProfile")}</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              {t("contactInformation")}
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">{t("emailAddress")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("enterEmail")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  placeholder={t("enterPhone")}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              {t("changePassword")}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {t("leaveBlankToKeepCurrent")}
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder={t("enterCurrentPassword")}
                    className={
                      errors.currentPassword ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword">{t("newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder={t("enterNewPassword")}
                    className={
                      errors.newPassword ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  {t("confirmNewPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder={t("confirmNewPassword")}
                    className={
                      errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={editProfileMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600"
              disabled={editProfileMutation.isPending}
            >
              {editProfileMutation.isPending ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
