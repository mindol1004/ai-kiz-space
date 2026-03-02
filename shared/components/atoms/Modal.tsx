"use client";

import {
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const modalElement = modalRef.current;
      if (modalElement) {
        modalElement.focus();
      }

      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
        if (e.key === "Tab" && modalElement) {
          const focusableElements = modalElement.querySelectorAll<
            HTMLButtonElement | HTMLInputElement | HTMLAnchorElement | HTMLSelectElement
          >(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown);
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeStyles[size]}
          bg-bg-primary
          rounded-lg shadow-xl
          transform transition-all duration-200
        `}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-text-primary"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-text-tertiary hover:text-text-primary transition-colors rounded-md hover:bg-bg-tertiary"
                aria-label="모달 닫기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  variant = "primary",
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-tertiary rounded-md hover:bg-bg-secondary transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
            variant === "danger"
              ? "bg-error hover:bg-red-600"
              : "bg-primary hover:bg-primary-hover"
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;