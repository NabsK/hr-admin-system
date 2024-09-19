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
          ...input,
          employees: input.employeeIds
            ? {
                connect: input.employeeIds.map((id) => ({ id })),
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
          ...input,
          employees: input.employeeIds
            ? {
                set: input.employeeIds.map((id) => ({ id })),
              }
            : undefined,
        },
      });

      return updatedDepartment;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    // All authenticated users can view departments
    return ctx.prisma.department.findMany({
      include: { employees: true },
    });
  }),
});
