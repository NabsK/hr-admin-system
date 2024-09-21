// src/types/employee.ts

import { Department } from "./department";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  telephone: string;
  email: string;
  role: number;
  managerId: number | null;
  status: boolean;
  departments: Department[];
  manager: {
    id: number;
    firstName: string;
    lastName: true;
    email: string;
  } | null;
}
