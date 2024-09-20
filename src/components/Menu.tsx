// src/components/Menu.tsx
const Menu = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 p-4 text-white">
      <h2 className="mb-6 text-xl font-semibold">Menu</h2>
      <ul>
        <li className="mb-4">
          <a href="/employees/EmployeeList" className="hover:underline">
            Employee List
          </a>
        </li>
        <li className="mb-4">
          <a href="/employees/EmployeeCreateEdit" className="hover:underline">
            Employee Create/Edit
          </a>
        </li>
        <li className="mb-4">
          <a href="/Department/DepartmentList" className="hover:underline">
            Department List
          </a>
        </li>
        <li className="mb-4">
          <a
            href="/Department/DepartmentCreateEdit"
            className="hover:underline"
          >
            Department Create/Edit
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
