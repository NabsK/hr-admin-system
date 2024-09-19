import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Employee } from "~/types/employee";

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
        id: employee.id.toString(),
        manager: employee.manager
          ? { ...employee.manager, id: employee.manager.id.toString() }
          : null,
      }));
      setEmployees(convertedData);
    }
  }, [data]);

  if (status === "loading" || isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching employees: {error.message}</p>;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold">Employee List</h1>
      <table className="mt-4 min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
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
                <td className="whitespace-nowrap px-6 py-4">
                  {employee.firstName} {employee.lastName}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {employee.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {employee.manager?.firstName} {employee.manager?.lastName}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {employee.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 text-center">
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeListView;
