"use client";

import { useRouter } from "@/i18n/navigation";
import { BarChart, Headphones, LogOut, MapPin, Edit } from "lucide-react";
import Image from "next/image";
import { useDriverStore } from "@/store/driverStore";
import { useDriverProfile } from "@/hooks/driver/useDriverProfile";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import StarRating from "@/components/StarRating";

export default function ProfilePage() {
  const router = useRouter();
  const { driver } = useDriverStore();
  const { useProfile } = useDriverProfile();
  const { data: profileData } = useProfile();
  const profile = profileData?.data;
  const t = useTranslations("driver");

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-0 md:py-8">
      {/* Header */}
      <div className="bg-white p-4 border-b w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">{t("profile")}</h1>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4">
        <div className="bg-white rounded-xl p-5 mb-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4 border-2 border-green-100">
              <Image
                src={"/avatar_male.jpg"}
                alt={profile?.personalInfo.fullName || driver?.fullname || ""}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {profile?.personalInfo.fullName || driver?.fullname}
              </p>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1 text-green-600" />
                <span>{"Norrkoping"}</span>
              </div>
            </div>
          </div>
          <Link
            href="/driver/profile/edit"
            className="flex items-center justify-center px-4 h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium text-sm"
            aria-label="Edit profile"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t("editProfile")}
          </Link>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-green-500">
          <div className="flex items-center mb-3">
            <BarChart className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold text-lg">{t("statistics")}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">{t("totalOrders")}</div>
              <div className="text-2xl font-bold">
                {profile?.performanceMetrics.totalAssignments ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t("totalIncome")}</div>
              <div className="text-2xl font-bold">
                SEK{profile?.performanceMetrics.totalRatings ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t("rating")}</div>
              <div className="flex items-center mt-1">
                <StarRating
                  rating={Number(profile?.performanceMetrics.averageRating)}
                />
                {/* <span className="text-xl font-bold">
                  {(profile?.performanceMetrics.averageRating === "0"
                    ? "N/A"
                    : profile?.performanceMetrics.averageRating) ?? "-"}
                </span> */}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t("completion")}</div>
              <div className="text-2xl font-bold">
                {profile?.performanceMetrics.completionRate ?? 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Support Button */}
        <Link
          href="mailto:support@flyttman.se"
          target="_blank"
          className="bg-white rounded-xl p-4 mb-4 w-full flex items-center shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <Headphones className="w-5 h-5 text-gray-600 mr-3" />
          <span className="font-medium">{t("support")}</span>
        </Link>

        <div className="bg-white rounded-xl p-2 mb-4 w-full flex items-center shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
          <LanguageSwitcher />
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="bg-white rounded-xl p-4 w-full flex items-center text-red-500 shadow-sm hover:bg-red-50 transition-colors border border-gray-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}
