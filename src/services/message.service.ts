import { apiClient } from '@/lib/api-client';
import { ApiResponse, ChatbotMessageDto, WhatsAppMessageDto } from '@/types/api.types';

export const messageService = {
  async sendChatbotMessage(dto: ChatbotMessageDto): Promise<ApiResponse<{ reply: string; slotSuggestions?: any[] }>> {
    const response = await apiClient.post<ApiResponse<{ reply: string; slotSuggestions?: any[] }>>(
      '/messages/chatbot',
      dto
    );
    return response.data;
  },

  async simulateWhatsAppWebhook(dto: WhatsAppMessageDto): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/messages/whatsapp', dto);
    return response.data;
  },
};
