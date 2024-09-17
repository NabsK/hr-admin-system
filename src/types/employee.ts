// src/types/employee.ts

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}
