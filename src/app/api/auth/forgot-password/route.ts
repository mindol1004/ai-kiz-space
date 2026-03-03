import { prisma } from "@/infrastructure/database/prisma";
import { forgotPasswordSchema } from "@/shared/validations";
import { withErrorHandler } from "@/infrastructure/error-handler";
import { registerRateLimit } from "@/infrastructure/rate-limit";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(
  registerRateLimit(async (request: Request) => {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        data: { message: "비밀번호 재설정 링크를发送했습니다." },
      });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // TODO: Send email with reset link
    console.log(`Password reset token for ${user.email}: ${token}`);

    return NextResponse.json({
      success: true,
      data: { message: "비밀번호 재설정 링크를发送했습니다." },
    });
  })
);