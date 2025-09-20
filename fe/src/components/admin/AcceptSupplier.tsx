"use client";

import { useAdminSupplierDetails } from "@/hooks/admin/useAdminSupplierDetails";
import { useUpdateSupplierStatus } from "@/hooks/admin/useAdminSuppliers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { baseUrl } from "@/api";

export default function AcceptSupplier({
  params,
  setIsModalClose,
}: {
  params: { id: string };
  setIsModalClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminSupplierDetails(params.id);
  const { mutate: updateStatus, isPending } = useUpdateSupplierStatus();
  const t = useTranslations("admin.suppliers");

  if (isLoading) return <FullPageLoader />;
  if (!data) return <div>{t("details.notFound")}</div>;

  const handleAccept = () => {
    updateStatus(
      { supplier_id: parseInt(params.id) },
      {
        onSuccess: () => {
          toast.success("Supplier approved successfully");
          queryClient.invalidateQueries({
            queryKey: ["admin-suppliers"],
          });
          setIsModalClose();
        },
        onError: () => {
          toast.error("Failed to approve supplier");
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto px-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">
              {t("details.supplierInfo.companyName")}
            </h3>
            <p className="text-gray-600">{data?.supplier?.company_name}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Contact Person</h3>
            <p className="text-gray-600">{data?.supplier?.contact_person}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {t("details.supplierInfo.emailAddress")}
            </h3>
            <p className="text-gray-600">{data?.supplier?.email}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {t("details.supplierInfo.phoneNumber")}
            </h3>
            <p className="text-gray-600">{data?.supplier?.phone}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {t("details.supplierInfo.orgNumber")}
            </h3>
            <p className="text-gray-600">
              {data?.supplier?.organization_number}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {t("details.supplierInfo.location")}
            </h3>
            <p className="text-gray-600">
              {data?.supplier?.address}, {data?.supplier?.city}{" "}
              {data?.supplier?.postal_code}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {t("details.supplierInfo.startedYear")}
            </h3>
            <p className="text-gray-600">{data?.supplier?.started_year}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {t("details.supplierInfo.trucks")}
            </h3>
            <p className="text-gray-600">{data?.supplier?.trucks}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">About Us</h3>
            <p className="text-gray-600">{data?.supplier?.about_us}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Documents</h3>
            <div className="text-gray-600 space-y-1">
              {data?.uploaded_documents?.map((doc) => (
                <div key={doc}>
                  <button
                    onClick={() =>
                      window.open(
                        `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${doc}`,
                        "_blank"
                      )
                    }
                    className="block hover:underline"
                  >
                    {doc.split("/").pop()}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Bank Information</h3>
            <p className="text-gray-600">
              {data.supplier.bank} {data.supplier.account_number}{" "}
              {data.supplier.iban} {data.supplier.swift_code}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
        <Button variant="outline" onClick={() => setIsModalClose()}>
          {t("table.actions.cancel")}
        </Button>
        <Button onClick={handleAccept} disabled={isPending}>
          {isPending ? "Approving..." : t("table.actions.accept")}
        </Button>
      </div>
    </div>
  );
}
