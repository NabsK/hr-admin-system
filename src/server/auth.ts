import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";

import { env } from "~/env";
import { db } from "~/server/db";
import { Role } from "~/utils/role"; // Make sure to import this

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: number;
      role: Role;
    };
  }

  interface User {
    id: number;
    role: Role;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      const employeeFromDb = await db.employee.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          role: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!employeeFromDb) {
        throw new Error("User not found in the database");
      }

      return {
        ...session,
        user: {
          id: employeeFromDb.id,
          role: employeeFromDb.role,
          email: employeeFromDb.email,
          name: `${employeeFromDb.firstName} ${employeeFromDb.lastName}`,
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    // Add more providers here if needed
    // For example, you might want to add a CredentialsProvider for email/password login
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
