import React, { useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isSuperUser = session?.user?.role === 0;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="fixed left-1 top-4 z-50 rounded-md bg-sky-600 p-2 text-white"
      >
        {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </button>
      {/* Menu Content */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sky-600 p-4 text-white transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="mb-9 text-center text-xl font-bold">Menu</h2>
        <ul>
          <li className="mb-4">
            <a href="/employees/EmployeeList" className="hover:underline">
              Employee List
            </a>
          </li>
          {isSuperUser && (
            <li className="mb-4">
              <a href="/employees/EmployeeCreate" className="hover:underline">
                Employee Create
              </a>
            </li>
          )}
          <li className="mb-4">
            <a href="/Department/DepartmentList" className="hover:underline">
              Department List
            </a>
          </li>
          {isSuperUser && (
            <li className="mb-4">
              <a
                href="/Department/DepartmentCreate"
                className="hover:underline"
              >
                Department Create
              </a>
            </li>
          )}
        </ul>

        {/* Sign Out Button */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleSignOut}
            className="w-full rounded-md bg-transparent py-2 text-red-600 transition-colors hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </div>
      in tail
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50"
          onClick={toggleMenu}
        ></div>
      )}
    </>
  );
};

export default Menu;
