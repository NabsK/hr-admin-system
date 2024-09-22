import { GetServerSideProps } from "next";
import { getCsrfToken } from "next-auth/react";
import LoginForm from "~/components/forms/LoginForm";

const LoginPage = ({ csrfToken }: { csrfToken: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-600 to-gray-900">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg transition-all hover:shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-semibold text-white">
          Login
        </h2>
        <LoginForm csrfToken={csrfToken} />
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
