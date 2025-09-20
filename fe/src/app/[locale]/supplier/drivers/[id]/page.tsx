"use client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, ArrowLeft, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useFetchDriverById,
  useFetchDriversLocation,
} from "@/hooks/supplier/useDrivers";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/api";
import { formatDateLocale } from "@/lib/formatDateLocale";
import GoogleMapView from "@/components/GoogleMap";
import { Marker } from "@react-google-maps/api";
import { useTranslations } from "next-intl";

export default function DriverProfilePage() {
  const t = useTranslations("supplier.drivers");
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data, isPending, error } = useFetchDriverById(id);
  const driver = data?.data;

  const { data: driversLocationResponse } = useFetchDriversLocation();
  const driversLocations = driversLocationResponse?.data;
  const driverLocation = driversLocations?.find(
    (item) => item.id.toString() === id
  );

  const handleBack = () => {
    router.back();
  };

  const handleAssignJob = () => {
    router.push(`/supplier/jobs/assign/${id}`);
  };

  const handleMessage = () => {
    router.push(`/supplier/chats/${id}`);
  };

  const handleRemoveDriver = () => {
    // In a real app, you would call an API to remove the driver
    console.log(`Removing driver ${id}`);
    // After removing, navigate back to drivers list
    router.push("/supplier/drivers");
  };

  if (isPending)
    return (
      <div className="flex items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center">
        <p className="font-semibold text-[20px]">{t("errorTitle")}</p>
        <p className="text-gray-600">
          {(error as AxiosError<ErrorResponse>).response?.data?.messageSv || ""}
        </p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 pb-32 md:max-w-2xl lg:max-w-3xl">
      {/* Header */}
      <div className="py-4 flex items-center justify-between">
        <button onClick={handleBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600 flex items-center"
              onClick={handleRemoveDriver}
            >
              <Trash className="h-4 w-4 mr-2" />
              Remove Driver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      {/* Profile Image */}
      <div className="flex justify-center my-6">
        <div className="relative h-28 w-28 rounded-full overflow-hidden border border-gray-200">
          <Image
            src="/avatar_male.jpg"
            alt={driver?.full_name || ""}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Personal Info Section */}
      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">{t("personalInfo")}</h2>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500">{t("fullName")}</p>
            <p className="font-medium">{driver?.full_name}</p>
          </div>

          <div>
            <p className="text-gray-500">{t("phoneNumber")}</p>
            <p className="font-medium">{driver?.phone_number}</p>
          </div>

          <div>
            <p className="text-gray-500">{t("emailAddress")}</p>
            <p className="font-medium">{driver?.email}</p>
          </div>
        </div>
      </section>

      {/* Vehicle Info Section */}
      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">{t("vehicleInfo")}</h2>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500">{t("vehicleType")}</p>
            <p className="font-medium">{driver?.vehicle_type}</p>
          </div>

          <div>
            <p className="text-gray-500">{t("license")}</p>
            <p className="font-medium">{driver?.plate_number}</p>
          </div>

          <div>
            <p className="text-gray-500">{t("licenseType")}</p>
            <p className="font-medium">{driver?.license_type}</p>
          </div>

          <div>
            <p className="text-gray-500">{t("licenseExpDate")}</p>
            <p className="font-medium">
              {driver?.license_exp_date &&
                formatDateLocale(driver?.license_exp_date, "sv")}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-8">
        <div className="space-y-4">
          <div>
            <p className="text-gray-500">{t("completedJobs")}</p>
            <p className="font-medium">
              {driver?.deliveryStats?.totalDeliveries || 0}
            </p>
          </div>

          <div>
            <p className="text-gray-500">{t("rating")}</p>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium">{4}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="container mx-auto max-w-md flex gap-4 md:max-w-2xl lg:max-w-3xl">
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={handleAssignJob}
          >
            {t("assignJob")}
          </Button>

          <Button
            variant="outline"
            className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
            onClick={handleMessage}
          >
            {t("message")}
          </Button>
        </div>
      </div>

      {/* Map View for Driver Location */}
      {driverLocation && driverLocation.is_sharing_location === 1 ? (
        <div className="w-full h-64 rounded-xl overflow-hidden mb-6 shadow border border-gray-200">
          <GoogleMapView
            userLocation={{
              lat: parseFloat(driverLocation.current_latitude),
              lng: parseFloat(driverLocation.current_longitude),
            }}
          >
            <Marker
              position={{
                lat: parseFloat(driverLocation.current_latitude),
                lng: parseFloat(driverLocation.current_longitude),
              }}
              label={driverLocation.full_name}
            />
          </GoogleMapView>
        </div>
      ) : null}
    </div>
  );
}
