/*
  Warnings:

  - You are about to drop the column `daysLeft` on the `Content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Content" DROP COLUMN "daysLeft",
ADD COLUMN     "dayLeft" INTEGER NOT NULL DEFAULT 0;
