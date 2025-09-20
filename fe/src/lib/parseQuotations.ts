import { Quotation } from "@/api/interfaces/admin/quotations";
import { parseArrayField } from "./parseArrayField";

// Helper function to parse JSON strings
export const parseJsonString = (jsonString: string) => {
  try {
    return parseArrayField(jsonString);
  } catch {
    return [];
  }
};

// Helper function to parse storage string
export const parseStorage = (storage: string | null) => {
  if (storage) {
    try {
      return JSON.parse(storage);
    } catch {
      return { needed: false };
    }
  }
  return { needed: false };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseQuotation = (quotation: any): Quotation => {
  const baseQuotation = {
    id: quotation.id,
    service_type: quotation.service_type,
    pickup_address: quotation.pickup_address,
    delivery_address: quotation.delivery_address,
    date: quotation.date,
    latest_date: quotation.latest_date,
    first_name: quotation.first_name,
    last_name: quotation.last_name,
    email: quotation.email,
    phone: quotation.phone,
    status: quotation.status,
    created_at: quotation.created_at,
    distance: quotation.distance,
    file_paths: quotation.file_paths,
    additional_insurance: Boolean(quotation.additional_insurance),
  };

  switch (quotation.service_type) {
    case "Heavy Lifting":
      return {
        ...baseQuotation,
        quotation_type: "heavy_lifting",
        item_type: quotation.item_type,
        item_count: quotation.item_count,
        item_value: quotation.item_value,
        item_weight: quotation.item_weight,
        from_floor: quotation.from_floor,
        from_elevator: Boolean(quotation.from_elevator),
        to_floor: quotation.to_floor,
        to_elevator: Boolean(quotation.to_elevator),
        services: parseJsonString(quotation.services),
        other: quotation.other,
        rut_discount: Boolean(quotation.rut_discount),
        extra_insurance: Boolean(quotation.extra_insurance),
      };

    case "Privacy Move":
    case "Private Move":
    case "Secrecy Move":
    case "Estate Clearance":
    case "Evacuation Move":
    case "Residential Move":
      return {
        ...baseQuotation,
        quotation_type: quotation.move_type,
        move_type: quotation.move_type,
        from_rok: quotation.from_rok,
        to_rok: quotation.to_rok,
        from_floor: quotation.from_floor,
        from_elevator: Boolean(quotation.from_elevator),
        to_floor: quotation.to_floor,
        to_elevator: Boolean(quotation.to_elevator),
        property_size: quotation.property_size,
        home_description: quotation.home_description,
        expectations: quotation.expectations,
        extent: quotation.extent,
        garage: Boolean(quotation.garage),
        storage: parseStorage(quotation.storage),
        services: parseJsonString(quotation.services),
        other: quotation.other,
        rut_discount: Boolean(quotation.rut_discount),
        extra_insurance: Boolean(quotation.extra_insurance),
      };

    case "Moving & Cleaning":
    case "Moving Cleaning":
      return {
        ...baseQuotation,
        quotation_type: "moving_cleaning",
        move_type: quotation.move_type,
        apartment: Boolean(quotation.apartment),
        villa: Boolean(quotation.villa),
        pickup_property_size: quotation.pickup_property_size,
        rok: quotation.rok,
        garage: Boolean(quotation.garage),
        storage: parseStorage(quotation.storage),
        services: parseJsonString(quotation.services),
        other: quotation.other,
        rut_discount: Boolean(quotation.rut_discount),
        extra_insurance: Boolean(quotation.extra_insurance),
      };

    case "Company Relocation":
      return {
        ...baseQuotation,
        quotation_type: "company_relocation",
        move_type: quotation.move_type,
        services: parseJsonString(quotation.services),
        additional_services: parseJsonString(quotation.additional_services),
        more_information: quotation.more_information,
        other: quotation.other,
      };

    default:
      throw new Error(`Unknown quotation type`);
  }
};

// Function to parse an array of quotations
export const parseQuotations = (quotationsData: Quotation[]): Quotation[] => {
  return quotationsData.map((quotation) => parseQuotation(quotation));
};
