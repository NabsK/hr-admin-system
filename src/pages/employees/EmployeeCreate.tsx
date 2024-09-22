import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Menu from "~/components/Menu";

const EmployeeCreate = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [employee, setEmployee] = useState<{
    firstName: string;
    lastName: string;
    telephone: string;
    email: string;
    managerId: number | null; // Use null to allow no selection
    status: boolean;
    role: number;
    departmentIds: number[];
  }>({
    firstName: "",
    lastName: "",
    telephone: "",
    email: "",
    managerId: null, // Default to null
    status: true,
    role: 2,
    departmentIds: [],
  });

  const {
    data: managers,
    error: managerError,
    isLoading: managerLoading,
  } = api.employee.getAllManagers.useQuery(undefined, {
    enabled: status === "authenticated",
    onError: (error) => {
      console.error("Error fetching managers:", error);
    },
  });

  useEffect(() => {
    if (managers) {
      console.log("Received managers data:", managers);
    }
  }, [managers]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const createEmployee = api.employee.create.useMutation({
    onSuccess: () => {
      router.push("/employees");
    },
    onError: (error) => {
      console.error("Error creating employee:", error);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Convert value to number for managerId
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
      await createEmployee.mutateAsync(employee);
    } catch (error) {
      console.error("Failed to create employee:", error);
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="flex">
      <Menu />
      <div className="container mx-auto flex-1 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">HR Administration System</h1>
          <button className="block text-2xl md:hidden">&#9776;</button>
        </div>

        <h2 className="mt-6 text-xl font-semibold">Create Employee</h2>

        <form onSubmit={handleSubmit} className="mt-6 max-w-lg">
          <div className="mb-4">
            <label htmlFor="firstName" className="mb-2 block font-bold">
              *Name
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
              *Surname
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
              *Telephone Number
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
              *Email Address
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
              {managers && managers.length > 0 ? (
                managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName}
                  </option>
                ))
              ) : (
                <option disabled>Loading managers...</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="departmentIds" className="mb-2 block font-bold">
              *Departments
            </label>
            <select
              id="departmentIds"
              name="departmentIds"
              multiple
              onChange={handleDepartmentChange}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="1">Department 1</option>
              <option value="2">Department 2</option>
              <option value="3">Department 3</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => router.push("/employees/EmployeeList")}
              className="rounded bg-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeCreate;
