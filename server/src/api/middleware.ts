import type { NextFunction, Request, Response } from "express";
import { respondWithJSON } from "./json.js";

export async function middleWareLogResponse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    const statusCode = res.statusCode;
    if (statusCode >= 400) {
      console.log(`[${statusCode}] ${req.method} ${req.url}`);
    }
  });
  next();
}

export async function middleWareErrorHandling(
  err: unknown,
  req: Request,
  res: Response,
  __: NextFunction,
) {
  if (err instanceof AppError) {
    respondWithJSON(res, err.statusCode, {
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  console.error(`[UNHANDLED] ${req.method} ${req.url}`, err);
  respondWithJSON(res, 500, {
    success: false,
    message: "Internal server error",
  });
}

type ValidationError = { field: string; message: string };

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errors?: ValidationError[],
  ) {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: ValidationError[]) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errors?: ValidationError[]) {
    super(message, 409, errors);
  }
}
