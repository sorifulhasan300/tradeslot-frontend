import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import messageService from '@/services/message.service';
import { useAuthStore } from '@/store/useAuthStore';
import { ChatItem, SimulatorChannel, ApiResponsePayload } from '@/types/simulator.types';
import { ChatbotFormValues, WhatsAppFormValues } from '@/lib/validations/simulator.schema';
import { toast } from 'sonner';

export function useSimulator() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SimulatorChannel>('WEB_CHATBOT');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [lastJsonResponse, setLastJsonResponse] = useState<ApiResponsePayload | null>(null);

  // Chat conversation feed
  const [chatFeed, setChatFeed] = useState<ChatItem[]>([
    {
      id: 'welcome_1',
      sender: 'system',
      channel: 'WEB_CHATBOT',
      text: 'Hello! Welcome to TradeSlot AI Assistant. Send a test message below to experience instant intake & dynamic booking scheduling.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Default initial values
  const defaultChatbotValues: ChatbotFormValues = {
    traderId: user?.role === 'TRADER' ? user.id : 'trader_demo_123',
    customerName: user?.name || 'Alex Morgan',
    customerPhone: user?.phone || '+447700900123',
    message: 'Hi, I need a gas boiler inspection in NW1 for tomorrow afternoon.',
    postcodeOrCity: 'NW1 4NP',
    preferredTimeSlot: '2026-08-23T14:00:00Z',
  };

  const defaultWhatsAppValues: WhatsAppFormValues = {
    fromPhone: user?.phone || '+447700900088',
    toPhone: '+447700900000',
    messageBody: 'Hello! Need urgent emergency plumbing service in SE1. What slots do you have available?',
    whatsappMessageId: `wam_id_${Date.now()}`,
  };

  // Helper for current time format
  const getFormattedTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Web Chatbot Mutation
  const chatbotMutation = useMutation<ApiResponsePayload, any, ChatbotFormValues>({
    mutationFn: (values: ChatbotFormValues) =>
      messageService.sendWebChatbotMessage({
        traderId: values.traderId,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        senderId: values.customerPhone || values.traderId || user?.id || 'web-user-demo',
        message: values.message,
        postcodeOrCity: values.postcodeOrCity,
        preferredTimeSlot: values.preferredTimeSlot,
      }),
    onSuccess: (res: ApiResponsePayload) => {
      setLastJsonResponse(res);
      setChatFeed((prev) => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          sender: 'system',
          channel: 'WEB_CHATBOT',
          text: res?.message || 'Message received! We have matched your request and normalized your details.',
          timestamp: getFormattedTime(),
          status: 'Normalized & Processed',
          rawResponse: res,
        },
      ]);
      toast.success('Chatbot inquiry processed successfully!');
    },
    onError: (error: any) => {
      const errPayload = error?.response?.data || error || {
        statusCode: error?.statusCode || 500,
        message: error?.message || 'Server Error',
      };
      setLastJsonResponse(errPayload);
      setChatFeed((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'system',
          channel: 'WEB_CHATBOT',
          text: `Unable to process request: ${errPayload.message || 'Server connection error'}`,
          timestamp: getFormattedTime(),
          status: 'Error',
          rawResponse: errPayload,
        },
      ]);
      toast.error(errPayload?.message || 'Failed to dispatch Chatbot message');
    },
  });

  // WhatsApp Mutation
  const whatsappMutation = useMutation<ApiResponsePayload, any, WhatsAppFormValues>({
    mutationFn: (values: WhatsAppFormValues) =>
      messageService.sendWhatsAppMessage({
        fromPhone: values.fromPhone.startsWith('whatsapp:')
          ? values.fromPhone
          : `whatsapp:${values.fromPhone}`,
        from: values.fromPhone.startsWith('whatsapp:')
          ? values.fromPhone
          : `whatsapp:${values.fromPhone}`,
        toPhone: values.toPhone.startsWith('whatsapp:')
          ? values.toPhone
          : `whatsapp:${values.toPhone}`,
        messageBody: values.messageBody,
        text: values.messageBody,
        whatsappMessageId: values.whatsappMessageId,
      }),
    onSuccess: (res: ApiResponsePayload) => {
      setLastJsonResponse(res);
      setChatFeed((prev) => [
        ...prev,
        {
          id: `sys_wa_${Date.now()}`,
          sender: 'system',
          channel: 'WHATSAPP',
          text: res?.message || 'WhatsApp webhook ingested successfully! Channel message normalized.',
          timestamp: getFormattedTime(),
          status: 'WhatsApp Message Ingested',
          rawResponse: res,
        },
      ]);
      toast.success('WhatsApp webhook ingested successfully!');
    },
    onError: (error: any) => {
      const errPayload = error?.response?.data || error || {
        statusCode: error?.statusCode || 500,
        message: error?.message || 'Server Error',
      };
      setLastJsonResponse(errPayload);
      setChatFeed((prev) => [
        ...prev,
        {
          id: `err_wa_${Date.now()}`,
          sender: 'system',
          channel: 'WHATSAPP',
          text: `WhatsApp intake issue: ${errPayload.message || 'Server connection error'}`,
          timestamp: getFormattedTime(),
          status: 'Error',
          rawResponse: errPayload,
        },
      ]);
      toast.error(errPayload?.message || 'Failed to dispatch WhatsApp message');
    },
  });

  // Handle Form Submissions
  const submitChatbot = (values: ChatbotFormValues) => {
    setChatFeed((prev) => [
      ...prev,
      {
        id: `cust_${Date.now()}`,
        sender: 'customer',
        channel: 'WEB_CHATBOT',
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        text: values.message,
        timestamp: getFormattedTime(),
      },
    ]);
    chatbotMutation.mutate(values);
  };

  const submitWhatsApp = (values: WhatsAppFormValues) => {
    setChatFeed((prev) => [
      ...prev,
      {
        id: `wa_cust_${Date.now()}`,
        sender: 'customer',
        channel: 'WHATSAPP',
        customerPhone: values.fromPhone,
        text: values.messageBody,
        timestamp: getFormattedTime(),
      },
    ]);
    whatsappMutation.mutate(values);
  };

  const clearChat = () => {
    setChatFeed([
      {
        id: `welcome_${Date.now()}`,
        sender: 'system',
        channel: activeTab,
        text: 'Chat history cleared. Send a new message to test the intake flow.',
        timestamp: getFormattedTime(),
      },
    ]);
    setLastJsonResponse(null);
    toast.info('Chat conversation cleared');
  };

  return {
    user,
    activeTab,
    setActiveTab,
    showTechnicalDetails,
    setShowTechnicalDetails,
    chatFeed,
    lastJsonResponse,
    defaultChatbotValues,
    defaultWhatsAppValues,
    isSendingChatbot: chatbotMutation.isPending,
    isSendingWhatsApp: whatsappMutation.isPending,
    submitChatbot,
    submitWhatsApp,
    clearChat,
  };
}
