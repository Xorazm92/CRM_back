/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Groups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Groups_name_key" ON "Groups"("name");
