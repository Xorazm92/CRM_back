-- DropForeignKey
ALTER TABLE "Submissions" DROP CONSTRAINT "Submissions_graded_by_fkey";

-- AlterTable
ALTER TABLE "Submissions" ALTER COLUMN "graded_by" DROP NOT NULL,
ALTER COLUMN "file_path" DROP NOT NULL,
ALTER COLUMN "grade" DROP NOT NULL,
ALTER COLUMN "graded_at" DROP NOT NULL,
ALTER COLUMN "feedback" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "Submissions_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
