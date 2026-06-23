import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiAlertFill,
  RiStarFill,
} from '@remixicon/react';
import * as Alert from '@/components/ui/alert';

const statusIcons = {
  success: RiCheckboxCircleFill,
  error: RiErrorWarningFill,
  warning: RiAlertFill,
  information: RiInformationFill,
  feature: RiStarFill,
};

export type ToastMessage = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  status?: 'success' | 'error' | 'warning' | 'information' | 'feature';
  duration?: number;
};

type ToastContextType = {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...message, id }]);
    
    if (message.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, message.duration || 5000);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
          {toasts.map((t) => {
            const IconComponent = statusIcons[t.status || 'information'] || RiInformationFill;
            return (
              <Alert.Root key={t.id} status={t.status || 'information'} variant="stroke" className="shadow-xl bg-bg-white-0 animate-in slide-in-from-bottom-5">
                <Alert.Icon as={IconComponent} />
              <div className="flex-1 flex flex-col pt-[2px]">
                {t.title && <div className="text-label-sm">{t.title}</div>}
                {t.description && <div className="text-paragraph-sm text-text-sub-600">{t.description}</div>}
              </div>
              <button onClick={() => removeToast(t.id)} className="shrink-0 p-1 rounded-md hover:bg-bg-weak-50">
                <Alert.CloseIcon />
              </button>
            </Alert.Root>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
