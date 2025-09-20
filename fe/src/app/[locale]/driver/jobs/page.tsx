"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Clock, MapPin, Navigation } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDriverOrders } from "@/hooks/driver/useDriverOrders";

export default function JobsPage() {
  const t = useTranslations("driver");
  const router = useRouter();

  const handleJobSelect = (jobId: string) => {
    router.push(`/driver/orders/${jobId}`);
  };

  const { useDriverTasks } = useDriverOrders();
  const { data: jobs, error } = useDriverTasks();
  if (error) console.log("driver active orders", jobs, error);
  const activeJobs = jobs?.data.orders.filter(
    (job) => job.order_status === "in-transit"
  );
  const availableJobs = jobs?.data.orders.filter(
    (job) => job.order_status === "accepted"
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-semibold">{t("myJobs")}</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white mb-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="active">{t("activeJob")}</TabsTrigger>
            <TabsTrigger value="available">{t("available")}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="p-0">
            {activeJobs && activeJobs.length > 0 ? (
              <div className="flex flex-col">
                {activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white p-4 border-b"
                    onClick={() => handleJobSelect(job.order_id)}
                  >
                    <div className="flex justify-between mb-3">
                      <h3 className="font-semibold">
                        {t("order")} {job.order_id}
                      </h3>
                      <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {t("activeJob")}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {t("pickupLocation")}
                          </p>
                          <p className="font-medium">{job.pickup_address}</p>
                        </div>
                      </div>
                      {job.delivery_address && (
                        <>
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                {t("dropoffLocation")}
                              </p>
                              <p className="font-medium">
                                {job.delivery_address}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between mt-4 text-sm">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-500 mr-1" />
                              <span>{job.date}</span>
                            </div>
                            <div className="flex items-center">
                              <Navigation className="w-4 h-4 text-gray-500 mr-1" />
                              <span>{job.distance}</span>
                            </div>
                            {/* <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                              <span>{job.total_price} SEK</span>
                            </div> */}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/driver/transit/${job.id}`);
                      }}
                    >
                      {t("startTransitBtn")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">{t("noActiveJobs")}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="p-0">
            {availableJobs && availableJobs.length > 0 ? (
              <div className="flex flex-col">
                {availableJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white p-4 border-b flex flex-col"
                    onClick={() => handleJobSelect(job.order_id)}
                  >
                    <div className="flex justify-between mb-3">
                      <h3 className="font-semibold">
                        {t("order")} {job.order_id}
                      </h3>
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {t("available")}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {t("pickupLocation")}
                          </p>
                          <p className="font-medium">{job.pickup_address}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {t("dropoffLocation")}
                          </p>
                          <p className="font-medium">{job.delivery_address}</p>
                        </div>
                      </div>

                      <div className="flex justify-between mt-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 mr-1" />
                          <span>{job.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Navigation className="w-4 h-4 text-gray-500 mr-1" />
                          <span>{job.distance}</span>
                        </div>
                        {/* <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          <span>{job.total_price} SEK</span>
                        </div> */}
                      </div>
                    </div>

                    <button
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/driver/jobs/${job.order_id}`);
                      }}
                    >
                      {t("acceptJob")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">{t("noAvailableJobs")}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {t("checkBackForJobs")}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
