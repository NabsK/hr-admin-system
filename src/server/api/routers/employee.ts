// src/server/routers/employee.ts

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const employeeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Ensure ctx.prisma is being used here
    return await ctx.prisma.employee.findMany({
      include: {
        manager: true, // Include manager details
      },
    });
  }),
});
