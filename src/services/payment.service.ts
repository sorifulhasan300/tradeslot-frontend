import { apiClient } from "@/lib/api-client";
import { ApiResponse, StripeAccountStatus } from "@/types/api.types";

export const paymentService = {
  async onboardStripe(
    traderId: string,
  ): Promise<ApiResponse<{ onboardingUrl: string; accountId: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ onboardingUrl: string; accountId: string }>
    >("/payments/onboard", { traderId });
    return response.data;
  },

  async getAccountStatus(
    traderId: string,
  ): Promise<ApiResponse<StripeAccountStatus>> {
    const response = await apiClient.get<ApiResponse<StripeAccountStatus>>(
      `/payments/status/${traderId}`,
    );
    return response.data;
  },

  async getExpressDashboardUrl(
    traderId: string,
  ): Promise<ApiResponse<{ url: string }>> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(
      `/payments/dashboard/${traderId}`,
    );
    return response.data;
  },

  async createPaymentIntent(
    bookingId: string,
  ): Promise<ApiResponse<{ clientSecret: string; paymentIntentId: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ clientSecret: string; paymentIntentId: string }>
    >("/payments/create-intent", { bookingId });
    return response.data;
  },
};
