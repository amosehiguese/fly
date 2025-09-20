import { SupplierDetails as ISupplierDetails } from "@/api/interfaces/admin/suppliers";
import { InitiateChatButton } from "../InitiateChatButton";
import { useTranslations } from "next-intl";

interface SupplierDetailsProps {
  supplier: ISupplierDetails;
}

export function SupplierDetails({ supplier }: SupplierDetailsProps) {
  const t = useTranslations("admin.suppliers.details");

  return (
    <div className="bg-white rounded-lg p-6 shadow dark:text-black">
      <h2 className="text-lg font-semibold mb-4">{t("supplierInfo.title")}</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">{t("supplierInfo.companyName")}</h3>
          <p className="text-gray-600">{supplier.company_name}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">{t("supplierInfo.phoneNumber")}</h3>
          <p className="text-gray-600">{supplier.phone}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">{t("supplierInfo.location")}</h3>
          <p className="text-gray-600">{supplier.city}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">{t("supplierInfo.emailAddress")}</h3>
          <p className="text-gray-600">{supplier.email}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">{t("supplierInfo.orgNumber")}</h3>
          <p className="text-gray-600">{supplier.organization_number}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">{t("supplierInfo.startedYear")}</h3>
          <p className="text-gray-600">{supplier.started_year}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">{t("supplierInfo.trucks")}</h3>
          <p className="text-gray-600">{supplier.trucks}</p>
        </div>
        <InitiateChatButton
          isAdmin
          recipientType="supplier"
          recipientId={supplier.id}
        />
      </div>
    </div>
  );
}
