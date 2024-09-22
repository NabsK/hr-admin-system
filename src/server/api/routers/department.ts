import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// 0 - Super-user
// 1 - Manager
// 2 - Employee

export const departmentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        status: z.string(),
        managerId: z.number().optional(), // Add managerId in input
        employeeIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Users can create departments",
        });
      }

      const department = await ctx.prisma.department.create({
        data: {
          name: input.name,
          status: input.status,
          managerId: input.managerId, // Set managerId
          employees: input.employeeIds
            ? {
                connect: input.employeeIds.map((id) => ({
                  employeeId_departmentId: {
                    employeeId: id,
                    departmentId: department.id,
                  }, // Updated to correct relation
                })),
              }
            : undefined,
        },
      });

      return department;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        status: z.string().optional(),
        managerId: z.number().optional(), // Add managerId in input
        employeeIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Users can edit departments",
        });
      }

      const updatedDepartment = await ctx.prisma.department.update({
        where: { id: input.id },
        data: {
          name: input.name,
          status: input.status,
          managerId: input.managerId, // Update managerId
          employees: input.employeeIds
            ? {
                set: input.employeeIds.map((id) => ({
                  employeeId_departmentId: {
                    employeeId: id,
                    departmentId: input.id,
                  }, // Updated to correct relation
                })),
              }
            : undefined,
        },
      });

      return updatedDepartment;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    // All authenticated users can view departments
    return ctx.prisma.department.findMany({
      include: {
        employees: true,
      },
    });
  }),

  toggleActivationStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(), // Department ID
        action: z.enum(["Activate", "Deactivate"]), // Accept either "Activate" or "Deactivate"
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const department = await ctx.prisma.department.findUnique({
        where: { id: input.id },
      });

      if (!department) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department not found",
        });
      }

      // Only super users can change the activation status of departments
      if (ctx.user.role !== 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Users can activate or deactivate departments",
        });
      }

      // Determine the new status based on the action
      const newStatus = input.action === "Activate" ? "1" : "0";

      const updatedDepartment = await ctx.prisma.department.update({
        where: { id: input.id },
        data: {
          status: newStatus, // Set status based on the input action
        },
      });

      return updatedDepartment;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const department = await ctx.prisma.department.findUnique({
        where: { id: input.id },
        include: {
          employees: true,
        },
      });

      if (!department) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department not found",
        });
      }

      return department;
    }),
});
