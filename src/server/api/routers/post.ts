import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: ` ${input?.text ?? "world"}`,
      };
    }),
  // Add other procedures here
});
