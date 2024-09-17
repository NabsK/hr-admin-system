import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "~/lib/prisma"; // Adjust path according to your structure

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Ensure credentials are provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials provided");
        }

        // Fetch the user from the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Check if the user exists and if the password matches
        if (user && user.password === credentials.password) {
          return user;
        }

        // Return null if authentication fails
        throw new Error("Invalid email or password");
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for session strategy
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET, // Ensure you have a JWT secret in your .env file
  },
  callbacks: {
    async session({ session, token }) {
      // Attach user ID to the session object
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      // Attach user ID to the token if the user is available
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login", // Custom sign-in page
    error: "/auth/error", // Custom error page
  },
};

export default NextAuth(authOptions);
