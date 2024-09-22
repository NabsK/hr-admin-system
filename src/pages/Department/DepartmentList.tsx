import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Department } from "~/types/department";
import Menu from "~/components/Menu";
import Link from "next/link";
import { Edit } from "lucide-react";

const DepartmentListView = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    [],
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const { data, error, isLoading } = api.department.getAll.useQuery(undefined, {
    enabled: status === "authenticated",
    onError: (error) => {
      console.error("Error fetching departments:", error);
    },
  });

  useEffect(() => {
    if (data) {
      const convertedData = data.map((department) => ({
        ...department,
        id: department.id.toString(),
      }));
      setDepartments(convertedData);
      setFilteredDepartments(convertedData);
    }
  }, [data]);
  //console.log(departments);

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
  //console.log(managers);

  const toggleStatus = api.department.toggleActivationStatus.useMutation({
    onSuccess: (updatedDepartment, variables) => {
      const updatedDepartments = departments.map((department) =>
        department.id === variables.id.toString()
          ? { ...department, status: updatedDepartment.status }
          : department,
      );
      setDepartments(updatedDepartments);
      applyFilters(updatedDepartments);
    },
    onError: (error) => {
      console.error("Error toggling department status:", error);
    },
  });

  const handleToggleStatus = async (
    departmentId: string,
    currentStatus: string,
  ) => {
    const action = currentStatus === "1" ? "Deactivate" : "Activate";
    try {
      await toggleStatus.mutateAsync({ id: Number(departmentId), action });
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPerPage(value === "all" ? filteredDepartments.length : Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    applyFilters(departments, e.target.value, statusFilter);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(e.target.value);
    applyFilters(departments, searchTerm, e.target.value);
  };

  const applyFilters = (
    deps: Department[],
    search: string = searchTerm,
    status: string = statusFilter,
  ) => {
    let filtered = deps;

    if (search) {
      filtered = filtered.filter((department) =>
        department.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((department) => department.status === status);
    }

    setFilteredDepartments(filtered);
    setCurrentPage(1);
  };

  const indexOfLastDepartment = currentPage * perPage;
  const indexOfFirstDepartment = indexOfLastDepartment - perPage;
  const currentDepartments = filteredDepartments.slice(
    indexOfFirstDepartment,
    indexOfLastDepartment,
  );

  const totalPages = Math.ceil(filteredDepartments.length / perPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (status === "loading" || isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching departments: {error.message}</p>;

  const isSuperUser = session?.user?.role === 0;
  const isManager = session?.user?.role === 1;
  const canEditDepartments = isSuperUser || isManager;

  const findManagerName = (managerId: number | null) => {
    const manager = managers?.find((mgr) => mgr.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : "N/A";
  };

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
        <h2 className="mt-6 text-xl font-semibold">Departments List</h2>

        {/* Filters Section */}
        <div className="mt-4 rounded-md border p-4">
          <h3 className="font-semibold">Filters</h3>
          <div className="mt-4 flex items-center">
            <div className="w-full">
              <label className="block text-sm font-medium">Status</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All</option>
                <option value="1">Active Only</option>
                <option value="0">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Department Table */}
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
                value={perPage === filteredDepartments.length ? "all" : perPage}
                onChange={handlePerPageChange}
              >
                <option value={2}>2</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value="all">All</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="rounded-l-md border border-gray-300 p-2"
              />
            </div>
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                {canEditDepartments && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
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
              {currentDepartments.length > 0 ? (
                currentDepartments.map((department) => (
                  <tr key={department.id}>
                    {canEditDepartments && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-4">
                          <Link
                            href={`/Department/DepartmentEdit?id=${department.id}`}
                            className="flex items-center text-blue-600 hover:underline"
                          >
                            <Edit size={18} className="mr-1" />
                            Edit
                          </Link>
                          {isSuperUser && (
                            <button
                              className={`font-medium ${
                                department.status
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-green-600 hover:text-green-800"
                              } hover:underline`}
                              onClick={() =>
                                handleToggleStatus(
                                  department.id,
                                  department.status,
                                )
                              }
                            >
                              {department.status === "1"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {department.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {findManagerName(department.managerId)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`font-medium ${
                          department.status === "1"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {department.status === "1" ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canEditDepartments ? 4 : 3}
                    className="py-4 text-center"
                  >
                    No departments found
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
export default DepartmentListView;
