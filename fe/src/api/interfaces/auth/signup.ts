export interface CustomerSignupRequestBody {
  fullname: string;
  email: string;
  phone_number: string;
  gender: string;
  password: string;
}

export interface MoverSignupRequestBody {
  company_name: string;
  contact_person: string;
  address: string;
  postal_code: string;
  city: string;
  organization_number: string;
  started_year: string;
  trucks: number;
  phone: string;
  email: string;
  password: string;
  about_us?: string;
  bank: string;
  account_number: string;
  iban: string;
  swift_code: string;
  documents: File[];
  terms: boolean;
}

export interface SignupResponse {
  message: string;
  messageSv?: string;
  error?: string;
}

export interface CustomerSignupRequest {
  email: string;
  password: string;
  fullname: string;
  phone_number: string;
  gender: "male" | "female" | "other";
  order_pin: string;
}

export interface CustomerSignupResponse {
  message: string;
  data: {
    id: string;
    email: string;
  };
}
