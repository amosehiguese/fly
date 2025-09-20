export interface Quotation {
  id: number;
  from_city: string;
  to_city: string;
  move_date: string;
  type_of_service: string; // Adjust type if necessary (see explanation below)
  email_address: string;
  phone_number: string;
  type_of_items: string; // Adjust type if necessary (see explanation below)
  weight_of_items: string;
  location_of_lift: string;
  created_at: string;
  status: string;
  type: string;
}

export interface QuotationDetails {
  additional_insurance: number;
  created_at: string;
  date: string;
  delivery_address: string;
  distance: string;
  email: string;
  expectations: string;
  extent: string;
  extra_insurance: number;
  file_paths: string[];
  first_name: string;
  from_elevator: number;
  from_floor: number;
  from_rok: number;
  garage: number;
  home_description: string;
  id: number;
  last_name: string;
  latest_date: string;
  move_type: string;
  other: string;
  phone: string;
  pickup_address: string;
  property_size: number;
  rut_discount: number;
  service_type: string;
  services: string[];
  status: string;
  storage: string;
  to_elevator: number;
  to_floor: number;
  to_rok: number;
  to_storage: string;
}

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
  quotation: QuotationDetails;
}
