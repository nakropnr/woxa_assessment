ALTER TABLE "Broker" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Broker" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Broker" ALTER COLUMN "slug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "Broker" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Broker" ALTER COLUMN "website" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "Broker" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Broker" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;