import { cn } from "@/shared/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ src, alt, fallback, size = "md", className, ...props }: AvatarProps) {
  const initials = fallback || alt?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={alt || "아바타"}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-600",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}