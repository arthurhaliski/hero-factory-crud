/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `heroes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `heroes_nickname_key` ON `heroes`(`nickname`);
