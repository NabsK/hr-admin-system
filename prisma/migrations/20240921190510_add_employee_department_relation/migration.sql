/*
  Warnings:

  - You are about to drop the `_EmployeeDepartments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EmployeeDepartments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EmployeeDepartment" (
    "employeeId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    PRIMARY KEY ("employeeId", "departmentId"),
    CONSTRAINT "EmployeeDepartment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
