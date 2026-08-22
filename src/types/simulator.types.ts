import { ApiResponse } from '@/types/api.types';

export type SimulatorChannel = 'WEB_CHATBOT' | 'WHATSAPP';

export type ChatSender = 'customer' | 'system';

export interface ChatItem {
  id: string;
  sender: ChatSender;
  channel: SimulatorChannel;
  customerName?: string;
  customerPhone?: string;
  text: string;
  timestamp: string;
  status?: string;
  rawResponse?: Record<string, unknown> | ApiResponse<unknown> | null;
}

export type ApiResponsePayload = ApiResponse<any> | Record<string, any>;
