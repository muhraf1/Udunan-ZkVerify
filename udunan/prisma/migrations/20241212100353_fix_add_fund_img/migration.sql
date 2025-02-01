/*
  Warnings:

  - You are about to drop the column `fundraiserImage` on the `Fundraise` table. All the data in the column will be lost.
  - Added the required column `fundimg` to the `Fundraise` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Fundraise` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Fundraise" DROP COLUMN "fundraiserImage",
ADD COLUMN     "fundimg" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
