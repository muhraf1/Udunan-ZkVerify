/*
  Warnings:

  - The primary key for the `Content` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `daysLeft` on the `Content` table. All the data in the column will be lost.
  - The `category` column on the `Content` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Fundraise` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[address]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userimg` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('EMERGENCY', 'HEALTHCARE', 'EDUCATION', 'ANIMAL', 'OTHERS');

-- DropForeignKey
ALTER TABLE "Fundraise" DROP CONSTRAINT "Fundraise_contentId_fkey";

-- AlterTable
ALTER TABLE "Content" DROP CONSTRAINT "Content_pkey",
DROP COLUMN "daysLeft",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "isVerified" SET DEFAULT false,
ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "targetAmount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "donationCount" SET DEFAULT 0,
DROP COLUMN "category",
ADD COLUMN     "category" "CategoryStatus" NOT NULL DEFAULT 'OTHERS',
ADD CONSTRAINT "Content_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Content_id_seq";

-- AlterTable
ALTER TABLE "Fundraise" DROP CONSTRAINT "Fundraise_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "contentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Fundraise_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Fundraise_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "userimg" TEXT NOT NULL;

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Donate" (
    "id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "msg" TEXT,
    "donorId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdraw" (
    "id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdraw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donate_tx_hash_key" ON "Donate"("tx_hash");

-- CreateIndex
CREATE INDEX "Donate_tx_hash_idx" ON "Donate"("tx_hash");

-- CreateIndex
CREATE INDEX "Donate_donorId_idx" ON "Donate"("donorId");

-- CreateIndex
CREATE INDEX "Donate_contentId_idx" ON "Donate"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Withdraw_tx_hash_key" ON "Withdraw"("tx_hash");

-- CreateIndex
CREATE INDEX "Withdraw_tx_hash_idx" ON "Withdraw"("tx_hash");

-- CreateIndex
CREATE INDEX "Withdraw_contentId_idx" ON "Withdraw"("contentId");

-- CreateIndex
CREATE INDEX "Content_category_idx" ON "Content"("category");

-- CreateIndex
CREATE INDEX "Fundraise_authorId_idx" ON "Fundraise"("authorId");

-- CreateIndex
CREATE INDEX "Fundraise_contentId_idx" ON "Fundraise"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_address_idx" ON "User"("address");

-- AddForeignKey
ALTER TABLE "Fundraise" ADD CONSTRAINT "Fundraise_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donate" ADD CONSTRAINT "Donate_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donate" ADD CONSTRAINT "Donate_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdraw" ADD CONSTRAINT "Withdraw_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
