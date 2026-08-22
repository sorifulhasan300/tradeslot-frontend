import { apiClient } from '@/lib/api-client';
import { ApiResponse, AvailableSlot, Booking, BookingStatus, CreateBookingDto } from '@/types/api.types';

export interface GetBookingsQueryParams {
  traderId?: string;
  page?: number;
  limit?: number;
  status?: BookingStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const bookingService = {
  async getAllBookings(params?: GetBookingsQueryParams): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/bookings', {
      params,
    });
    return response.data;
  },

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  async getTraderBookings(paramsOrId: string | GetBookingsQueryParams): Promise<ApiResponse<Booking[]>> {
    const params = typeof paramsOrId === 'string' ? { traderId: paramsOrId } : paramsOrId;
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/bookings/trader/${params.traderId}`, {
      params: typeof paramsOrId === 'string' ? {} : params,
    });
    return response.data;
  },

  async getAvailableSlots(traderId: string, date: string): Promise<ApiResponse<AvailableSlot[]>> {
    const response = await apiClient.get<ApiResponse<AvailableSlot[]>>(`/bookings/slots/${traderId}`, {
      params: { date },
    });
    return response.data;
  },

  async createBooking(dto: CreateBookingDto): Promise<ApiResponse<Booking>> {
    const channelMap: Record<string, string> = {
      DIRECT: 'WEB_CHAT',
      WEB_CHATBOT: 'WEB_CHATBOT',
      WHATSAPP: 'WHATSAPP',
    };

    const startDate = new Date(dto.startTime);
    const endDate = dto.endTime
      ? new Date(dto.endTime)
      : new Date(startDate.getTime() + 2 * 3600 * 1000);

    const payload = {
      traderId: dto.traderId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail || undefined,
      originChannel: dto.originChannel || channelMap[dto.channel || ''] || 'WEB_CHATBOT',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      flatBookingFee: Math.round(Number(dto.flatBookingFee ?? dto.feeAmount ?? 0)),
      jobAmount: Math.round(Number(dto.jobAmount ?? 0)),
      bufferMinutes: dto.bufferMinutes ?? 30,
    };

    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', payload);
    return response.data;
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<ApiResponse<Booking>> {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
    return response.data;
  },
};
