"use client";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "discount";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "bg-bg-tertiary text-text-secondary",
  primary: "bg-primary-light text-primary",
  success: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  error: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  discount: "bg-accent text-white",
};

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}