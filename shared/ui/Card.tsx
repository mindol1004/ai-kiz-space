"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  hover = false,
  onClick,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`
        bg-bg-primary border border-border rounded-lg
        shadow-sm p-4 sm:p-6
        transition-shadow duration-200 ease-in-out
        ${hover ? "hover:shadow-md cursor-pointer" : ""}
        ${onClick ? "w-full text-left" : ""}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}