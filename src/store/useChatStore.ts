import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  traderId: string | null;
  customerPhone: string;
  customerName: string;
  setIsOpen: (isOpen: boolean) => void;
  setTraderId: (traderId: string) => void;
  setCustomerDetails: (name: string, phone: string) => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  traderId: null,
  customerPhone: '',
  customerName: '',
  setIsOpen: (isOpen) => set({ isOpen }),
  setTraderId: (traderId) => set({ traderId }),
  setCustomerDetails: (customerName, customerPhone) => set({ customerName, customerPhone }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
}));
