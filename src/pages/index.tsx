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

  // Example query - replace with relevant tRPC queries for your HR system
  const hello = api.post.hello.useQuery({
    text: "Welcome to the HR Administration System",
  });

  // Show loading state while checking session
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If authenticated, show the main page
  return (
    <>
      <Head>
        <title>HR Administration System</title>
        <meta
          name="description"
          content="Manage employee details and departments"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1aa3ff] to-[#404040]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            HR Administration System
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/employees/EmployeeList"
            >
              <h3 className="text-2xl font-bold">Employees →</h3>
              <div className="text-lg">Manage and view employee details.</div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/departments"
            >
              <h3 className="text-2xl font-bold">Departments →</h3>
              <div className="text-lg">View and manage departments.</div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
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
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && !isRoleLoading
          ? `Logged in as ${userRole}`
          : sessionData
            ? "Loading role..."
            : "Not logged in"}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
