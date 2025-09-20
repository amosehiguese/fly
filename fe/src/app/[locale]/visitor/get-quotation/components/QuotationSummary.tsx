/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { QuotationFormData } from "../schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

interface QuotationSummaryProps<T> {
  formData: T;
  onSubmit: (data: T) => void;
  isPending: boolean;
}

const SummarySection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3 mb-6">
    <h3 className="font-semibold text-lg border-b pb-2">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined | null;
}) => {
  const tCommon = useTranslations("common");
  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">
        {value === undefined || value === null
          ? "—"
          : typeof value === "boolean"
            ? value
              ? tCommon("answer.yes")
              : tCommon("answer.no")
            : value}
      </p>
    </div>
  );
};

const ArrayItems = ({
  label,
  items,
  translationPrefix,
}: {
  label: string;
  items: string[];
  translationPrefix?: string;
}) => {
  const t = useTranslations("quotation");
  return (
    <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-gray-50 p-3 rounded-md">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <span
              key={index}
              className="bg-gray-200 px-2 py-1 rounded-md text-sm"
            >
              {translationPrefix ? t(`${translationPrefix}.${item}`) : item}
            </span>
          ))
        ) : (
          <span className="text-gray-400">None selected</span>
        )}
      </div>
    </div>
  );
};

const TextAreaItem = ({ label, value }: { label: string; value: string }) => (
  <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-gray-50 p-3 rounded-md">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium whitespace-pre-line">{value || "—"}</p>
  </div>
);

