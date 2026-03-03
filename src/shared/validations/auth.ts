import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "영문, 숫자, 특수문자를 포함해야 합니다."
    ),
  confirmPassword: z.string().min(1, "비밀번호를 확인해주세요."),
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다.")
    .max(20, "이름은 20자 이하여야 합니다."),
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(15, "닉네임은 15자 이하여야 합니다.")
    .regex(/^[a-zA-Z0-9가-힣]+$/, "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다."),
  phone: z
    .string()
    .min(1, "휴대폰 번호를 입력해주세요.")
    .regex(/^010-\d{4}-\d{4}$/, "올바른 휴대폰 번호 형식(010-0000-0000)으로 입력해주세요."),
  agreeTerms: z.boolean().refine((val) => val === true, { message: "이용약관에 동의해주세요." }),
  agreePrivacy: z.boolean().refine((val) => val === true, { message: "개인정보처리방침에 동의해주세요." }),
  agreeMarketing: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "영문, 숫자, 특수문자를 포함해야 합니다."
    ),
  confirmPassword: z.string().min(1, "비밀번호를 확인해주세요."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

export const checkEmailSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
});

export const checkNicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(15, "닉네임은 15자 이하여야 합니다."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CheckEmailInput = z.infer<typeof checkEmailSchema>;
export type CheckNicknameInput = z.infer<typeof checkNicknameSchema>;