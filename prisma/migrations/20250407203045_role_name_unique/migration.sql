/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role_name]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Roles" ALTER COLUMN "role_name" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Groups_name_key" ON "Groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_role_name_key" ON "Roles"("role_name");
