/*
  Warnings:

  - Added the required column `student_id` to the `StudentPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentPayment" ADD COLUMN     "student_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StudentPayment" ADD CONSTRAINT "StudentPayment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
