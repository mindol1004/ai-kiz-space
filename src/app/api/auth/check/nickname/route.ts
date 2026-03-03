import { prisma } from "@/infrastructure/database/prisma";
import { checkNicknameSchema } from "@/shared/validations";
import { withErrorHandler, NotFoundError } from "@/infrastructure/error-handler";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get("nickname");

  if (!nickname) {
    throw new NotFoundError("닉네임을 입력해주세요.");
  }

  checkNicknameSchema.parse({ nickname });

  const existingUser = await prisma.user.findUnique({
    where: { nickname },
    select: { id: true },
  });

  return NextResponse.json({
    success: true,
    data: { available: !existingUser },
  });
});