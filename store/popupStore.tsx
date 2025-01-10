import { create } from 'zustand';

interface PopupStore {
  visible: boolean;
  title: string;
  buttonText: string;
  redirectTo: string;
  isRedirectButtonVisible: boolean;
  isCloseButtonVisible: boolean;
  showPopup: (params: {
    title: string;
    buttonText: string;
    redirectTo: string;
    isRedirectButtonVisible?: boolean;
    isCloseButtonVisible?: boolean;
  }) => void;
  hidePopup: () => void;
}

export const usePopupStore = create<PopupStore>((set) => ({
    visible: false,
    title: '',
    buttonText: '',
    redirectTo: '',
    isRedirectButtonVisible: true, 
    isCloseButtonVisible: true,     
    showPopup: ({ title, buttonText, redirectTo, isRedirectButtonVisible = true, isCloseButtonVisible = true }) => {
      console.log('showPopup called with:', { title, buttonText, redirectTo, isRedirectButtonVisible, isCloseButtonVisible });
      set({ visible: true, title, buttonText, redirectTo, isRedirectButtonVisible, isCloseButtonVisible });
    },
    hidePopup: () => {
      console.log('hidePopup called');
      set({ visible: false, title: '', buttonText: '', redirectTo: '', isRedirectButtonVisible: true, isCloseButtonVisible: true });
    },
  }));
  
