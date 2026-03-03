export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  phone?: string;
  avatar?: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  createdAt: Date;
  updatedAt: Date;
}

export interface Child {
  id: string;
  userId: string;
  name: string;
  birthDate: Date;
  gender: "MALE" | "FEMALE";
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  recipient: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  brandId?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  thumbnail: string;
  status: "DRAFT" | "ACTIVE" | "SOLD_OUT" | "DISCONTINUED";
  isFeatured: boolean;
  isNew: boolean;
  minAge?: number;
  maxAge?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  type: "TEXT" | "SELECT" | "COLOR" | "SIZE";
  values: string[];
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  options: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentKey?: string;
  shippingName: string;
  shippingPhone: string;
  shippingZipCode: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  memo?: string;
  orderedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  options: Record<string, string>;
  price: number;
  quantity: number;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  isVerified: boolean;
  isFeatured: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "DELETED";
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validityType: "PERIOD" | "DAYS_AFTER_ISSUANCE";
  startDate?: Date;
  endDate?: Date;
  validityDays?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointHistory {
  id: string;
  userId: string;
  amount: number;
  type: "EARNED" | "USED" | "EXPIRED" | "ADJUSTED";
  reason: string;
  orderId?: string;
  expiryDate?: Date;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: "ORDER" | "PAYMENT" | "SHIPPING" | "REVIEW" | "POST" | "SYSTEM" | "MARKETING";
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  targetType: "POST" | "COMMENT" | "REVIEW" | "USER" | "PRODUCT";
  targetId: string;
  reporterId: string;
  reason: string;
  status: "PENDING" | "PROCESSED" | "DISMISSED";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};