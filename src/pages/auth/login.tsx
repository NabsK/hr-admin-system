// pages/auth/login.tsx

import LoginForm from "~/components/forms/LoginForm"; // Importing the reusable LoginForm component

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Login</h2>
        <LoginForm /> {/* Using the LoginForm component */}
      </div>
    </div>
  );
};

export default LoginPage;
