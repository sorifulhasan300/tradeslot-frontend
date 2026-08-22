'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Bot, Smartphone } from 'lucide-react';
import { useSimulator } from '@/hooks/useSimulator';
import { SimulatorHeader } from '@/components/modules/simulator/SimulatorHeader';
import { WebChatbotForm } from '@/components/modules/simulator/WebChatbotForm';
import { WhatsAppForm } from '@/components/modules/simulator/WhatsAppForm';
import { LiveChatPreview } from '@/components/modules/simulator/LiveChatPreview';
import { TechnicalJsonViewer } from '@/components/modules/simulator/TechnicalJsonViewer';

export default function SimulatorPage() {
  const {
    user,
    activeTab,
    setActiveTab,
    showTechnicalDetails,
    setShowTechnicalDetails,
    chatFeed,
    lastJsonResponse,
    defaultChatbotValues,
    defaultWhatsAppValues,
    isSendingChatbot,
    isSendingWhatsApp,
    submitChatbot,
    submitWhatsApp,
    clearChat,
  } = useSimulator();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <SimulatorHeader
        user={user}
        showTechnicalDetails={showTechnicalDetails}
        onToggleTechnicalDetails={() => setShowTechnicalDetails(!showTechnicalDetails)}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Intake Tabs */}
        <div className="lg:col-span-6 space-y-4">
          <Tabs
            defaultValue="WEB_CHATBOT"
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-muted/80 dark:bg-slate-900 border border-border dark:border-slate-800 p-1.5 rounded-xl shadow-inner">
              <TabsTrigger
                value="WEB_CHATBOT"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all font-semibold text-xs sm:text-sm shadow-sm"
              >
                <Bot className="h-4.5 w-4.5" />
                Web Chatbot Assistant
              </TabsTrigger>
              <TabsTrigger
                value="WHATSAPP"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all font-semibold text-xs sm:text-sm shadow-sm"
              >
                <Smartphone className="h-4.5 w-4.5" />
                WhatsApp Message
              </TabsTrigger>
            </TabsList>

            <TabsContent value="WEB_CHATBOT" className="mt-4">
              <WebChatbotForm
                defaultValues={defaultChatbotValues}
                isSending={isSendingChatbot}
                onSubmit={submitChatbot}
              />
            </TabsContent>

            <TabsContent value="WHATSAPP" className="mt-4">
              <WhatsAppForm
                defaultValues={defaultWhatsAppValues}
                isSending={isSendingWhatsApp}
                onSubmit={submitWhatsApp}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Live Chat Feed & Tech Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <LiveChatPreview chatFeed={chatFeed} onClearChat={clearChat} />

          {showTechnicalDetails && (
            <TechnicalJsonViewer lastJsonResponse={lastJsonResponse} />
          )}
        </div>
      </div>
    </div>
  );
}
