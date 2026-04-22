ALTER TABLE "Broker" ALTER COLUMN "broker_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_slug_unique" UNIQUE("slug");
