// Driver types
export interface DriverRegisterData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  licenseNumber: string;
  licenseExpDate: string;
  licenseType: string;
  vehicleType: string;
  plateNumber: string;
  vehicleRegDoc?: File;
  vehicleImage?: File;
  licenseImage?: File;
}

export interface DriverLoginCredentials {
  email: string;
  password: string;
}

export interface DriverLoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    fullname: string;
    email: string;
    phone_number: string;
    role: string;
  };
}

export interface DriverProfile {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  license_type: string;
  vehicle_type: string;
  plate_number: string;
  license_exp_date: string;
  is_active: number;
  is_verified: number;
  created_at: string;
}

export interface DriverListResponse {
  success: boolean;
  data: {
    drivers: DriverProfile[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalDrivers: number;
      perPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface Order {
  order_id: string;
  id: number;
  service_type: string;
  pickup_address: string;
  delivery_address: string;
  date: string;
  latest_date: string;
  move_type: string;
  services: string;
  additional_services: string;
  more_information: string;
  company_name: string | null;
  name: string;
  ssn: string;
  email: string;
  phone: string;
  file_paths: string;
  status: string;
  created_at: string;
  distance: string;
  order_status: string;
  supplier_name: string;
  supplier_phone: string;
  supplier_email: string;
  quotation_type: string;
}

export interface Quotationn {
  id: number;
  service_type: string;
  pickup_address: string;
  delivery_address: string;
  date: string;
  latest_date: string;
  move_type: string;
  services: string;
  additional_services: string;
  more_information: string;
  company_name: string | null;
  name: string;
  ssn: string;
  email: string;
  phone: string;
  file_paths: string;
  status: string;
  created_at: string;
  distance: string;
}

interface Supplier {
  fullname: string;
  company_name: string;
  phone: string;
  email: string;
}

interface OrderStatus {
  orderId: string;
  quotationType: string;
  deliveryStatus: string | null;
}

export interface OrderDetailsResponse {
  success: boolean;
  data: {
    quotation: Quotationn;
    supplier: Supplier;
    orderStatus: OrderStatus;
  };
}

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      perPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface AssignJobData {
  order_id: string;
  driver_id: number;
}

export interface AssignJobResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    order_id: string;
    driver_id: number;
    status: string;
    created_at: string;
  };
}

export interface ChatInitiationData {
  driver_id: number;
  supplier_id: number;
  title: string;
  message: string;
}

export interface ChatMessageData {
  conversation_id: number;
  sender_id: number;
  sender_type: "driver" | "supplier";
  message: string;
}

export interface Conversation {
  id: number;
  driver_id: number;
  supplier_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  supplier_name?: string;
  driver_name?: string;
  unread_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
  };
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    conversation: Conversation;
  };
}

export interface DriverPersonalInfo {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  isActive: number;
  isVerified: number;
  joinedAt: string;
}

export interface DriverPerformanceMetrics {
  completedDeliveries: number;
  totalAssignments: number;
  completionRate: number;
  averageRating: string;
  totalRatings: number;
}

export interface DriverRecentRatings {
  rating: number;
  comment: string;
  created_at: string;
}

export interface DriverProfile {
  personalInfo: DriverPersonalInfo;
  performanceMetrics: DriverPerformanceMetrics;
  recentRatings: DriverRecentRatings[];
}

export interface SupplierProfile {
  supplierId: number;
  companyName: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
}

export type DriverProfileResponse = {
  success: boolean;
  message: string;
  messageSv: string;
  data: DriverProfile;
};

export type DriverSupplierResponse = {
  success: boolean;
  message: string;
  messageSv: string;
  data: SupplierProfile;
};
