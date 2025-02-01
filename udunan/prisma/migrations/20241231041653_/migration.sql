/*
  Warnings:

  - The values [EMERGENCY,HEALTHCARE,EDUCATION,ANIMAL,OTHERS] on the enum `CategoryStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CategoryStatus_new" AS ENUM ('Emergency', 'Healthcare', 'Education', 'Animal', 'Others');
ALTER TABLE "Content" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Content" ALTER COLUMN "category" TYPE "CategoryStatus_new" USING ("category"::text::"CategoryStatus_new");
ALTER TYPE "CategoryStatus" RENAME TO "CategoryStatus_old";
ALTER TYPE "CategoryStatus_new" RENAME TO "CategoryStatus";
DROP TYPE "CategoryStatus_old";
ALTER TABLE "Content" ALTER COLUMN "category" SET DEFAULT 'Emergency';
COMMIT;

-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "category" SET DEFAULT 'Emergency';
