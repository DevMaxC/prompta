import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

function generateApiKey(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export const keysRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.promptaKey.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    async function loop() {
      let passed = false;
      while (!passed) {
        const key = generateApiKey(32);
        // check if the key already exists
        const keyExists = await ctx.prisma.promptaKey.findUnique({
          where: {
            key: key,
          },
        });
        if (!keyExists) {
          passed = true;
          return key;
        }
      }
    }

    const key = await loop();
    if (key === undefined) {
      console.log("Key wasnt generated error");
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    await ctx.prisma.promptaKey.create({
      data: {
        key: key,
        userId: ctx.session.user.id,
      },
    });
    return true;
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // check if the key belongs to the user
      const key = await ctx.prisma.promptaKey.findUnique({
        where: {
          id: input.id,
        },
      });

      if (key === null) throw new TRPCError({ code: "NOT_FOUND" });

      if (key.userId !== ctx.session.user.id)
        throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.promptaKey.delete({
        where: {
          id: input.id,
        },
      });
      return true;
    }),
});
