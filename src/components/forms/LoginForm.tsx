// components/forms/LoginForm.tsx

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

const LoginForm = ({ csrfToken }: { csrfToken: string }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform sign-in using next-auth signIn method
    const result = await signIn("credentials", {
      redirect: false, // We handle the redirect manually
      email,
      password,
      csrfToken, // Add the CSRF token to the sign-in request
    });

    if (result?.error) {
      // If sign-in fails, show the error
      setError(result.error);
    } else {
      // Redirect to employees page after successful login
      router.push("/employees");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />{" "}
      {/* CSRF Token */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
