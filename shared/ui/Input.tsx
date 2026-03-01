"use client";

import { forwardRef, InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = "text",
      placeholder,
      error,
      helperText,
      disabled = false,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

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
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            [error && errorId, helperText && helperId]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`
            w-full px-3 py-2.5 text-base
            bg-bg-primary border rounded-md
            transition-colors duration-200 ease-in-out
            placeholder:text-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-error focus:ring-error focus:border-error"
                : "border-border focus:ring-primary focus:border-primary"
            }
          `}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-sm text-error"
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