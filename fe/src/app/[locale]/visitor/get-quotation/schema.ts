// types.ts
import * as z from "zod";

// Base schema for common fields
export const baseQuotationSchema = z.object({
  name: z.string().min(3, "Full name is required"),
  from_city: z.string().min(1, "From city is required"),
  to_city: z.string().min(1, "To city is required"),
  pickup_address: z.string().min(5, "Pickup address is required"),
  delivery_address: z.string().min(5, "Delivery address is required"),
  date: z.string().min(1, "Move date is required"),
  latest_date: z.string().min(1, "Latest date is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  type_of_service: z.string().min(1, "A service must be selected"),
});

// Company Relocation
export const companyRelocationSchema = z.object({
  ...baseQuotationSchema.shape,
  move_type: z.string(),
  services: z.array(z.string()).min(1, "Select at least one service"),
  additional_services: z.array(z.string()),
  service_type: z.string().default("Company Relocation"),
  distance: z.number().min(0),
  other: z.string().optional(),
  more_information: z.string().optional(),
  photos: z
    .array(z.instanceof(File))
    .max(5, "You can upload up to 5 photos")
    .optional(),
});

// Move Out Cleaning
export const moveOutCleaningSchema = z
  .object({
    ...baseQuotationSchema.shape,
    service_type: z.string().default("Moving & Cleaning"),
    move_type: z.string().min(2),
    apartment: z.boolean().default(false),
    villa: z.boolean().default(false),
    pickup_property_size: z.number().min(1, "Property size is required"),
    rok: z.number().min(1, "Number of rooms is required"),
    garage: z.boolean().default(false),
    storage: z
      .object({
        needed: z.boolean(),
        description: z.string().optional(),
      })
      .optional(),
    services: z.array(z.string()).min(1, "Select at least one service"),
    other: z.string().optional(),
    rut_discount: z.boolean().default(false),
    extra_insurance: z.boolean().default(false),
    ssn: z.string().nullable().default(null),
    distance: z.string().optional(),
    photos: z
      .array(z.instanceof(File))
      .max(5, "You can upload up to 5 photos")
      .optional(),
  })
  .refine(
    (data) => {
      // If rut_discount is true, SSN must be provided
      return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
    },
    {
      message: "SSN is required when RUT discount is selected",
      path: ["ssn"], // This targets the error to the SSN field
    }
  );

// Storage
export const storageSchema = baseQuotationSchema.extend({
  volume_of_items: z.string().min(1, "Volume of items is required"),
  storage_duration: z.string().min(1, "Storage duration is required"),
  type_of_items_to_store: z
    .array(z.string())
    .min(1, "At least one item type must be listed"),
});

// Heavy Lifting
export const heavyLiftingSchema = z
  .object({
    ...baseQuotationSchema.shape,
    service_type: z.literal("Heavy Lifting"),

    date: z.string().min(1, "Date is required"),
    latest_date: z.string().optional(),

    // Heavy Lifting specific fields
    item_type: z.string().min(1, "Select at least an Item type"),
    item_count: z
      .number({
        required_error: "Number of items is required",
        invalid_type_error: "Must be a number",
      })
      .min(1, "At least one item is required"),

    item_value: z
      .number({
        required_error: "Item value is required",
        invalid_type_error: "Must be a number",
      })
      .min(0, "Value cannot be negative"),

    item_weight: z
      .number({
        required_error: "Item weight is required",
        invalid_type_error: "Must be a number",
      })
      .min(0, "Weight cannot be negative"),

    from_floor: z.string().min(1, "Floor number is required"),

    to_floor: z.string().min(1, "Floor number is required"),

    services: z.array(z.string()).min(1, "Select at least one service"),

    other: z.string().optional(),
    rut_discount: z.boolean().default(false),
    extra_insurance: z.boolean().default(false),
    ssn: z.string().nullable().default(null),
    distance: z.string().optional(),
    photos: z
      .array(z.instanceof(File))
      .max(5, "You can upload up to 5 photos")
      .optional(),
  })
  .refine(
    (data) => {
      // If rut_discount is true, SSN must be provided
      return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
    },
    {
      message: "SSN is required when RUT discount is selected",
      path: ["ssn"], // This targets the error to the SSN field
    }
  );

export const junkRemovalSchema = z.object({
  ...baseQuotationSchema.shape,
  type_of_junk: z.array(z.string()).min(1, "Select at least one junk type"),
  junk_volume: z.string().min(1, "Please specify the volume"),
  junk_requirements: z
    .string()
    .min(10, "Please provide more details about disposal requirements"),
  hazardous_materials: z.boolean(),
  location_accessibility: z
    .string()
    .min(1, "Please describe location accessibility"),
  preferred_disposal_method: z.enum(["Standard", "Eco-Friendly", "Recycling"]),
});

// Add PrivacyMove schema
export const privacyMoveSchema = z
  .object({
    ...baseQuotationSchema.shape,
    service_type: z.string().min(1, "Service type is required"),
    move_type: z.string().min(2, "Move type is required"),
    from_rok: z.number().min(1, "From floor is required"),
    to_rok: z.number().min(1, "To floor is required"),
    from_floor: z.string().min(1, "From floor number is required"),
    to_floor: z.string().min(1, "To floor number is required"),
    property_size: z.number().min(1, "Property size is required"),
    home_description: z.string().min(2, "Home description is required"),
    expectations: z.string().min(5, "Expectations are required"),
    extent: z.string().min(1, "Service extent is required"),
    garage: z.boolean(),
    garage_description: z.string().optional(),
    storage: z.object({
      needed: z.boolean(),
      description: z.string().optional(),
    }),
    services: z
      .array(z.string())
      .min(1, "At least one service must be selected"),
    other: z.string().optional(),
    rut_discount: z.boolean(),
    extra_insurance: z.boolean(),
    ssn: z.string().nullable().default(null),
    photos: z
      .array(z.instanceof(File))
      .max(5, "Maximum 5 photos allowed")
      .optional(),
  })
  .refine(
    (data) => {
      // If rut_discount is true, SSN must be provided
      return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
    },
    {
      message: "SSN is required when RUT discount is selected",
      path: ["ssn"], // This targets the error to the SSN field
    }
  );

// Add MovingService schema
export const movingServiceSchema = z.object({
  ...baseQuotationSchema.shape,
  volume_of_items: z.number().min(1, "Volume of items is required"),
  property_size: z.number(),
  floor_details: z.string().min(1, "Floor details are required"),
  list_of_larger_items: z.array(z.string()),
  needs_packing: z.number(),
  needs_dump_service: z.number(),
  heavy_lifting_required: z.number(),
});

export const carryingAssistanceSchema = z.object({
  ...baseQuotationSchema.shape,
  type_of_items_to_carry: z
    .array(z.string())
    .min(1, "Select at least one item type"),
  standard_or_heavy: z.enum(["Standard", "Heavy"]),
  describe_carrying: z
    .string()
    .min(10, "Please provide more details about the carrying requirements"),
  // number_of_floors: z.number().min(0, "Number of floors must be 0 or greater"),
  // elevator_available: z.boolean(),
  // estimated_duration: z.string().min(1, "Please provide estimated duration"),
  photos: z.array(z.instanceof(File)).max(5, "You can upload up to 5 photos"),
});

export const evacuationMoveSchema = z
  .object({
    ...baseQuotationSchema.shape,
    service_type: z.string().min(1, "Service type is required"),

    from_floor: z.string().min(1, "From floor number is required"),
    to_floor: z.string().min(1, "To floor number is required"),
    move_type: z.enum(["apartment", "house", "office", "other"]),
    from_rok: z.number().min(1, "From floor is required"),
    to_rok: z.number().min(1, "To floor is required"),
    property_size: z.number().min(1, "Property size is required"),
    home_description: z.string().min(2, "Home description is required"),
    expectations: z.string().min(3, "Expectations are required"),
    extent: z.string().min(1, "Service extent is required"),
    garage: z.boolean(),
    garage_description: z.string().optional(),
    storage: z.object({
      needed: z.boolean(),
      description: z.string().optional(),
    }),
    services: z
      .array(z.string())
      .min(1, "At least one service must be selected"),
    other: z.string().optional(),
    rut_discount: z.boolean(),
    extra_insurance: z.boolean(),
    ssn: z.string().nullable().default(null),
    photos: z
      .array(z.instanceof(File))
      .max(5, "Maximum 5 photos allowed")
      .optional(),
  })
  .refine(
    (data) => {
      // If rut_discount is true, SSN must be provided
      return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
    },
    {
      message: "SSN is required when RUT discount is selected",
      path: ["ssn"], // This targets the error to the SSN field
    }
  );

export const estateClearanceSchema = z
  .object({
    ...baseQuotationSchema.shape,
    service_type: z.string().min(1, "Service type is required"),

    from_floor: z.string().min(1, "From floor number is required"),
    to_floor: z.string().min(1, "To floor number is required"),
    move_type: z.enum(["apartment", "house", "office", "other"]),
    from_rok: z.number().min(1, "From floor is required"),
    to_rok: z.number().min(1, "To floor is required"),
    from_elevator: z.boolean(),
    to_elevator: z.boolean(),
    property_size: z.number().min(1, "Property size is required"),
    home_description: z.string().min(2, "Home description is required"),
    expectations: z.string().min(5, "Expectations are required"),
    extent: z.string().min(1, "Service extent is required"),
    garage: z.boolean(),
    garage_description: z.string().optional(),
    storage: z.object({
      needed: z.boolean(),
      description: z.string().optional(),
    }),
    services: z
      .array(z.string())
      .min(1, "At least one service must be selected"),
    other: z.string().optional(),
    rut_discount: z.boolean(),
    extra_insurance: z.boolean(),
    ssn: z.string().nullable().default(null),
    photos: z
      .array(z.instanceof(File))
      .max(5, "Maximum 5 photos allowed")
      .optional(),
  })
  .refine(
    (data) => {
      // If rut_discount is true, SSN must be provided
      return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
    },
    {
      message: "SSN is required when RUT discount is selected",
      path: ["ssn"], // This targets the error to the SSN field
    }
  );

// Create Secrecy Move Schema (identical to Privacy Move)
export const secrecyMoveSchema = z
  .object({
    ...baseQuotationSchema.shape,
    service_type: z.string().min(1, "Service type is required"),

    from_floor: z.string().min(1, "From floor number is required"),
    to_floor: z.string().min(1, "To floor number is required"),
    move_type: z.enum(["Apartment", "House", "Office", "Other"]),
    from_rok: z.number().min(1, "From floor is required"),
    to_rok: z.number().min(1, "To floor is required"),
    from_elevator: z.boolean(),
    to_elevator: z.boolean(),
    property_size: z.number().min(1, "Property size is required"),
    home_description: z.string().min(2, "Home description is required"),
    expectations: z.string().min(5, "Expectations are required"),
    extent: z.string().min(1, "Service extent is required"),
    garage: z.boolean(),
    storage: z.object({
      needed: z.boolean(),
      description: z.string().optional(),
    }),
    services: z
      .array(z.string())
      .min(1, "At least one service must be selected"),
    other: z.string().optional(),
    rut_discount: z.boolean(),
    extra_insurance: z.boolean(),
    ssn: z.string().nullable().default(null),
    photos: z
      .array(z.instanceof(File))
      .max(5, "Maximum 5 photos allowed")
      .optional(),
  })
  .refine(
    (data) => {
      // If rut_discount is true, SSN must be provided
      return !data.rut_discount || (data.ssn && data.ssn.trim() !== "");
    },
    {
      message: "SSN is required when RUT discount is selected",
      path: ["ssn"], // This targets the error to the SSN field
    }
  );

// Add SecrecyMove type
export type SecrecyMove = z.infer<typeof secrecyMoveSchema>;

// Types based on schemas
export type BaseQuotation = z.infer<typeof baseQuotationSchema>;
export type CompanyRelocation = z.infer<typeof companyRelocationSchema>;
export type MoveOutCleaning = z.infer<typeof moveOutCleaningSchema>;
export type Storage = z.infer<typeof storageSchema>;
export type HeavyLifting = z.infer<typeof heavyLiftingSchema>;
export type EstateClearance = z.infer<typeof estateClearanceSchema>;
export type EvacuationMove = z.infer<typeof evacuationMoveSchema>;
export type JunkRemoval = z.infer<typeof junkRemovalSchema>;
export type CarryingAssistance = z.infer<typeof carryingAssistanceSchema>;
export type PrivacyMove = z.infer<typeof privacyMoveSchema>;
export type MovingService = z.infer<typeof movingServiceSchema>;

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
  | "moving-service"
  | "secrecy-move";

// API response type
export interface ApiResponse {
  success: boolean;
  message: string;
  messageSv?: string;
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
