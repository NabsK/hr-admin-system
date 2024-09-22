import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Employee } from "~/types/employee";
import Menu from "~/components/Menu";
import { Edit, Filter, Search } from "lucide-react";
import Link from "next/link";

const EmployeeListView = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const { data, error, isLoading } = api.employee.getAll.useQuery(undefined, {
    enabled: status === "authenticated",
    onError: (error) => {
      console.error("Error fetching employees:", error);
    },
  });

  useEffect(() => {
    if (data) {
      setEmployees(data);
    }
  }, [data]);

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

  const { data: departments, error: departmentError } =
    api.department.getAll.useQuery(undefined, {
      enabled: status === "authenticated", // This is fine for managing data fetching
      onError: (error) => {
        console.error("Error fetching departments:", error);
      },
    });

  useEffect(() => {
    if (departments) {
      console.log("Received departments data:", departments);
    }
  }, [departments]);

  const toggleStatus = api.employee.toggleActivationStatus.useMutation({
    onSuccess: (data, variables) => {
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === variables.id
            ? { ...employee, status: !employee.status }
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

  const findManagerName = (managerId: number | null) => {
    const manager = managers?.find((mgr) => mgr.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : "N/A";
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastEmployee = currentPage * perPage;
  const indexOfFirstEmployee = indexOfLastEmployee - perPage;
  const currentEmployees = employees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee,
  );
  const totalPages = Math.ceil(employees.length / perPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (status === "loading" || isLoading || managerLoading)
    return <p>Loading...</p>;
  if (error) return <p>Error fetching employees: {error.message}</p>;
  if (managerError)
    return <p>Error fetching managers: {managerError.message}</p>;
  if (departmentError)
    return <p>Error fetching departments: {departmentError.message}</p>;

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
                <option>All</option>
                <option>Active Only</option>
                <option>Deactive Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Department</label>
              <select className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                <option value="">- Select -</option>
                {departments && departments.length > 0 ? (
                  departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading managers...</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Manager</label>
              <select className="mt-1 block w-full rounded-md border border-gray-300 p-2">
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
          </div>
          <button className="mt-4 flex items-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            <Filter size={18} className="mr-2" />
            <span>Filter</span>
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
                value={perPage}
                onChange={handlePerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={employees.length}>All</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search"
                className="rounded-l-md border border-gray-300 p-2"
              />
              <button className="rounded-r-md border border-l-0 border-gray-300 bg-gray-100 p-2">
                <Search size={20} />
              </button>
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
              {currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/employees/EmployeeEdit?id=${employee.id}`}
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
                      {findManagerName(employee.managerId)}
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
          <div className="mt-4 flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`mx-1 px-3 py-1 ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500 hover:bg-blue-100"
                  } rounded border`}
                >
                  {number}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListView;
