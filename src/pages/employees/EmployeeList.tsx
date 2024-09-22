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

  const { mutateAsync: getEmployeeManager } =
    api.employee.getEmployeeManager.useMutation();

  useEffect(() => {
    const fetchManagers = async () => {
      if (data) {
        const updatedEmployees = await Promise.all(
          data.map(async (employee) => {
            if (employee.managerId) {
              try {
                const manager = await getEmployeeManager({ id: employee.id });
                return {
                  ...employee,
                  manager,
                };
              } catch (err) {
                console.error("Error fetching manager:", err);
              }
            }
            return employee;
          }),
        );
        setEmployees(updatedEmployees);
      }
    };

    fetchManagers();
  }, [data, getEmployeeManager]);

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

  if (status === "loading" || isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching employees: {error.message}</p>;

  const isSuperUser = session?.user?.role === 0;

  return (
    <div className="flex">
      <Menu />
      <div className="container mx-auto flex-1 py-6">
        <h2 className="mt-6 text-xl font-semibold">Employees</h2>

        <div className="mt-6">
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
                  Telephone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
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
                      {employee.manager
                        ? `${employee.manager.firstName} ${employee.manager.lastName}`
                        : "No Manager"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`font-medium ${employee.status ? "text-green-600" : "text-red-600"}`}
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
        </div>
      </div>
    </div>
  );
};

export default EmployeeListView;
