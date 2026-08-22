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
  address?: string;
  postcode?: string;
  serviceDescription?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String (includes job duration)
  bufferEndTime?: string; // ISO String (includes 30-min buffer gap)
  bufferMinutes?: number;
  feeAmount?: number;
  flatBookingFee?: number;
  jobAmount?: number;
  totalAmount?: number;
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED' | string;
  status: BookingStatus;
  trader?: {
    id?: string;
    displayName?: string;
    bio?: string;
    user?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };
  payment?: {
    id?: string;
    amount?: number;
    depositAmount?: number;
    status?: string;
  };
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

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'PAID' | string;

export interface Payment {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string;
  amountTotal: number;
  platformFee: number;
  traderPayoutAmount: number;
  status: PaymentStatus;
  stripeTransferId?: string | null;
  stripeChargeId?: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: Booking;
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
  address?: string;
  postcode?: string;
  serviceDescription?: string;
  startTime: string;
  endTime?: string;
  feeAmount?: number;
  flatBookingFee?: number;
  originChannel?: 'WHATSAPP' | 'WEB_CHAT' | 'WEB_CHATBOT' | 'SMS' | 'TELEGRAM' | 'EMAIL' | 'VOICE';
  channel?: string;
  bufferMinutes?: number;
  jobAmount?: number;
}

export interface ChatbotMessageDto {
  traderId?: string;
  customerName?: string;
  customerPhone?: string;
  senderId?: string;
  message: string;
  postcodeOrCity?: string;
  preferredTimeSlot?: string;
  channel?: 'WEB_CHATBOT';
}

export interface WhatsAppMessageDto {
  fromPhone?: string;
  from?: string;
  toPhone?: string;
  messageBody?: string;
  messageText?: string;
  text?: string;
  whatsappMessageId?: string;
  traderId?: string;
  customerPhone?: string;
  customerName?: string;
}

