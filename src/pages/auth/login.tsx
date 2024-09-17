// pages/auth/login.tsx

import { GetServerSideProps } from "next";
import { getCsrfToken } from "next-auth/react";
import LoginForm from "~/components/forms/LoginForm"; // Importing the reusable LoginForm component

const LoginPage = ({ csrfToken }: { csrfToken: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Login</h2>
        <LoginForm csrfToken={csrfToken} />{" "}
        {/* Pass the CSRF token to the form */}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
};

export default LoginPage;
