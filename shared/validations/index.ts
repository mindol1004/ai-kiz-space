import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

export const registerSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "영문, 숫자, 특수문자를 포함해야 합니다."
    ),
  confirmPassword: z.string(),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요."),
});

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "영문, 숫자, 특수문자를 포함해야 합니다."
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다.").optional(),
  phone: z.string().optional(),
});

export const childSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  birthDate: z.string().min(1, "생년월일을 선택해주세요."),
  gender: z.enum(["MALE", "FEMALE"]),
});

export const addressSchema = z.object({
  name: z.string().min(1, "주소지명을 입력해주세요."),
  recipient: z.string().min(1, "수령인을 입력해주세요."),
  phone: z.string().min(1, "연락처를 입력해주세요."),
  zipCode: z.string().min(1, "우편번호를 입력해주세요."),
  address1: z.string().min(1, "주소를 입력해주세요."),
  address2: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const productReviewSchema = z.object({
  rating: z.number().min(1, "평점을 선택해주세요.").max(5),
  title: z.string().min(2, "제목은 2자 이상이어야 합니다.").max(100),
  content: z.string().min(10, "후기는 10자 이상 작성해주세요.").max(2000),
});

export const postSchema = z.object({
  categoryId: z.string().min(1, "카테고리를 선택해주세요."),
  title: z.string().min(2, "제목은 2자 이상이어야 합니다.").max(200),
  content: z.string().min(10, "내용은 10자 이상이어야 합니다."),
  isFeatured: z.boolean().default(false),
});

export const commentSchema = z.object({
  content: z.string().min(1, "댓글을 입력해주세요.").max(1000),
  parentId: z.string().optional(),
});

export const reportSchema = z.object({
  targetType: z.enum(["POST", "COMMENT", "REVIEW", "USER", "PRODUCT"]),
  targetId: z.string(),
  reason: z.string().min(1, "신고 사유를 선택해주세요."),
});

export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1, "수량은 1개 이상이어야 합니다."),
  options: z.record(z.string()),
});

export const orderSchema = z.object({
  addressId: z.string().min(1, "배송지를 선택해주세요."),
  couponId: z.string().optional(),
  memo: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChildInput = z.infer<typeof childSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductReviewInput = z.infer<typeof productReviewSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;