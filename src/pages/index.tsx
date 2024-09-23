import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "~/utils/api";

export default function EmployeeListView() {
  const { data: sessionData, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const hello = api.post.hello.useQuery({
    text: "Welcome to the HR Administration System",
  });

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-2xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>HR Administration System</title>
        <meta
          name="description"
          content="Manage employee details and departments"
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-gray-900 text-white">
        <div className="container max-w-4xl px-6 py-12">
          <h1 className="mb-8 text-center text-4xl font-bold leading-tight tracking-wide sm:text-5xl">
            HR Administration System
          </h1>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
            <Link
              className="group flex transform flex-col items-center gap-4 rounded-lg bg-gray-800 p-6 shadow-lg transition-all hover:-translate-y-2 hover:bg-gray-700 hover:shadow-2xl"
              href="/employees/EmployeeList"
            >
              <h3 className="text-2xl font-semibold group-hover:text-blue-400">
                Employees →
              </h3>
              <p className="text-lg text-gray-300 group-hover:text-gray-100">
                Manage and view employee details.
              </p>
            </Link>
            <Link
              className="group flex transform flex-col items-center gap-4 rounded-lg bg-gray-800 p-6 shadow-lg transition-all hover:-translate-y-2 hover:bg-gray-700 hover:shadow-2xl"
              href="/Department/DepartmentList"
            >
              <h3 className="text-2xl font-semibold group-hover:text-blue-400">
                Departments →
              </h3>
              <p className="text-lg text-gray-300 group-hover:text-gray-100">
                View and manage departments.
              </p>
            </Link>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-xl font-medium">
              {hello.data ? hello.data.greeting : "Loading..."}
            </p>
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
}

// Auth showcase component for displaying session info and sign in/sign out buttons
function AuthShowcase() {
  const { data: sessionData } = useSession();
  const { data: userRole, isLoading: isRoleLoading } =
    api.employee.getCurrentUserRole.useQuery(undefined, {
      enabled: !!sessionData,
    });

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-lg font-medium text-gray-100">
        {sessionData && !isRoleLoading
          ? `Logged in as ${userRole}`
          : sessionData
            ? "Loading role..."
            : "Not logged in"}
      </p>
      <button
        className="rounded-full bg-blue-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
