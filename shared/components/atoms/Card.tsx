"use client";

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({
  hover = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-bg-primary
        border border-border
        rounded-lg
        shadow-sm
        ${hover ? "hover:shadow-md transition-shadow duration-200" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({
  className = "",
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`px-4 py-3 border-b border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({
  className = "",
  children,
  ...props
}: CardBodyProps) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({
  className = "",
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`px-4 py-3 border-t border-border bg-bg-secondary rounded-b-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;