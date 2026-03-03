import { prisma } from "@/infrastructure/database/prisma";
import { checkEmailSchema } from "@/shared/validations";
import { withErrorHandler, NotFoundError } from "@/infrastructure/error-handler";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    throw new NotFoundError("이메일을 입력해주세요.");
  }

  checkEmailSchema.parse({ email });

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return NextResponse.json({
    success: true,
    data: { available: !existingUser },
  });
});