import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export class AppError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, string[]>;

  constructor(message: string, code: string, statusCode: number, details?: Record<string, string[]>) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super("유효성 검증에 실패했습니다.", "VALIDATION_ERROR", 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "인증이 필요합니다.") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "권한이 없습니다.") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "리소스를 찾을 수 없습니다.") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, "BUSINESS_RULE_ERROR", 422);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "요청 횟수가 초과되었습니다.") {
    super(message, "RATE_LIMIT_EXCEEDED", 429);
  }
}

type Handler = (request: NextRequest) => Promise<Response>;

export function withErrorHandler(handler: Handler): Handler {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error: unknown) {
      console.error("[Error]", error);

      if (error instanceof AppError) {
        return NextResponse.json(
          { success: false, error: { code: error.code, message: error.message, details: error.details } },
          { status: error.statusCode }
        );
      }

      if (error instanceof z.ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join(".");
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(issue.message);
        }
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "유효성 검증에 실패했습니다.", details } },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." } },
        { status: 500 }
      );
    }
  };
}

export function requireAuth(): never {
  throw new AuthenticationError();
}

export function requireRole(_allowedRoles: string[]): never {
  throw new AuthorizationError();
}

export function requireOwnership(ownerId: string, userId: string): void {
  if (ownerId !== userId) {
    throw new AuthorizationError();
  }
}