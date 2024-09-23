import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Menu from "~/components/Menu";
import { FilePlus, X } from "lucide-react";

const EmployeeCreate = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [employee, setEmployee] = useState<{
    firstName: string;
    lastName: string;
    telephone: string;
    email: string;
    managerId: number | null;
    status: boolean;
    role: number;
    departments: number[]; // Update to "departments"
  }>({
    firstName: "",
    lastName: "",
    telephone: "",
    email: "",
    managerId: null,
    status: true,
    role: 2,
    departments: [], // Update to "departments"
  });

  // Fetch managers and departments
  const { data: managers, isLoading: managerLoading } =
    api.employee.getAll.useQuery(undefined, {
      enabled: status === "authenticated",
      onError: (error) => {
        console.error("Error fetching managers:", error);
      },
    });

  const { data: departments, isLoading: departmentLoading } =
    api.department.getAll.useQuery(undefined, {
      enabled: status === "authenticated",
      onError: (error) => {
        console.error("Error fetching departments:", error);
      },
    });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const createEmployee = api.employee.create.useMutation({
    onSuccess: () => {
      router.push("/employees/EmployeeList");
    },
    onError: (error) => {
      console.error("Error creating employee:", error);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const newValue = name === "managerId" ? Number(value) : value;
    setEmployee((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value),
    );
    setEmployee((prev) => ({
      ...prev,
      departmentIds: selectedIds,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createEmployee.mutateAsync({
        firstName: employee.firstName,
        lastName: employee.lastName,
        telephone: employee.telephone,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        departments: employee.departments,
        ...(employee.managerId !== null && { managerId: employee.managerId }), // Include managerId only if it's not null
      });
    } catch (error) {
      console.error("Failed to create employee:", error);
    }
  };

  if (status === "loading" || managerLoading || departmentLoading)
    return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Menu />
      <div className="container mx-auto flex-1 py-6">
        <h1 className="text-center text-2xl font-bold">
          HR Administration System
        </h1>
        <h2 className="mt-6 text-center text-xl font-semibold">
          Create Employee
        </h2>

        <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-lg">
          <div className="mb-4">
            <label htmlFor="firstName" className="mb-2 block font-bold">
              *First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={employee.firstName}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="mb-2 block font-bold">
              *Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={employee.lastName}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="telephone" className="mb-2 block font-bold">
              *Telephone
            </label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={employee.telephone}
              onChange={handleInputChange}
              required
              placeholder="e.g. 0821111111"
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block font-bold">
              *Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={employee.email}
              onChange={handleInputChange}
              required
              placeholder="e.g. test@test.com"
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="managerId" className="mb-2 block font-bold">
              *Manager
            </label>
            <select
              id="managerId"
              name="managerId"
              value={employee.managerId ?? ""}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="">- Select -</option>
              {managers?.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="departmentId" className="mb-2 block font-bold">
              *Departments
            </label>
            <select
              id="departmentId"
              name="departmentId"
              value={employee.departmentId ?? ""}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="">- Select -</option>
              {departments?.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              type="submit"
              className="flex items-center rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
            >
              <FilePlus size={18} className="mr-1" />
              Create
            </button>
            <button
              type="button"
              onClick={() => router.push("/employees/EmployeeList")}
              className="flex items-center rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
            >
              <X size={18} className="mr-1" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeCreate;
