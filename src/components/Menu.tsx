import React, { useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
