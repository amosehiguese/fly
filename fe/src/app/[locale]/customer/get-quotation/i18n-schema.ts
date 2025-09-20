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

// Company Relocation with translations
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
    distance: z.string().optional(),
    other: z.string().optional(),
    more_information: z.string().optional(),
    photos: z
      .array(z.instanceof(File))
      .max(5, t("validation.maxPhotos"))
      .optional(),
  });

// Move Out Cleaning with translations
export const createMoveOutCleaningSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().default("Moving & Cleaning"),
      move_type: z.string().min(2, t("validation.moveTypeRequired")),
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

// Heavy Lifting with translations
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

// Estate Clearance with translations
export const createEstateClearanceSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      move_type: z.string().min(2, t("validation.moveTypeRequired")),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(5, t("validation.expectationsRequired")),
      distance: z.string().optional(),
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

// Evacuation Move with translations
export const createEvacuationMoveSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      move_type: z.string().min(2, t("validation.moveTypeRequired")),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(5, t("validation.expectationsRequired")),
      extent: z.string().min(1, t("validation.serviceExtentRequired")),
      garage: z.boolean(),
      garage_description: z.string().optional(),
      distance: z.string().optional(),
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

// Privacy Move with translations
export const createPrivacyMoveSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      move_type: z.string().min(2, t("validation.moveTypeRequired")),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(5, t("validation.expectationsRequired")),
      extent: z.string().min(1, t("validation.serviceExtentRequired")),
      garage: z.boolean(),
      garage_description: z.string().optional(),
      distance: z.string().optional(),
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

export const createSecrecyMoveSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      ...createBaseQuotationSchema(t).shape,
      service_type: z.string().min(1, t("validation.serviceTypeRequired")),
      from_floor: z.string().min(1, t("validation.fromFloorNumberRequired")),
      to_floor: z.string().min(1, t("validation.toFloorNumberRequired")),
      move_type: z.string().min(2, t("validation.moveTypeRequired")),
      from_rok: z.number().min(1, t("validation.fromFloorRequired")),
      to_rok: z.number().min(1, t("validation.toFloorRequired")),
      property_size: z.number().min(1, t("validation.propertySizeRequired")),
      home_description: z
        .string()
        .min(2, t("validation.homeDescriptionRequired")),
      expectations: z.string().min(5, t("validation.expectationsRequired")),
      extent: z.string().min(1, t("validation.serviceExtentRequired")),
      garage: z.boolean(),
      garage_description: z.string().optional(),
      distance: z.string().optional(),
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
export type HeavyLifting = z.infer<ReturnType<typeof createHeavyLiftingSchema>>;
export type EstateClearance = z.infer<
  ReturnType<typeof createEstateClearanceSchema>
>;
export type EvacuationMove = z.infer<
  ReturnType<typeof createEvacuationMoveSchema>
>;
export type PrivacyMove = z.infer<ReturnType<typeof createPrivacyMoveSchema>>;
export type SecrecyMove = z.infer<ReturnType<typeof createSecrecyMoveSchema>>;
