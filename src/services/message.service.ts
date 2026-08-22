import { apiClient } from '@/lib/api-client';
import { ApiResponse, ChatbotMessageDto, WhatsAppMessageDto } from '@/types/api.types';

export const messageService = {
  /**
   * Send Web Chatbot message payload
   */
  async sendWebChatbotMessage(
    dto: Partial<ChatbotMessageDto> & { senderId?: string; message: string }
  ): Promise<ApiResponse<any>> {
    const payload = {
      senderId: dto.senderId || dto.customerPhone || dto.traderId || 'web-user-demo',
      message: dto.message,
    };
    const response = await apiClient.post<ApiResponse<any>>('/messages/chatbot', payload);
    return response.data;
  },

  async sendChatbotMessage(
    dto: ChatbotMessageDto
  ): Promise<ApiResponse<{ reply: string; slotSuggestions?: any[] }>> {
    return this.sendWebChatbotMessage(dto);
  },

  /**
   * Send WhatsApp webhook simulation payload
   */
  async sendWhatsAppMessage(
    dto: Partial<WhatsAppMessageDto> & { from?: string; text?: string; message?: string }
  ): Promise<ApiResponse<any>> {
    const payload = {
      from: dto.from || dto.customerPhone || '+447700900000',
      text: dto.text || dto.messageText || dto.message || '',
    };
    const response = await apiClient.post<ApiResponse<any>>('/messages/whatsapp', payload);
    return response.data;
  },

  async simulateWhatsAppWebhook(dto: WhatsAppMessageDto): Promise<ApiResponse<any>> {
    return this.sendWhatsAppMessage(dto);
  },
};

export default messageService;
