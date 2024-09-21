import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Department } from "~/types/department";
import Menu from "~/components/Menu";

const DepartmentCreate = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [department, setDepartment] = useState<Partial<Department>>({
    name: "",
    managerId: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.department.create.mutate(department);
      router.push("/departments");
    } catch (error) {
      console.error("Error creating department:", error);
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

        <h2 className="mt-6 text-xl font-semibold">Create Department</h2>

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
              value={department.managerId}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="">- Select -</option>
              {/* Add manager options here */}
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
              onClick={() => router.push("/departments")}
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

export default DepartmentCreate;
