import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Employee } from "~/types/employee";
import Menu from "~/components/Menu";
import { Save, X } from "lucide-react";

const EmployeeCreateEdit = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const isEditing = !!id;

  const [employee, setEmployee] = useState<Partial<Employee>>({
    firstName: "",
    lastName: "",
    telephone: "",
    email: "",
    managerId: "",
    status: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

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

  const { data: employeeData, isLoading: isEmployeeLoading } =
    api.employee.getById.useQuery(
      { id: parseInt(id as string) },
      {
        enabled: isEditing && status === "authenticated",
      },
    );

  useEffect(() => {
    if (employeeData) {
      setEmployee({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        telephone: employeeData.telephone,
        email: employeeData.email,
        managerId: employeeData.managerId?.toString() || "",
        status: employeeData.status,
      });
    }
  }, [employeeData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const { mutateAsync: updateEmployee } = api.employee.update.useMutation();
  const { mutateAsync: createEmployee } = api.employee.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Updating the existing employee
        await updateEmployee({
          id: parseInt(id as string, 10), // Convert string ID to number
          firstName: employee.firstName,
          lastName: employee.lastName,
          telephone: employee.telephone,
          email: employee.email,
          managerId: employee.managerId
            ? parseInt(employee.managerId)
            : undefined,
          status: employee.status,
        });
      } else {
        // Creating a new employee
        await createEmployee(employee);
      }

      // Redirect to the employee list after saving
      router.push("/employees/EmployeeList");
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  if (status === "loading" || isEmployeeLoading) return <p>Loading...</p>;

  const isSuperUser = session?.user?.role === 0;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Menu />
      <div className="container mx-auto flex-1 py-6">
        <h1 className="text-center text-2xl font-bold">
          HR Administration System
        </h1>
        <h2 className="mt-6 text-center text-xl font-semibold">
          Edit Employee
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-lg">
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

          {isEditing && isSuperUser && (
            <div className="mb-4">
              <label htmlFor="status" className="mb-2 block font-bold">
                *Status
              </label>
              <select
                id="status"
                name="status"
                value={employee.status ? "Active" : "Inactive"}
                onChange={(e) =>
                  setEmployee((prev) => ({
                    ...prev,
                    status: e.target.value === "Active",
                  }))
                }
                required
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">- Select -</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="mt-6 flex justify-center space-x-4">
            <button
              type="submit"
              className="flex items-center rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
            >
              <Save size={18} className="mr-1" />
              Save
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

export default EmployeeCreateEdit;
