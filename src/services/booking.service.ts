import { apiClient } from '@/lib/api-client';
import { ApiResponse, AvailableSlot, Booking, BookingStatus, CreateBookingDto } from '@/types/api.types';

export interface GetBookingsQueryParams {
  traderId: string;
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
  async getTraderBookings(params: GetBookingsQueryParams): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/bookings/trader/${params.traderId}`, {
      params,
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
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', dto);
    return response.data;
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<ApiResponse<Booking>> {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
    return response.data;
  },
};
