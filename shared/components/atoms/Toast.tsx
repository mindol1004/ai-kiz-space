"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const SuccessIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const toastConfigs: Record<
  ToastType,
  { icon: ReactNode; bgColor: string; borderColor: string; iconColor: string }
> = {
  success: {
    icon: <SuccessIcon />,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
  },
  error: {
    icon: <ErrorIcon />,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
  },
  warning: {
    icon: <WarningIcon />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-500",
  },
  info: {
    icon: <InfoIcon />,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
  },
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const { icon, bgColor, borderColor, iconColor } = toastConfigs[toast.type];

  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4
        ${bgColor} ${borderColor}
        border rounded-lg shadow-lg
        min-w-[300px] max-w-[400px]
        animate-in slide-in-from-right fade-in duration-200
      `}
      role="alert"
      aria-live="polite"
    >
      <span className={iconColor}>{icon}</span>
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-text-tertiary hover:text-text-secondary transition-colors"
        aria-label="토스트 알림 닫기"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (typeof document === "undefined" || toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-z-toast flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용 가능합니다.");
  }
  return context;
}

export function ToastSuccess({ message }: { message: string }) {
  const { addToast } = useToast();
  useEffect(() => addToast("success", message), [message, addToast]);
  return null;
}

export function ToastError({ message }: { message: string }) {
  const { addToast } = useToast();
  useEffect(() => addToast("error", message), [message, addToast]);
  return null;
}

export default ToastProvider;