import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Menu from "~/components/Menu";
import { Department } from "~/types/department";

const DepartmentEdit = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [department, setDepartment] = useState<Partial<Department>>({
    name: "",
    status: "1", // Default to active
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const { data: managers } = api.employee.getAllManagers.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const { data: departmentData, isLoading: isDepartmentLoading } =
    api.department.getById.useQuery(
      { id: parseInt(id as string) },
      { enabled: !!id && status === "authenticated" },
    );

  useEffect(() => {
    if (departmentData) {
      setDepartment({
        name: departmentData.name,
        status: departmentData.status,
        managerId: departmentData.managerId, // Pre-fill managerId
      });
    }
  }, [departmentData]);

  const { mutateAsync: updateDepartment } = api.department.update.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDepartment({
        id: parseInt(id as string),
        ...department,
      });
      router.push("/Department/DepartmentList");
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  if (status === "loading" || isDepartmentLoading) return <p>Loading...</p>;

  return (
    <div className="flex">
      <Menu />
      <div className="container mx-auto flex-1 py-6">
        <h1 className="text-2xl font-bold">HR Administration System</h1>
        <h2 className="mt-6 text-xl font-semibold">Edit Department</h2>

        <form onSubmit={handleSubmit} className="mt-6 max-w-lg">
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block font-bold">
              *Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={department.name}
              onChange={handleInputChange}
              required
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
              value={department.managerId ?? ""}
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
            <label htmlFor="status" className="mb-2 block font-bold">
              *Status
            </label>
            <select
              id="status"
              name="status"
              value={department.status}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => router.push("/Department/DepartmentList")}
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

export default DepartmentEdit;
