export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
export type BookingFollowUpStatus =
  | 'pending'
  | 'follow_up_needed'
  | 'scheduled'
  | 'completed'
  | 'not_required';

export interface CrmBookingListItem {
  id: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;

  tour_id: number;
  tour_title: string | null;
  tour_slug?: string | null;
  tour_image_url?: string | null;

  travel_date: string | null;
  guests: number | null;

  status: BookingStatus | null;
  payment_status: PaymentStatus | null;
  total_amount_paise: number;

  ops_notes?: string | null;
  follow_up_status?: BookingFollowUpStatus | null;
  follow_up_date?: string | null;
  follow_up_note?: string | null;

  created_at: string | null;
}

export interface CrmBookingListResponse {
  items: CrmBookingListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CrmTravellerDocument {
  id: number;
  booking_id: number;
  traveller_id: number;
  doc_type: string;
  doc_label?: string | null;
  status?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  rejection_reason?: string | null;
  uploaded_at?: string | null;
  updated_at?: string | null;
}

export interface CrmTraveller {
  id: number;
  booking_id: number;
  full_name: string;
  age?: number | null;
  email?: string | null;
  phone?: string | null;
  passport_number?: string | null;
  documents?: CrmTravellerDocument[];
}

export interface CrmBookingDetailResponse {
  booking: {
    id: number;
    tour_id: number;
    user_id?: number | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    guests: number | null;
    travel_date: string | null;
    departure_id?: number | null;
    total_amount_paise: number;
    payment_status: PaymentStatus | null;
    status: BookingStatus | null;
    created_at: string | null;

    ops_notes?: string | null;
    follow_up_status?: BookingFollowUpStatus | null;
    follow_up_date?: string | null;
    follow_up_note?: string | null;

    tour?: {
      id: number;
      title: string | null;
      slug?: string | null;
      image_url?: string | null;
    } | null;
  };

  booking_details?: {
    id: number;
    booking_id: number;
    tour_id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    days?: number | null;
    adults?: number | null;
    children?: number | null;
    child_ages?: string | null;
    hotel_rating?: string | null;
    meal_plan?: string | null;
    flight_option?: string | null;
    flight_number?: string | null;
    travel_date?: string | null;
    departure_id?: number | null;
  } | null;

  travellers: CrmTraveller[];

  payments?: Array<{
    id: number;
    booking_id: number;
    amount_paise: number;
    status: string | null;
    currency?: string | null;
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
    created_at?: string | null;
  }>;
}

export interface CrmTravellerDocumentItem {
  id: number;
  booking_id: number;
  traveller_id: number;
  doc_type: 'passport' | 'visa' | 'id_proof' | 'supporting' | string;
  doc_label?: string | null;
  status: 'not_uploaded' | 'pending' | 'verified' | 'rejected' | string;
  file_url?: string | null;
  file_name?: string | null;
  rejection_reason?: string | null;
  uploaded_at?: string | null;
  updated_at?: string | null;
}

export interface CrmBookingTravellerItem {
  id: number;
  booking_id: number;
  full_name: string;
  age?: number | null;
  passport_number?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  document_summary: {
    passport: string;
    visa: string;
    id_proof: string;
    supporting_count: number;
  };
  documents: CrmTravellerDocumentItem[];
}

export interface CrmBookingTravellersResponse {
  items: CrmBookingTravellerItem[];
}
