CREATE TYPE "public"."brokerType" AS ENUM('cfd', 'bond', 'stock', 'crypto');--> statement-breakpoint
CREATE TABLE "Broker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"slug" text,
	"description" text,
	"logo_url" text,
	"website" text,
	"broker_type" "brokerType"
);
