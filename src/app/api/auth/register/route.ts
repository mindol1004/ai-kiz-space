import { prisma } from "@/infrastructure/database/prisma";
import { hashPassword } from "@/infrastructure/auth";
import { registerSchema } from "@/shared/validations";
import { withErrorHandler } from "@/infrastructure/error-handler";
import { registerRateLimit } from "@/infrastructure/rate-limit";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(
  registerRateLimit(async (request: Request) => {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "이미 가입된 이메일입니다." } },
        { status: 409 }
      );
    }

    const existingNickname = await prisma.user.findUnique({
      where: { nickname: validatedData.nickname },
    });

    if (existingNickname) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "이미 사용 중인 닉네임입니다." } },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        nickname: validatedData.nickname,
        phone: validatedData.phone,
        agreeMarketing: validatedData.agreeMarketing,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        role: true,
        grade: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
          grade: user.grade,
        }
      },
      { status: 201 }
    );
  })
);