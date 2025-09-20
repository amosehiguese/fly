export interface BaseQuotation {
  id: number;
  service_type: string;
  pickup_address: string;
  delivery_address: string;
  date: string;
  latest_date: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  distance: string;
  file_paths: string;
  additional_insurance: boolean;
}

// Heavy Lifting specific interface
export interface HeavyLiftingQuotation extends BaseQuotation {
  quotation_type: "heavy_lifting";
  item_type: string;
  item_count: number;
  item_value: string;
  item_weight: string;
  from_floor: number;
  from_elevator: boolean;
  to_floor: number;
  to_elevator: boolean;
  services: string | string[];
  other: string | null;
  rut_discount: boolean;
  extra_insurance: boolean;
}

// Residential Move interface (for both privacy, secrecy, estate clearance and evacuation)
export interface ResidentialMoveQuotation extends BaseQuotation {
  quotation_type:
    | "privacy_move"
    | "evacuation_move"
    | "estate_clearance"
    | "secrecy_move";
  move_type: string;
  from_rok: number;
  to_rok: number;
  from_floor: number;
  from_elevator: boolean;
  to_floor: number;
  to_elevator: boolean;
  property_size: number;
  home_description: string;
  expectations: string;
  extent: string;
  garage: number;
  garage_description: string;
  storage: string;
  services: string | string[];
  other: string | null;
  rut_discount: boolean;
  extra_insurance: boolean;
}

// Moving & Cleaning interface
export interface MovingCleaningQuotation extends BaseQuotation {
  quotation_type: "moving_cleaning";
  move_type: string;
  apartment: boolean;
  villa: boolean;
  pickup_property_size: number;
  rok: number;
  garage: boolean;
  storage: string;
  services: string | string[];
  other: string | null;
  rut_discount: boolean;
  extra_insurance: boolean;
}

// Company Relocation interface
export interface CompanyRelocationQuotation extends BaseQuotation {
  quotation_type: "company_relocation";
  move_type: string;
  services: string | string[];
  additional_services: string | string[];
  more_information: string;
  other: string;
}

// Union type of all quotation types
export type Quotation =
  | HeavyLiftingQuotation
  | ResidentialMoveQuotation
  | MovingCleaningQuotation
  | CompanyRelocationQuotation;

export interface QuotationsResponse {
  message: string;
  total: number;
  page: number;
  limit: number;
  // totalPages: number;
  data: Quotation[];
}

export interface QuotationResponse {
  message: string;
  data: Quotation;
}
