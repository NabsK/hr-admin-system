import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Employee } from "~/types/employee";
import Menu from "~/components/Menu";
import { Edit } from "lucide-react";
import Link from "next/link";

const EmployeeListView = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    console.log("Current session:", session);
    console.log("Authentication status:", status);
  }, [session, status]);

  const { data, error, isLoading } = api.employee.getAll.useQuery(undefined, {
    enabled: status === "authenticated",
    onError: (error) => {
      console.error("Error fetching employees:", error);
    },
  });

  useEffect(() => {
    if (data) {
      console.log("Received employee data:", data);
      const convertedData = data.map((employee) => ({
        ...employee,
        id: employee.id,
        manager: employee.manager
          ? { ...employee.manager, id: employee.manager.id.toString() }
          : null,
      }));
      setEmployees(convertedData);
    }
  }, [data]);

  const toggleStatus = api.employee.toggleActivationStatus.useMutation({
    onSuccess: (data, variables) => {
      // Ensure variables.id is available
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === variables.id
            ? { ...employee, status: !employee.status } // Toggle status locally
            : employee,
        ),
      );
    },
    onError: (error) => {
      console.error("Error toggling employee status:", error);
    },
  });

  const handleToggleStatus = async (
    employeeId: number,
    currentStatus: boolean,
  ) => {
    const action = currentStatus ? "Deactivate" : "Activate";
    try {
      await toggleStatus.mutateAsync({ id: employeeId, action });
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  if (status === "loading" || isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching employees: {error.message}</p>;

  // Check if the user is a Super User
  const isSuperUser = session?.user?.role === 0;

  return (
    <div className="flex">
      {/* Left Menu */}
      <Menu />

      {/* Main Content */}
      <div className="container mx-auto flex-1 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">HR Administration System</h1>
          <button className="block text-2xl md:hidden">&#9776;</button>
        </div>

        {/* Title */}
        <h2 className="mt-6 text-xl font-semibold">Employees</h2>

        {/* Filters Section */}
        <div className="mt-4 rounded-md border p-4">
          <h3 className="font-semibold">Filters</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                <option>Active Only / (All) / Deactive Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Department</label>
              <select className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                <option>- Select -</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Manager</label>
              <select className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                <option>- Select -</option>
              </select>
            </div>
          </div>
          <button className="mt-4 flex items-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            <span className="mr-2">Filter</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707l-5 5a1 1 0 01-.707.293H7a1 1 0 01-.707-.293l-5-5A1 1 0 011 6V4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Employee Table */}
        <div className="mt-6">
          {/* Table Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <label htmlFor="perPage" className="text-sm font-medium">
                Show per Page
              </label>
              <select
                id="perPage"
                className="ml-2 rounded-md border border-gray-300 p-2"
              >
                <option>10 / 20 / 50 / 100 / All</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="search"
                className="rounded-md border border-gray-300 p-2"
              />
            </div>
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Telephone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/employees/EmployeeCreateEdit?id=${employee.id}`}
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <Edit size={18} className="mr-1" />
                          Edit
                        </Link>
                        {isSuperUser && (
                          <button
                            className={`font-medium ${
                              employee.status
                                ? "text-red-600 hover:text-red-800"
                                : "text-green-600 hover:text-green-800"
                            } hover:underline`}
                            onClick={() =>
                              handleToggleStatus(employee.id, employee.status)
                            }
                          >
                            {employee.status ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {employee.firstName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {employee.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {employee.telephone || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {employee.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {employee.manager?.firstName} {employee.manager?.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`font-medium ${
                          employee.status ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {employee.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 text-sm text-gray-600">
            <a href="#" className="text-blue-600 hover:underline">
              1
            </a>
            <a href="#" className="ml-2 text-blue-600 hover:underline">
              2
            </a>
            <a href="#" className="ml-2 text-blue-600 hover:underline">
              3
            </a>
            <a href="#" className="ml-2 text-blue-600 hover:underline">
              4
            </a>
            <a href="#" className="ml-2 text-blue-600 hover:underline">
              5
            </a>
            <a href="#" className="ml-2 text-blue-600 hover:underline">
              6
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListView;
