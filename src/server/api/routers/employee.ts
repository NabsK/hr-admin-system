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
    const userId: number = ctx.user.id;

    if (userRole === 0) {
      return await ctx.prisma.employee.findMany({
        include: {
          departments: true,
        },
      });
    } else if (userRole === 1) {
      // First, get the manager
      const manager = await ctx.prisma.employee.findUnique({
        where: {
          id: userId,
        },
        include: {
          departments: true,
        },
      });

      // Then, get the employees under this manager
      const employees = await ctx.prisma.employee.findMany({
        where: {
          managerId: userId,
        },
        include: {
          departments: true,
        },
      });

      // Combine manager and employees into a single array
      return [manager, ...employees];
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

  getManager: protectedProcedure
    .input(z.object({ managerId: z.number().nullable() }))
    .query(async ({ ctx, input }) => {
      if (input.managerId === null) {
        return null;
      }

      const manager = await ctx.prisma.employee.findUnique({
        where: {
          id: input.managerId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      return manager;
    }),

  // New method to get a single employee by userId
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.prisma.employee.findUnique({
        where: { id: input.id },
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

      return employee;
    }),

  // New method to update the current employee's details
  updateOwnProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        telephone: z.string().optional(),
        email: z.string().email().optional(),
        departmentIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId: number = ctx.user.id;

      const employee = await ctx.prisma.employee.findUnique({
        where: { id: userId },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      const updatedEmployee = await ctx.prisma.employee.update({
        where: { id: userId },
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

  // New method to deactivate an employee
  toggleActivationStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(), // Employee ID
        action: z.enum(["Activate", "Deactivate"]), // Accept either "Activate" or "Deactivate"
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

      // Only super users can change the activation status of employees
      if (ctx.user.role !== 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Users can activate or deactivate employees",
        });
      }

      // Determine the new status based on the action
      const newStatus = input.action === "Activate" ? true : false;

      const updatedEmployee = await ctx.prisma.employee.update({
        where: { id: input.id },
        data: {
          status: newStatus, // Set status based on the input action
        },
      });

      return updatedEmployee;
    }),

  // Method to get an employee's full name by their ID
  getFullName: protectedProcedure
    .input(z.object({ id: z.number() })) // Input expects the employee's ID
    .query(async ({ ctx, input }) => {
      const employee = await ctx.prisma.employee.findUnique({
        where: { id: input.id },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      // Return full name as a single string
      return `${employee.firstName} ${employee.lastName}`;
    }),
});
