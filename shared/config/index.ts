export const siteConfig = {
  name: "키즈공간",
  description: "키즈 전문 쇼핑몰 겸 커뮤니티",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL}/og.png`,
};

export const authConfig = {
  providers: ["kakao", "naver", "google"],
  sessionStrategy: "jwt",
  maxAge: 30 * 24 * 60 * 60,
};

export const paginationConfig = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

export const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxImageCount: 10,
};

export const orderConfig = {
  minOrderAmount: 30000,
  freeShippingThreshold: 50000,
  shippingFee: 3000,
};

export const pointConfig = {
  signup: 1000,
  review: 500,
  orderPercent: 1,
  expiryDays: 365,
};