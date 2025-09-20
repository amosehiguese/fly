import * as z from "zod";
import { useTranslations } from "next-intl";

// Base schema for common fields with translations
export const createBaseQuotationSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z.object({
    name: z.string().min(3, t("validation.fullNameRequired")),
    from_city: z.string().min(1, t("validation.fromCityRequired")),
    to_city: z.string().min(1, t("validation.toCityRequired")),
    pickup_address: z.string().min(5, t("validation.pickupAddressRequired")),
    delivery_address: z
      .string()
      .min(5, t("validation.deliveryAddressRequired")),
    date: z.string().min(1, t("validation.moveDateRequired")),
    latest_date: z.string().min(1, t("validation.latestDateRequired")),
    email: z.string().email(t("validation.invalidEmail")),
    phone: z.string().min(10, t("validation.phoneNumberMinLength")),
    type_of_service: z.string().min(1, t("validation.serviceRequired")),
  });

// Company Relocation
export const createCompanyRelocationSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z.object({
    ...createBaseQuotationSchema(t).shape,
    company_name: z.string().min(3, t("validation.companyNameRequired")),
    move_type: z.string().min(2, t("validation.moveTypeRequired")),
    services: z.array(z.string()).min(1, t("validation.selectOneService")),
    additional_services: z.array(z.string()),
    service_type: z.string().default("Company Relocation"),
    distance: z.number().min(0),
    other: z.string().optional(),
    more_information: z.string().optional(),
    photos: z
      .array(z.instanceof(File))
      .max(5, t("validation.maxPhotos"))
      .optional(),
  });

// Move Out Cleaning
export const createMoveOutCleaningSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().default("Moving & Cleaning"),
      move_type: z.enum(["apartment", "villa"]),
      apartment: z.boolean().default(false),
      villa: z.boolean().default(false),
      pickup_property_size: z
        .number()
        .min(1, t("validation.propertySizeRequired")),
      rok: z.number().min(1, t("validation.numberOfRoomsRequired")),
      garage: z.boolean().default(false),
      storage: z
        .object({
          needed: z.boolean(),
          description: z.string().optional(),
        })
        .optional(),
      services: z.array(z.string()).min(1, t("validation.selectOneService")),
      other: z.string().optional(),
      rut_discount: z.boolean().default(false),
      extra_insurance: z.boolean().default(false),
      ssn: z.string().nullable().default(null),
      distance: z.string().optional(),
      photos: z
        .array(z.instanceof(File))
        .max(5, t("validation.maxPhotos"))
        .optional(),
    })
    .refine(
      (data) => {
        return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
      },
      {
        message: t("validation.ssnRequiredForRut"),
        path: ["ssn"],
      }
    );

// Storage
export const createStorageSchema = (t: ReturnType<typeof useTranslations>) =>
  createBaseQuotationSchema(t).extend({
    volume_of_items: z.string().min(1, t("validation.volumeRequired")),
    storage_duration: z
      .string()
      .min(1, t("validation.storageDurationRequired")),
    type_of_items_to_store: z
      .array(z.string())
      .min(1, t("validation.selectOneItemType")),
  });

// Heavy Lifting
export const createHeavyLiftingSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.literal("Heavy Lifting"),
      date: z.string().min(1, t("validation.dateRequired")),
      latest_date: z.string().optional(),
      item_type: z.string().min(1, t("validation.itemTypeRequired")),
      item_count: z
        .number({
          required_error: t("validation.itemCountRequired"),
          invalid_type_error: t("validation.mustBeNumber"),
        })
        .min(1, t("validation.minOneItem")),
      item_value: z
        .number({
          required_error: t("validation.itemValueRequired"),
          invalid_type_error: t("validation.mustBeNumber"),
        })
        .min(0, t("validation.nonNegativeValue")),
      item_weight: z
        .number({
          required_error: t("validation.itemWeightRequired"),
          invalid_type_error: t("validation.mustBeNumber"),
        })
        .min(0, t("validation.nonNegativeWeight")),
      from_floor: z.string().min(1, t("validation.floorNumberRequired")),
      to_floor: z.string().min(1, t("validation.floorNumberRequired")),
      services: z.array(z.string()).min(1, t("validation.selectOneService")),
      other: z.string().optional(),
      rut_discount: z.boolean().default(false),
      extra_insurance: z.boolean().default(false),
      ssn: z.string().nullable().default(null),
      distance: z.string().optional(),
      photos: z
        .array(z.instanceof(File))
        .max(5, t("validation.maxPhotos"))
        .optional(),
    })
    .refine(
      (data) => {
        return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
      },
      {
        message: t("validation.ssnRequiredForRut"),
        path: ["ssn"],
      }
    );

