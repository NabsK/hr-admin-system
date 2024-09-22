import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Department } from "~/types/department";
import Menu from "~/components/Menu";
import { FilePlus, X } from "lucide-react";

const DepartmentCreate = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [department, setDepartment] = useState<Partial<Department>>({
    name: "",
    managerId: "",
    status: "1", // Default to active status
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const createDepartmentMutation = api.department.create.useMutation({
    onSuccess: () => {
      router.push("/Department/DepartmentList");
    },
    onError: (error) => {
      console.error("Error creating department:", error);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDepartmentMutation.mutateAsync({
        name: department.name,
        managerId: Number(department.managerId) || undefined,
        status: department.status,
      });
    } catch (error) {
      console.error("Error creating department:", error);
    }
  };

  const { data: managers } = api.employee.getAllManagers.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Menu />
      <div className="container mx-auto flex-1 py-6">
        <h1 className="text-center text-2xl font-bold">
          HR Administration System
        </h1>
        <h2 className="mt-6 text-center text-xl font-semibold">
          Create Department
        </h2>

        <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-lg">
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
              onClick={() => router.push("/Department/DepartmentList")}
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

export default DepartmentCreate;
