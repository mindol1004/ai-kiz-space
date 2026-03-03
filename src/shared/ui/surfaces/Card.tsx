import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

type CardBodyProps = HTMLAttributes<HTMLDivElement>;

type CardFooterProps = HTMLAttributes<HTMLDivElement>;

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

export function CardBody({
  className = "",
  children,
  ...props
}: CardBodyProps) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>;
}

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