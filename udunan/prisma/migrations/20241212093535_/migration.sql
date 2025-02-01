/*
  Warnings:

  - You are about to drop the column `imageSrc` on the `Fundraise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fundraise" DROP COLUMN "imageSrc",
ADD COLUMN     "fundraiserImage" TEXT;