export const createJunkRemovalSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z.object({
    ...createBaseQuotationSchema(t).shape,
    type_of_junk: z.array(z.string()).min(1, t("validation.selectOneJunkType")),
    junk_volume: z.string().min(1, t("validation.volumeRequired")),
    junk_requirements: z.string().min(10, t("validation.requirementsRequired")),
    hazardous_materials: z.boolean(),
    location_accessibility: z
      .string()
      .min(1, t("validation.accessibilityRequired")),
    preferred_disposal_method: z.enum([
      "Standard",
      "Eco-Friendly",
      "Recycling",
    ]),
  });

// Add PrivacyMove schema
export const createPrivacyMoveSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      move_type: z.string().min(2, t("validation.moveTypeRequired")),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(5, t("validation.expectationsRequired")),
      extent: z.string().min(1, t("validation.serviceExtentRequired")),
      garage: z.boolean(),
      garage_description: z.string().optional(),
      storage: z.object({
        needed: z.boolean(),
        description: z.string().optional(),
      }),
      services: z.array(z.string()).min(1, t("validation.selectOneService")),
      other: z.string().optional(),
      rut_discount: z.boolean(),
      extra_insurance: z.boolean(),
      ssn: z.string().nullable().default(null),
      photos: z
        .array(z.instanceof(File))
        .max(5, t("validation.maxPhotos"))
        .optional(),
    })
    .refine(
      (data) => {
        return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
      },
      {
        message: t("validation.ssnRequiredForRut"),
        path: ["ssn"],
      }
    );

// Add MovingService schema
export const createMovingServiceSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z.object({
    ...createBaseQuotationSchema(t).shape,
    volume_of_items: z.number().min(1, t("validation.volumeRequired")),
    property_size: z.number(),
    floor_details: z.string().min(1, t("validation.floorDetailsRequired")),
    list_of_larger_items: z.array(z.string()),
    needs_packing: z.number(),
    needs_dump_service: z.number(),
    heavy_lifting_required: z.number(),
  });

export const createCarryingAssistanceSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z.object({
    ...createBaseQuotationSchema(t).shape,
    type_of_items_to_carry: z
      .array(z.string())
      .min(1, t("validation.selectOneItemType")),
    standard_or_heavy: z.enum(["Standard", "Heavy"]),
    describe_carrying: z
      .string()
      .min(10, t("validation.carryingDescriptionRequired")),
    photos: z.array(z.instanceof(File)).max(5, t("validation.maxPhotos")),
  });

export const createEvacuationMoveSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      move_type: z.enum(["apartment", "house", "office", "other"]),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(3, t("validation.expectationsRequired")),
      extent: z.string().min(1, t("validation.serviceExtentRequired")),
      garage: z.boolean(),
      garage_description: z.string().optional(),
      storage: z.object({
        needed: z.boolean(),
        description: z.string().optional(),
      }),
      services: z.array(z.string()).min(1, t("validation.selectOneService")),
      other: z.string().optional(),
      rut_discount: z.boolean(),
      extra_insurance: z.boolean(),
      ssn: z.string().nullable().default(null),
      photos: z
        .array(z.instanceof(File))
        .max(5, t("validation.maxPhotos"))
        .optional(),
    })
    .refine(
      (data) => {
        return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
      },
      {
        message: t("validation.ssnRequiredForRut"),
        path: ["ssn"],
      }
    );

