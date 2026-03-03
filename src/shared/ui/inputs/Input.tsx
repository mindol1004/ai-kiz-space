"use client";

import { forwardRef, InputHTMLAttributes, useId } from "react";

type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "search"
  | "url";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: InputType;
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      label,
      error,
      helperText,
      required,
      disabled,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);

    return (
      <div className={`w-full ${className}`}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
          {required && (
            <span className="text-error ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            [error && errorId, helperText && helperId]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`
            w-full px-3 py-2
            text-sm text-text-primary
            bg-bg-primary
            border rounded-md
            transition-colors duration-150 ease
            placeholder:text-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-primary/20
            ${
              hasError
                ? "border-error focus:border-error"
                : "border-border focus:border-primary"
            }
            ${
              disabled
                ? "bg-bg-tertiary opacity-50 cursor-not-allowed"
                : ""
            }
          `}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;