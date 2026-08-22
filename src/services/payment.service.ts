import { apiClient } from "@/lib/api-client";
import { ApiResponse, StripeAccountStatus, Payment } from "@/types/api.types";

export const paymentService = {
  /**
   * Onboard trader for Stripe payouts & Connect
   */
  async onboardTrader(
    traderId?: string,
  ): Promise<ApiResponse<{ onboardingUrl: string; accountId?: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ onboardingUrl: string; accountId?: string }>
    >("/payments/onboard", { traderId });
    return response.data;
  },

  async onboardStripe(
    traderId: string,
  ): Promise<ApiResponse<{ onboardingUrl: string; accountId?: string }>> {
    return this.onboardTrader(traderId);
  },

  /**
   * Get Stripe Express Dashboard URL for connected trader
   */
  async getStripeDashboard(
    traderId?: string,
  ): Promise<ApiResponse<{ dashboardUrl: string; url: string }>> {
    const response = await apiClient.get<ApiResponse<{ url: string; dashboardUrl?: string }>>(
      "/payments/dashboard",
      { params: traderId ? { traderId } : {} }
    );
    
    const url = response.data?.data?.url || response.data?.data?.dashboardUrl || "";
    return {
      ...response.data,
      data: {
        url,
        dashboardUrl: url,
      },
    };
  },

  async getExpressDashboardUrl(
    traderId: string,
  ): Promise<ApiResponse<{ url: string; dashboardUrl: string }>> {
    return this.getStripeDashboard(traderId);
  },

  /**
   * Fetch trader Stripe account status
   */
  async getAccountStatus(
    traderId: string,
  ): Promise<ApiResponse<StripeAccountStatus>> {
    const response = await apiClient.get<ApiResponse<StripeAccountStatus>>(
      `/payments/status/${traderId}`,
    );
    return response.data;
  },

  /**
   * Fetch all payments / transaction history
   */
  async getAllPayments(
    params?: Record<string, any>
  ): Promise<ApiResponse<Payment[]>> {
    const response = await apiClient.get<ApiResponse<Payment[]>>("/payments", {
      params,
    });
    return response.data;
  },

  /**
   * Create Payment Intent for booking deposit/checkout
   */
  async createPaymentIntent(
    payload: string | { bookingId: string; amount?: number },
  ): Promise<ApiResponse<{ clientSecret: string; paymentIntentId: string }>> {
    const body = typeof payload === "string" ? { bookingId: payload } : payload;
    const response = await apiClient.post<
      ApiResponse<{ clientSecret: string; paymentIntentId: string }>
    >("/payments/create-intent", body);
    return response.data;
  },
};

export default paymentService;