export const createEstateClearanceSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      move_type: z.enum(["apartment", "house", "office", "other", "terrace"]),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      from_elevator: z.boolean(),
      to_elevator: z.boolean(),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(5, t("validation.expectationsRequired")),
      extent: z.string().min(1, t("validation.serviceExtentRequired")),
      garage: z.boolean(),
      garage_description: z.string().optional(),
      storage: z.object({
        needed: z.boolean(),
        description: z.string().optional(),
      }),
      services: z.array(z.string()).min(1, t("validation.selectOneService")),
      other: z.string().optional(),
      rut_discount: z.boolean(),
      extra_insurance: z.boolean(),
      ssn: z.string().nullable().default(null),
      photos: z
        .array(z.instanceof(File))
        .max(5, t("validation.maxPhotos"))
        .optional(),
    })
    .refine(
      (data) => {
        return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
      },
      {
        message: t("validation.ssnRequiredForRut"),
        path: ["ssn"],
      }
    );

// Create Secrecy Move Schema (identical to Privacy Move)
export const createSecrecyMoveSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      move_type: z.enum(["apartment", "house", "office", "other"]),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      from_elevator: z.boolean(),
      to_elevator: z.boolean(),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(5, t("validation.expectationsRequired")),
      extent: z.string().min(1, t("validation.serviceExtentRequired")),
      garage: z.boolean(),
      garage_description: z.string().optional(),
      storage: z.object({
        needed: z.boolean(),
        description: z.string().optional(),
      }),
      services: z.array(z.string()).min(1, t("validation.selectOneService")),
      other: z.string().optional(),
      rut_discount: z.boolean(),
      extra_insurance: z.boolean(),
      ssn: z.string().nullable().default(null),
      photos: z
        .array(z.instanceof(File))
        .max(5, t("validation.maxPhotos"))
        .optional(),
    })
    .refine(
      (data) => {
        return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
      },
      {
        message: t("validation.ssnRequiredForRut"),
        path: ["ssn"],
      }
    );

// Add SecrecyMove type

// Types based on schemas
export type BaseQuotation = z.infer<
  ReturnType<typeof createBaseQuotationSchema>
>;
export type CompanyRelocation = z.infer<
  ReturnType<typeof createCompanyRelocationSchema>
>;
export type MoveOutCleaning = z.infer<
  ReturnType<typeof createMoveOutCleaningSchema>
>;
export type Storage = z.infer<ReturnType<typeof createStorageSchema>>;
export type HeavyLifting = z.infer<ReturnType<typeof createHeavyLiftingSchema>>;
export type JunkRemoval = z.infer<ReturnType<typeof createJunkRemovalSchema>>;
export type CarryingAssistance = z.infer<
  ReturnType<typeof createCarryingAssistanceSchema>
>;
export type EstateClearance = z.infer<
  ReturnType<typeof createEstateClearanceSchema>
>;
export type EvacuationMove = z.infer<
  ReturnType<typeof createEvacuationMoveSchema>
>;
export type PrivacyMove = z.infer<ReturnType<typeof createPrivacyMoveSchema>>;
export type SecrecyMove = z.infer<ReturnType<typeof createSecrecyMoveSchema>>;

export type MovingService = z.infer<
  ReturnType<typeof createMovingServiceSchema>
>;

export type QuotationType =
  | "company-relocation"
  | "move-out-cleaning"
  | "storage"
  | "heavy-lifting"
  | "carrying-assistance"
  | "junk-removal"
  | "estate-clearance"
  | "evacuation-move"
  | "private-move"
  | "moving-service";

// API response type
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export type QuotationFormData =
  | CompanyRelocation
  | MoveOutCleaning
  | Storage
  | HeavyLifting
  | CarryingAssistance
  | JunkRemoval
  | EstateClearance
  | EvacuationMove
  | PrivacyMove
  | MovingService;
