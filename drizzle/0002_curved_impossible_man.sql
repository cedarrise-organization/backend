ALTER TABLE "donors" RENAME COLUMN "date" TO "createdAt";--> statement-breakpoint
DROP INDEX "donor_idx";--> statement-breakpoint
CREATE INDEX "donor_idx" ON "donors" USING btree ("createdAt");