export interface Driver {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  license_type: string;
  vehicle_type: string;
  plate_number: string;
  license_exp_date: string;
  is_active: 1 | 0;
  is_verified: 1 | 0;
  created_at: string;
}

export interface DriverDetail extends Driver {
  total_deliveries: number;
  recent_deliveries: {
    order_id: string;
    delivery_image: string;
    signature_image: string;
    delivery_notes: string;
    created_at: string;
  }[];
  deliveryStats: {
    totalDeliveries: number;
    recentDeliveries: {
      order_id: string;
      delivery_image: string;
      signature_image: string;
      delivery_notes: string;
      created_at: string;
    }[];
  };
}

export interface DriversResponse {
  success: boolean;
  data: {
    drivers: Driver[];
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDrivers: number;
    perPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface DriverDetailResponse {
  success: boolean;
  data: DriverDetail;
}

export interface DriverLocation {
  id: number;
  full_name: string;
  current_latitude: string;
  current_longitude: string;
  last_location_update: string;
  is_sharing_location: 1 | 0;
  vehicle_type: string;
  last_update: string;
  is_online: true;
}

export interface DriversLocationResponse {
  success: true;
  message: "Driver locations retrieved successfully";
  messageSv: "Förarplatser hämtades framgångsrikt";
  data: DriverLocation[];
}
