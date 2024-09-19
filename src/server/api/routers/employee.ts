import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// 0 - Super-user
// 1 - Manager
// 2 - Employee

export const employeeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        telephone: z.string(),
        email: z.string().email(),
        role: z.number().min(0).max(2),
        managerId: z.number().optional(),
        status: z.boolean(),
        departmentIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 2) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Users can create employees",
        });
      }

      const employee = await ctx.prisma.employee.create({
        data: {
          ...input,
          password: "Password123#", // Default password
          departments: {
            connect: input.departmentIds.map((id) => ({ id })),
          },
        },
      });

      return employee;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        telephone: z.string().optional(),
        email: z.string().email().optional(),
        role: z.number().min(0).max(2).optional(),
        managerId: z.number().optional(),
        status: z.boolean().optional(),
        departmentIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.prisma.employee.findUnique({
        where: { id: input.id },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      const isOwnProfile = ctx.user.id === employee.id;
      const canEditOthers = ctx.user.role === 2;

      if (!isOwnProfile && !canEditOthers) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own data",
        });
      }

      // Only super users can change role or status
      if (ctx.user.role !== 0) {
        delete input.role;
        delete input.status;
      }

      const updatedEmployee = await ctx.prisma.employee.update({
        where: { id: input.id },
        data: {
          ...input,
          departments: input.departmentIds
            ? {
                set: input.departmentIds.map((id) => ({ id })),
              }
            : undefined,
        },
      });

      return updatedEmployee;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userRole = ctx.user.role;
    const userId = ctx.user.id;

    if (userRole === 0) {
      return await ctx.prisma.employee.findMany({
        include: {
          departments: true,
        },
      });
    } else if (userRole === 1) {
      return await ctx.prisma.employee.findMany({
        where: {
          managerId: userId,
        },
        include: {
          departments: true,
        },
      });
    } else if (userRole === 2) {
      const employee = await ctx.prisma.employee.findUnique({
        where: {
          id: userId,
        },
        include: {
          departments: true,
        },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      return [employee];
    } else {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid role",
      });
    }
  }),
});
