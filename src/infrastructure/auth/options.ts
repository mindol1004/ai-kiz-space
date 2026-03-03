import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/infrastructure/database/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      grade: string;
    };
  }
  interface User {
    role: string;
    grade: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    grade: string;
    provider?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (user.status !== "ACTIVE") {
          if (user.status === "SUSPENDED") {
            throw new Error("이용이 정지된 계정입니다. 고객센터에 문의하세요.");
          }
          throw new Error("계정이 존재하지 않습니다.");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginFailCount: { increment: 1 },
              lockedUntil: user.loginFailCount >= 4 
                ? new Date(Date.now() + 5 * 60 * 1000) 
                : null,
            },
          });
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginFailCount: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
          grade: user.grade,
        } as User;
      },
    }),
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [KakaoProvider({
          clientId: process.env.KAKAO_CLIENT_ID,
          clientSecret: process.env.KAKAO_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET
      ? [NaverProvider({
          clientId: process.env.NAVER_CLIENT_ID,
          clientSecret: process.env.NAVER_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.grade = user.grade;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.grade = token.grade;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        const couponTemplate = await prisma.couponTemplate.findFirst({
          where: { name: "환영 쿠폰", isActive: true },
        });
        if (couponTemplate) {
          await prisma.coupon.create({
            data: {
              userId: user.id,
              templateId: couponTemplate.id,
              name: couponTemplate.name,
              code: `WELCOME-${user.id?.slice(0, 8).toUpperCase()}`,
              discountType: couponTemplate.discountType,
              discountValue: couponTemplate.discountValue,
              minOrderAmount: couponTemplate.minOrderAmount,
              maxDiscountAmount: couponTemplate.maxDiscountAmount,
              expiresAt: new Date(Date.now() + couponTemplate.validDays * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    },
  },
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}