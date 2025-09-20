"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, Star, Plus, Copy, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupplierDashboard } from "@/hooks/supplier";
import { useFetchDrivers } from "@/hooks/supplier/useDrivers";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/api";
import { useTranslations } from "next-intl";

export default function DriversPage() {
  const t = useTranslations("supplier.drivers");
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const { data, isPending, error } = useFetchDrivers();
  const drivers = data?.data?.drivers;
  // const pagination = data?.pagination

  const handleAssignJob = (driverId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/supplier/jobs/assign/${driverId}`);
  };

  const handleViewProfile = (driverId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/supplier/drivers/${driverId}`);
  };

  const { data: dashboard } = useSupplierDashboard();

  const driverSignUpLink =
    process.env.NODE_ENV === "development"
      ? `http://localhost:3010/driver-signup?id=${dashboard?.data.supplier_id}`
      : `https://www.flyttman.se/driver-signup?id=${dashboard?.data.supplier_id}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(driverSignUpLink);
    // You could add a toast notification here
  };

  if (isPending)
    return (
      <div className="">
        <p>{t("loading")}</p>
      </div>
    );
  if (error)
    return (
      <div>
        <p className="font-semibold text-[20px]">{t("errorTitle")}</p>
        <p className="text-gray-600">
          {(error as AxiosError<ErrorResponse>).response?.data?.messageSv || ""}
        </p>
      </div>
    );

  return (
    <div className="container mx-auto px-0 pb-6 md:max-w-4xl lg:max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 mb-0 md:px-6 lg:px-8">
        <button onClick={handleBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{t("drivers")}</h1>
        <div className="w-5"></div> {/* Empty div for alignment */}
      </div>

      {/* Stats Card */}
      <div className="bg-red-600 text-white p-4 mb-4 md:rounded-lg md:mx-4 lg:mx-8">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold">{drivers?.length}</h2>
            <p>{t("totalDrivers")}</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold">
              {drivers?.filter((driver) => driver.is_active === 0).length}
            </h2>
            <p>{t("available")}</p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/supplier/register-driver")}
          variant="outline"
          className="w-full bg-white text-red-600 hover:bg-gray-100 gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("addNewMember")}
        </Button>
      </div>

      {/* Invitation Link */}
      <div className="px-4 mb-4 flex justify-between items-center md:px-6 lg:px-8">
        <p className="text-sm text-gray-600 truncate pr-2">
          {driverSignUpLink}
        </p>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 bg-red-600 text-white hover:bg-red-700"
          onClick={handleCopyLink}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Button */}
      <div className="px-4 mb-4 md:px-6 lg:px-8">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 border-gray-300"
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Driver Cards */}
      {drivers?.length === 0 ? (
        <div className="w-full flex flex-col justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12h19.5m-19.5 0a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h19.5a2.25 2.25 0 0 1 2.25 2.25v3a2.25 2.25 0 0 1-2.25 2.25m-19.5 0a2.25 2.25 0 0 0-2.25 2.25v3a2.25 2.25 0 0 0 2.25 2.25h19.5a2.25 2.25 0 0 0 2.25-2.25v-3a2.25 2.25 0 0 0-2.25-2.25M6.75 7.5h.008v.008H6.75V7.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM12 7.5h.008v.008H12V7.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM17.25 7.5h.008v.008H17.25V7.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <p>{t("noDrivers")}</p>
        </div>
      ) : (
        <div className="px-4 space-y-4 md:px-6 lg:px-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
          {drivers?.map((driver) => (
            <Card
              key={driver.id}
              className="border-red-500 border rounded-lg overflow-hidden"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-lg">{driver.full_name}</h3>

                  {driver.is_active === 1 && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {t("inTransit")}
                    </Badge>
                  )}

                  {driver.is_active === 0 && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {t("available")}
                    </Badge>
                  )}

                  {/* {driver.is_active === "awaiting-approval" && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Awaiting Approval
                  </Badge>
                )} */}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <p className="text-sm">
                      <span className="text-gray-500 mr-2">{t("phone")}</span>
                      {driver?.phone_number}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <p className="text-sm">
                      <span className="text-gray-500 mr-2">{t("email")}</span>
                      {driver?.email}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 mr-2">{t("rating")}</p>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1">
                      {driver?.is_verified ? t("verified") : t("notVerified")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {driver?.is_active ? (
                    <>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={(e) =>
                          handleAssignJob(driver.id.toString(), e)
                        }
                      >
                        {t("assignJob")}
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                        onClick={(e) =>
                          handleViewProfile(driver.id.toString(), e)
                        }
                      >
                        {t("viewProfile")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="flex-1 bg-red-600 hover:bg-red-700">
                        {t("accept")}
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {t("reject")}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
