import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { BadRequestError } from "./middleware.js";

export const BROKER_TYPES = ["cfd", "bond", "stock", "crypto"] as const;

declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

// ── Schemas ────────────────────────────────────────────────────────

export const createBrokerSchema = z.object({
  name: z.string().min(1, "name cannot be empty").max(255),

  slug: z
    .string()
    .min(1, "slug cannot be empty")
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug must be lowercase letters, numbers, and hyphens only",
    ),

  description: z.string().optional(),

  logo_url: z
    .string()
    .url("logo_url must be a valid URL")
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .url("website must be a valid URL")
    .optional()
    .or(z.literal("")),

  broker_type: z.enum(BROKER_TYPES, {
    error: `broker_type must be one of: ${BROKER_TYPES.join(", ")}`,
  }),
});

export type CreateBrokerInput = z.infer<typeof createBrokerSchema>;

export const brokerQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(BROKER_TYPES).optional(),
});

export const brokerSlugParamSchema = z.object({
  slug: z
    .string()
    .min(1, "slug cannot be empty")
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug must be lowercase letters, numbers, and hyphens only",
    ),
});

// ── Middleware factory ─────────────────────────────────────────────

export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const input =
      source === "body"
        ? req.body
        : source === "query"
          ? req.query
          : req.params;
    const result = schema.safeParse(input);

    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      next(new BadRequestError("Validation failed", errors));
      return;
    }

    if (source === "body") req.validatedBody = result.data;
    if (source === "query") req.validatedQuery = result.data;
    if (source === "params") req.validatedParams = result.data;

    next();
  };
}
