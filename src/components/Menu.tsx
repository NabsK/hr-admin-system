import React, { useState } from "react";
import { Menu as MenuIcon, X, LogOut, Home } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

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
        className="fixed left-4 top-4 z-50 rounded-md bg-gray-900 p-2 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Menu Content */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gradient-to-b from-gray-900 to-gray-700 p-6 text-white shadow-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="mb-8 text-center text-2xl font-bold tracking-wide">
          Menu
        </h2>
        <ul className="space-y-6">
          <li>
            <Link
              href="/"
              className="flex items-center text-lg font-medium transition-colors duration-150 hover:text-gray-300"
            >
              <Home size={20} className="mr-2" />
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/employees/EmployeeList"
              className="block text-lg font-medium transition-colors duration-150 hover:text-gray-300"
            >
              Employee List
            </Link>
          </li>
          {isSuperUser && (
            <li>
              <Link
                href="/employees/EmployeeCreate"
                className="block text-lg font-medium transition-colors duration-150 hover:text-gray-300"
              >
                Employee Create
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/Department/DepartmentList"
              className="block text-lg font-medium transition-colors duration-150 hover:text-gray-300"
            >
              Department List
            </Link>
          </li>
          {isSuperUser && (
            <li>
              <Link
                href="/Department/DepartmentCreate"
                className="block text-lg font-medium transition-colors duration-150 hover:text-gray-300"
              >
                Department Create
              </Link>
            </li>
          )}
        </ul>

        {/* Sign Out Button */}
        <div className="mt-8 border-t border-white/20 pt-6">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 py-2 text-lg font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
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
