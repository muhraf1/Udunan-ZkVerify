/*
  Warnings:

  - Added the required column `imageSrc` to the `Fundraise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fundraise" ADD COLUMN     "imageSrc" TEXT NOT NULL;
