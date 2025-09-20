"use client";

import { useAdminSupplierDetails } from "@/hooks/admin/useAdminSupplierDetails";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { MovingInformation } from "@/components/admin/MovingInformation";
import { BankInformation } from "@/components/admin/BankInformation";
import { SupplierDetails } from "@/components/admin/SupplierDetails";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useAdminSupplierDetails(id);
  const t = useTranslations("admin.suppliers");

  if (isLoading) return <FullPageLoader />;
  if (!data) return <div>{t("details.notFound")}</div>;

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/suppliers"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>{t("details.backToSuppliers")}</span>
        </Link>
        <h1 className="text-2xl font-bold">{data.supplier.company_name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Tabs defaultValue="information">
          <TabsList className="bg-white">
            <TabsTrigger
              className="data-[state=active]:border-b shadow-none data-[state=active]:shadow-none rounded-none data-[state=active]:bg-white bg-white border-black"
              value="information"
            >
              {t("details.tabs.movingInformation")}
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:border-b shadow-none data-[state=active]:shadow-none rounded-none data-[state=active]:bg-white bg-white border-black"
              value="bank"
            >
              {t("details.tabs.bankInformation")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="information">
            <MovingInformation
              registrationDate={data.supplier.created_at}
              totalMoves={data.totalOrders}
              totalDisputes={data.totalDisputes}
              ratings={data.ratings}
            />
          </TabsContent>
          <TabsContent value="bank">
            <BankInformation
              bank={data?.supplier.bank}
              accountNumber={data?.supplier.account_number}
              iban={data?.supplier.iban}
            />
          </TabsContent>
        </Tabs>
        <SupplierDetails supplier={data.supplier} />
      </div>
      <OrdersTable orders={data?.orders || []} />
    </div>
  );
}
