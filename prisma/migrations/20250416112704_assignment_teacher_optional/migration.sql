-- AlterTable
ALTER TABLE "Assignments" ADD COLUMN     "teacher_id" TEXT;

-- AddForeignKey
ALTER TABLE "Assignments" ADD CONSTRAINT "Assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
