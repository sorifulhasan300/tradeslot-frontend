export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: ApiMeta;
  data?: T | null;
  errors?: Record<string, string[]>;
}

export interface Trader {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tradeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyWorkArea {
  id: string;
  traderId: string;
  postcodeOrCity: string;
  radiusMiles: number;
  date: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  traderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  postcode: string;
  serviceDescription: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String (includes job duration)
  bufferEndTime?: string; // ISO String (includes 30-min buffer gap)
  feeAmount: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  bufferEndTime: string;
  available: boolean;
}

export interface StripeAccountStatus {
  accountId: string | null;
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface CreateWorkAreaDto {
  traderId: string;
  postcodeOrCity: string;
  radiusMiles: number;
  date: string;
}

export interface CreateBookingDto {
  traderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  postcode: string;
  serviceDescription: string;
  startTime: string;
  feeAmount: number;
}

export interface ChatbotMessageDto {
  traderId: string;
  customerPhone: string;
  customerName?: string;
  message: string;
  channel?: 'WEB_CHATBOT';
}

export interface WhatsAppMessageDto {
  traderId: string;
  customerPhone: string;
  customerName?: string;
  messageText: string;
}
