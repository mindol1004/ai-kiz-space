"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
  secondary:
    "bg-white border border-border text-text-primary hover:bg-bg-secondary focus:ring-gray-500",
  ghost: "bg-transparent text-primary hover:bg-primary-light focus:ring-primary",
  danger: "bg-error text-white hover:bg-red-600 focus:ring-red-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          font-medium rounded-md
          transition-colors duration-150 ease
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;