export const QuotationSummary = <T extends QuotationFormData>({
  formData,
  onSubmit,
  isPending,
}: QuotationSummaryProps<T>) => {
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const tCommon = useTranslations("common");
  const tQuotation = useTranslations("quotation");
  const locale = useLocale() as "en" | "sv";

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("form data", formData);
    if (!termsAndConditions) {
      toast.error(tQuotation("common.error.termsRequired"));
      return;
    }
    onSubmit(formData);
  };

  // Common sections for all form types
  const CommonSections = () => {
    const t = useTranslations("quotation.form");
    const t2 = useTranslations("home.getQuote.form");
    return (
      <>
        <SummarySection title={tQuotation("common.logisticsInformation")}>
          <SummaryItem label={t("fromCity")} value={formData.from_city} />
          <SummaryItem label={t("toCity")} value={formData.to_city} />
          <SummaryItem
            label={t("moveDate")}
            value={
              (formData as any).date
                ? formatDateLocale((formData as any).date, locale)
                : "—"
            }
          />
          {(formData as any).pickup_address && (
            <SummaryItem
              label={t2("pickupAddress")}
              value={(formData as any).pickup_address}
            />
          )}
          {(formData as any).delivery_address && (
            <SummaryItem
              label={t2("deliveryAddress")}
              value={(formData as any).delivery_address}
            />
          )}
          {(formData as any).latest_date && (
            <SummaryItem
              label={t2("latestDate") || "Latest Date"}
              value={formatDateLocale((formData as any).latest_date, locale)}
            />
          )}
        </SummarySection>

        <SummarySection title={tQuotation("common.contactInformation")}>
          <SummaryItem
            label={tQuotation("form.fullName")}
            value={formData.name}
          />
          <SummaryItem
            label={tQuotation("form.emailAddress")}
            value={(formData as any).email}
          />
          <SummaryItem
            label={tQuotation("form.phoneNumber")}
            value={(formData as any).phone}
          />
          {(formData as any).company_name && (
            <SummaryItem
              label={tQuotation("form.companyName")}
              value={(formData as any).company_name}
            />
          )}
        </SummarySection>
      </>
    );
  };

  // Form-specific sections based on type_of_service
  const FormSpecificSection = () => {
    const serviceType = formData.type_of_service;
    const t = useTranslations("quotation");

    const formatToQuotationType = (value: string) => {
      if (value === "Private Move") return "privateMove";
      if (value === "Secrecy Move") return "secrecyMove";
      if (value === "Evacuation Move") return "evacuationMove";
      if (value === "Estate Clearance") return "estateClearance";
      return value.toLowerCase().replace(/\s+/g, "");
    };

    // Get appropriate translation functions

    // Handle the similar form types together
    if (
      [
        "Private Move",
        "Secrecy Move",
        "Estate Clearance",
        "Evacuation Move",
      ].includes(serviceType)
    ) {
      const serviceKey = formatToQuotationType(serviceType);
      const tService = (key: string) => {
        try {
          return t(`${serviceKey}.${key}`);
        } catch (e) {
          return key;
        }
      };

      return (
        <SummarySection
          title={tCommon(
            `quotationTypes.${formatToQuotationType(serviceType)}`
          )}
        >
          <SummaryItem
            label={tService("moveType")}
            value={
              (formData as any).move_type
                ? tService(`moveTypes.${(formData as any).move_type}`)
                : ""
            }
          />
          <SummaryItem
            label={tService("fromRok")}
            value={(formData as any).from_rok}
          />
          <SummaryItem
            label={tService("toRok")}
            value={(formData as any).to_rok}
          />
          <SummaryItem
            label={tService("fromFloor")}
            value={(formData as any).from_floor}
          />
          <SummaryItem
            label={tService("toFloor")}
            value={(formData as any).to_floor}
          />

          <SummaryItem
            label={tService("propertySize")}
            value={(formData as any).property_size}
          />
          <SummaryItem
            label={tService("homeDescription")}
            value={
              (formData as any).home_description
                ? tService(
                    `homeDescriptions.${(formData as any).home_description}`
                  )
                : ""
            }
          />
          <SummaryItem
            label={tService("expectations")}
            value={
              (formData as any).expectations
                ? tService(
                    `expectationOptions.${(formData as any).expectations}`
                  )
                : ""
            }
          />
          <SummaryItem
            label={tService("extent")}
            value={
              (formData as any).extent
                ? tService(`extentOptions.${(formData as any).extent}`)
                : ""
            }
          />
          <SummaryItem
            label={tService("garage")}
            value={(formData as any).garage}
          />
          {(formData as any).garage && (
            <TextAreaItem
              label={tService("garageDescription")}
              value={(formData as any).garage_description}
            />
          )}
          <SummaryItem
            label={tService("storage")}
            value={(formData as any).storage?.needed}
          />
          {(formData as any).storage?.needed && (
            <TextAreaItem
              label={tService("storageDescription")}
              value={(formData as any).storage?.description}
            />
          )}
          {(formData as any).services && (
            <ArrayItems
              label={tService("services.title")}
              items={(formData as any).services}
              translationPrefix={`${serviceKey}.services`}
            />
          )}
          {(formData as any).other && (
            <TextAreaItem
              label={tService("other")}
              value={(formData as any).other}
            />
          )}
          <SummaryItem
            label={tService("rut")}
            value={(formData as any).rut_discount}
          />
          <SummaryItem
            label={tService("insurance")}
            value={(formData as any).extra_insurance}
          />
          {(formData as any).ssn && (
            <SummaryItem
              label={tService("ssn")}
              value={(formData as any).ssn}
            />
          )}
        </SummarySection>
      );
    }

    // Handle other form types
    switch (serviceType) {
      case "Company Relocation": {
        const serviceKey = "companyRelocation";
        return (
          <SummarySection title={t("form.serviceInformation")}>
            <SummaryItem
              label={t("form.companyName")}
              value={(formData as any).company_name}
            />

            {(formData as any).other_about_move && (
              <TextAreaItem
                label={t(`${serviceKey}.other`)}
                value={(formData as any).other_about_move}
              />
            )}
            {(formData as any).move_type && (
              <SummaryItem
                label={t(`${serviceKey}.moveType`)}
                value={t(
                  `${serviceKey}.moveTypes.${(formData as any).move_type}`
                )}
              />
            )}
            {(formData as any).services &&
              Array.isArray((formData as any).services) &&
              (formData as any).services.length > 0 && (
                <ArrayItems
                  label={t(`${serviceKey}.servicesRequired`)}
                  items={(formData as any).services}
                  translationPrefix={`${serviceKey}.services`}
                />
              )}
            {(formData as any).additional_services &&
              Array.isArray((formData as any).additional_services) &&
              (formData as any).additional_services.length > 0 && (
                <ArrayItems
                  label={t(`${serviceKey}.additionalServices`)}
                  items={(formData as any).additional_services}
                  translationPrefix={`${serviceKey}.additionalServiceOptions`}
                />
              )}
            {(formData as any).other && (
              <SummaryItem
                label={t(`${serviceKey}.other`)}
                value={(formData as any).other}
              />
            )}
            {(formData as any).more_information && (
              <SummaryItem
                label={t(`${serviceKey}.specialInstructions`)}
                value={(formData as any).more_information}
              />
            )}
          </SummarySection>
        );
      }
      case "Move-Out Cleaning":
      case "Moving & Cleaning": {
        const serviceKey = "moveOutCleaning";
        return (
          <SummarySection title={t(`${serviceKey}.title`)}>
            <SummaryItem
              label={t(`${serviceKey}.propertySize`)}
              value={(formData as any).property_size}
            />
            <SummaryItem
              label={t(`${serviceKey}.numberOfRooms`)}
              value={(formData as any).number_of_rooms}
            />
            {(formData as any).specific_cleaning_requests && (
              <TextAreaItem
                label={t(`${serviceKey}.other`)}
                value={(formData as any).specific_cleaning_requests}
              />
            )}

            {(formData as any).ssn && (
              <SummaryItem
                label={t(`${serviceKey}.ssn`)}
                value={(formData as any).ssn}
              />
            )}
          </SummarySection>
        );
      }
      case "Storage": {
        const serviceKey = "storage";
        return (
          <SummarySection title={t(`${serviceKey}.title`)}>
            <SummaryItem
              label={t(`${serviceKey}.volumeOfItems`)}
              value={(formData as any).volume_of_items}
            />
            <SummaryItem
              label={t(`${serviceKey}.storageDuration`)}
              value={(formData as any).storage_duration}
            />
            {(formData as any).type_of_items_to_store && (
              <ArrayItems
                label={t(`${serviceKey}.typesOfItems`)}
                items={(formData as any).type_of_items_to_store}
                translationPrefix={`${serviceKey}.itemTypes`}
              />
            )}
            {(formData as any).ssn && (
              <SummaryItem
                label={t("privateMove.ssn")}
                value={(formData as any).ssn}
              />
            )}
          </SummarySection>
        );
      }
      case "Heavy Lifting": {
        const serviceKey = "heavyLifting";
        return (
          <SummarySection title={t(`${serviceKey}.title`)}>
            <SummaryItem
              label={t(`${serviceKey}.itemType`)}
              value={
                (formData as any).item_type
                  ? t(`${serviceKey}.itemTypes.${(formData as any).item_type}`)
                  : ""
              }
            />
            <SummaryItem
              label={t(`${serviceKey}.itemCount`)}
              value={(formData as any).item_count}
            />
            <SummaryItem
              label={t(`${serviceKey}.itemValue`)}
              value={(formData as any).item_value}
            />
            <SummaryItem
              label={t(`${serviceKey}.itemWeight`)}
              value={(formData as any).item_weight}
            />

            <SummaryItem
              label={t(`${serviceKey}.fromFloor`)}
              value={`${(formData as any).from_floor}`}
            />

            <SummaryItem
              label={t(`${serviceKey}.toFloor`)}
              value={`${(formData as any).to_floor}`}
            />

            {(formData as any).services &&
              Array.isArray((formData as any).services) &&
              (formData as any).services.length > 0 && (
                <ArrayItems
                  label={t(`${serviceKey}.services.title`)}
                  items={(formData as any).services}
                  translationPrefix={`${serviceKey}.services`}
                />
              )}

            {(formData as any).other && (
              <SummaryItem
                label={t(`${serviceKey}.other`)}
                value={(formData as any).other}
              />
            )}

            {(formData as any).extra_insurance && (
              <SummaryItem
                label={t(`${serviceKey}.insurance`)}
                value={(formData as any).extra_insurance}
              />
            )}

            {(formData as any).photos &&
              Array.isArray((formData as any).photos) &&
              (formData as any).photos.length > 0 && (
                <SummaryItem
                  label={t(`${serviceKey}.photos`)}
                  value={`${(formData as any).photos.length} photo(s)`}
                />
              )}
            {(formData as any).ssn && (
              <SummaryItem
                label={t(`${serviceKey}.ssn`)}
                value={(formData as any).ssn}
              />
            )}
          </SummarySection>
        );
      }
      case "Junk Removal": {
        const serviceKey = "junkRemoval";
        return (
          <SummarySection title={t(`${serviceKey}.title`)}>
            {(formData as any).type_of_junk && (
              <ArrayItems
                label={t(`${serviceKey}.typeOfJunk`)}
                items={(formData as any).type_of_junk}
                translationPrefix={`${serviceKey}.junkTypes`}
              />
            )}
            <SummaryItem
              label={t(`${serviceKey}.volumeOfItems`)}
              value={(formData as any).junk_volume}
            />
            <SummaryItem
              label={t(`${serviceKey}.disposalMethod`)}
              value={
                (formData as any).preferred_disposal_method
                  ? t(
                      `${serviceKey}.${(formData as any).preferred_disposal_method}`
                    )
                  : ""
              }
            />
            <SummaryItem
              label={t(`${serviceKey}.hazardousMaterials`)}
              value={(formData as any).hazardous_materials}
            />
            <TextAreaItem
              label={t(`${serviceKey}.accessibility`)}
              value={(formData as any).location_accessibility || ""}
            />
            <TextAreaItem
              label={t(`${serviceKey}.specialRequirements`)}
              value={(formData as any).junk_requirements || ""}
            />
            <SummaryItem
              label={t("privateMove.insurance")}
              value={(formData as any).extra_insurance}
            />

            {(formData as any).ssn && (
              <SummaryItem
                label={t("privateMove.ssn")}
                value={(formData as any).ssn}
              />
            )}
          </SummarySection>
        );
      }
      case "Carrying Assistance": {
        const serviceKey = "carryingAssistance";
        return (
          <SummarySection title={tCommon("quotationTypes.carryingassistance")}>
            {(formData as any).type_of_items_to_carry && (
              <ArrayItems
                label={
                  t(`${serviceKey}.typesOfItems`) || "Types of Items to Carry"
                }
                items={(formData as any).type_of_items_to_carry}
                translationPrefix={`${serviceKey}.itemTypes`}
              />
            )}
            <SummaryItem
              label={t(`${serviceKey}.weightCategory`) || "Weight Category"}
              value={(formData as any).standard_or_heavy}
            />
            <SummaryItem
              label={t(`${serviceKey}.numberOfFloors`) || "Number of Floors"}
              value={(formData as any).number_of_floors}
            />
            <SummaryItem
              label={
                t(`${serviceKey}.elevatorAvailable`) || "Elevator Available"
              }
              value={(formData as any).elevator_available}
            />
            <SummaryItem
              label={
                t(`${serviceKey}.estimatedDuration`) || "Estimated Duration"
              }
              value={(formData as any).estimated_duration}
            />
            <TextAreaItem
              label={
                t(`${serviceKey}.additionalDetails`) || "Additional Details"
              }
              value={(formData as any).describe_carrying || ""}
            />
          </SummarySection>
        );
      }
      case "Moving Service": {
        const serviceKey = "privateMove"; // Reusing privateMove translations
        return (
          <SummarySection title={tCommon("quotationTypes.movingservice")}>
            <SummaryItem
              label={t("storage.volumeOfItems")}
              value={(formData as any).volume_of_items}
            />
            <SummaryItem
              label={t(`${serviceKey}.propertySize`)}
              value={(formData as any).property_size}
            />
            <SummaryItem
              label={t(`${serviceKey}.fromFloor`)}
              value={(formData as any).from_floor}
            />
            <SummaryItem
              label={t(`${serviceKey}.toFloor`)}
              value={(formData as any).to_floor}
            />
            <SummaryItem
              label={t(`${serviceKey}.fromElevator`)}
              value={(formData as any).from_elevator}
            />
            <SummaryItem
              label={t(`${serviceKey}.toElevator`)}
              value={(formData as any).to_elevator}
            />
            {(formData as any).special_items && (
              <ArrayItems
                label={t(`${serviceKey}.specialItems`)}
                items={(formData as any).special_items}
                translationPrefix={`${serviceKey}.specialItemTypes`}
              />
            )}
            <SummaryItem
              label={t(`${serviceKey}.services.packing`)}
              value={(formData as any).packing_service}
            />
            <SummaryItem
              label={t(`${serviceKey}.services.unpacking`)}
              value={(formData as any).unpacking_service}
            />
            <SummaryItem
              label={t(`${serviceKey}.services.furnitureAssembly`)}
              value={(formData as any).assembly_service}
            />
            {(formData as any).additional_services && (
              <ArrayItems
                label={t("companyRelocation.additionalServices")}
                items={(formData as any).additional_services}
                translationPrefix="companyRelocation.additionalServiceOptions"
              />
            )}
            {(formData as any).special_requirements && (
              <TextAreaItem
                label={t(`${serviceKey}.specialInstructions`)}
                value={(formData as any).special_requirements}
              />
            )}
            {(formData as any).ssn && (
              <SummaryItem
                label={t(`${serviceKey}.ssn`)}
                value={(formData as any).ssn}
              />
            )}
          </SummarySection>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        {tQuotation("common.summaryDescription")}
      </h2>

      <CommonSections />
      <FormSpecificSection />

      <div className="flex items-center gap-2">
        <Checkbox
          id="terms-and-conditions"
          checked={termsAndConditions}
          onCheckedChange={() => setTermsAndConditions(!termsAndConditions)}
        />
        <Label htmlFor="terms-and-conditions">
          {tQuotation("common.agreeToTerms")}{" "}
          <Link
            className="text-blue-500"
            href={`/terms-conditions/general?name=${(formData as any).first_name} ${
              (formData as any).last_name
            }`}
            target="_blank"
          >
            {tQuotation("common.termsAndConditions")}
          </Link>
        </Label>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-8 py-2 text-lg"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tQuotation("common.submitting")}
            </>
          ) : (
            tQuotation("common.submit")
          )}
        </Button>
      </div>
    </div>
  );
};
