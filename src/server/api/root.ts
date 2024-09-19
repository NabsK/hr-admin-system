import { createTRPCRouter } from "./trpc";
import { postRouter } from "./routers/post";
import { employeeRouter } from "./routers/employee";
import { departmentRouter } from "./routers/department";

export const appRouter = createTRPCRouter({
  post: postRouter,
  employee: employeeRouter,
  department: departmentRouter,
  // Add other routers here
});

export type AppRouter = typeof appRouter;
