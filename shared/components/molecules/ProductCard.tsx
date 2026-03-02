"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "../atoms/Badge";

export interface ProductSummary {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  categorySlug: string;
}

interface ProductCardProps {
  product: ProductSummary;
  isWished?: boolean;
  onWishlistToggle?: (productId: string) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
  }).format(price);
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating) ? "text-secondary" : "text-gray-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-text-tertiary">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}

function WishlistButton({
  isWished,
  onClick,
}: {
  isWished: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`p-1.5 rounded-full transition-colors ${
        isWished
          ? "bg-accent text-white"
          : "bg-white/80 text-text-tertiary hover:text-accent"
      }`}
      aria-label={isWished ? "위시리스트 제거" : "위시리스트 추가"}
    >
      <svg
        className="w-4 h-4"
        fill={isWished ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

export function ProductCard({
  product,
  isWished = false,
  onWishlistToggle,
}: ProductCardProps) {
  const { id, name, brand, price, originalPrice, discountRate, imageUrl, rating, reviewCount, categorySlug } = product;

  const href = `/shop/product/${id}`;

  return (
    <article className="group relative">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-bg-tertiary">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
          {discountRate !== undefined && discountRate > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="discount">{discountRate}%</Badge>
            </div>
          )}
          {onWishlistToggle && (
            <div className="absolute top-2 right-2">
              <WishlistButton
                isWished={isWished}
                onClick={() => onWishlistToggle(id)}
              />
            </div>
          )}
        </div>
        <div className="mt-2.5 space-y-1">
          <p className="text-xs text-text-tertiary">{brand}</p>
          <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            {originalPrice !== undefined && originalPrice > price && (
              <span className="text-xs text-text-tertiary line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-sm font-bold text-text-primary">
              {formatPrice(price)}
            </span>
          </div>
          <StarRating rating={rating} reviewCount={reviewCount} />
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;