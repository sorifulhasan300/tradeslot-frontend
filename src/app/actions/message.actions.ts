'use server';

import { ApiResponse, ChatbotMessageDto, WhatsAppMessageDto } from '@/types/api.types';

const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function sendChatbotMessageAction(
  dto: ChatbotMessageDto
): Promise<ApiResponse<{ reply: string; slotSuggestions?: any[] }>> {
  try {
    const res = await fetch(`${BACKEND_URL}/messages/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Failed to process chatbot message',
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error processing chatbot message',
    };
  }
}

export async function simulateWhatsAppWebhookAction(dto: WhatsAppMessageDto): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${BACKEND_URL}/messages/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Failed to simulate WhatsApp webhook',
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error simulating WhatsApp webhook',
    };
  }
}
