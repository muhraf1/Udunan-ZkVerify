/*
  Warnings:

  - Added the required column `organizationNameId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Content` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorId` on table `Fundraise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contentId` on table `Fundraise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_userId_fkey";

-- DropForeignKey
ALTER TABLE "Fundraise" DROP CONSTRAINT "Fundraise_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Fundraise" DROP CONSTRAINT "Fundraise_contentId_fkey";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "organizationNameId" TEXT NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Fundraise" ALTER COLUMN "authorId" SET NOT NULL,
ALTER COLUMN "contentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_organizationNameId_fkey" FOREIGN KEY ("organizationNameId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fundraise" ADD CONSTRAINT "Fundraise_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fundraise" ADD CONSTRAINT "Fundraise_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
