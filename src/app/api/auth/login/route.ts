import { prisma } from "@/infrastructure/database/prisma";
import { loginSchema } from "@/shared/validations";
import { withErrorHandler, AuthenticationError } from "@/infrastructure/error-handler";
import { authRateLimit } from "@/infrastructure/rate-limit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth";

export const POST = withErrorHandler(
  authRateLimit(async (request: Request) => {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.password) {
      throw new AuthenticationError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    if (user.status !== "ACTIVE") {
      throw new AuthenticationError("이용이 정지된 계정입니다. 고객센터에 문의하세요.");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AuthenticationError("비밀번호 재설정이 필요합니다. 고객센터에 문의하세요.");
    }

    const { compare } = await import("bcryptjs");
    const isPasswordValid = await compare(validatedData.password, user.password);

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
      throw new AuthenticationError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginFailCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const session = await getServerSession(authOptions);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
          grade: user.grade,
        },
        session: session ? "active" : "inactive",
      },
    });
  })
);