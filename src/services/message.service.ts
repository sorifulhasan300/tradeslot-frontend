import { apiClient } from '@/lib/api-client';
import { ApiResponse, ChatbotMessageDto, WhatsAppMessageDto } from '@/types/api.types';

export const messageService = {
  /**
   * Send Web Chatbot message payload
   */
  async sendWebChatbotMessage(
    dto: ChatbotMessageDto
  ): Promise<ApiResponse<any>> {
    const payload = {
      senderId: dto.senderId || dto.customerPhone || dto.traderId || 'web-user-demo',
      message: dto.message,
      traderId: dto.traderId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      postcodeOrCity: dto.postcodeOrCity,
      preferredTimeSlot: dto.preferredTimeSlot,
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
    dto: WhatsAppMessageDto
  ): Promise<ApiResponse<any>> {
    const fromVal = dto.fromPhone || dto.from || dto.customerPhone || 'whatsapp:+447700900088';
    const textVal = dto.messageBody || dto.text || dto.messageText || '';

    const payload = {
      from: fromVal,
      text: textVal,
      fromPhone: dto.fromPhone || fromVal,
      toPhone: dto.toPhone || 'whatsapp:+447700900000',
      messageBody: dto.messageBody || textVal,
      whatsappMessageId: dto.whatsappMessageId || `wam_id_${Date.now()}`,
    };
    const response = await apiClient.post<ApiResponse<any>>('/messages/whatsapp', payload);
    return response.data;
  },

  async simulateWhatsAppWebhook(dto: WhatsAppMessageDto): Promise<ApiResponse<any>> {
    return this.sendWhatsAppMessage(dto);
  },
};

export default messageService;

