-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "teacher_id" TEXT;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
