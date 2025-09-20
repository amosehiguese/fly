import { getTranslations } from "next-intl/server";

export default async function Page({
  searchParams,
}: {
  searchParams: { name: string };
}) {
  const name = (await searchParams).name;
  const t = await getTranslations();

  return (
    <div className="bg-[#F8F8FB] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            {t("termsConditions.general.title")}
          </h1>

          <div className="prose max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.parties.title")}
              </h2>
              <p className="mb-4">
                {t("termsConditions.general.parties.content", {
                  name: name || "Customer",
                })}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.scope.title")}
              </h2>
              <p className="mb-4">
                {t("termsConditions.general.scope.content")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.customerResponsibilities.title")}
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                {t
                  .raw("termsConditions.general.customerResponsibilities.items")
                  .map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.payment.title")}
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                {t
                  .raw("termsConditions.general.payment.items")
                  .map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.cancellation.title")}
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                {t
                  .raw("termsConditions.general.cancellation.items")
                  .map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.liability.title")}
              </h2>
              <ul className="list-disc pl-8 space-y-2">
                {t
                  .raw("termsConditions.general.liability.items")
                  .map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.complaints.title")}
              </h2>
              <p className="mb-4">
                {t("termsConditions.general.complaints.content")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.disputeResolution.title")}
              </h2>
              <p className="mb-4">
                {t("termsConditions.general.disputeResolution.content")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("termsConditions.general.miscellaneous.title")}
              </h2>
              <p className="mb-4">
                {t("termsConditions.general.miscellaneous.content")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
