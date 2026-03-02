"use client";

import { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "discount";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-tertiary text-text-secondary",
  primary: "bg-primary-light text-primary",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  discount: "bg-accent text-white",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;