import { TRPCError } from "@trpc/server";
import { Configuration, OpenAIApi } from "openai";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import complete from "~/utils/complete";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export const batchRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getBatches: protectedProcedure
    .input(
      z.object({
        blockId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      //check if block is owned by user
      const block = await ctx.prisma.block.findUnique({
        where: { id: input.blockId },
      });
      if (block?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        if (block) {
          const batches = await ctx.prisma.batch.findMany({
            where: { blockId: input.blockId },
          });
          return batches;
        }
      }
    }),
  getCompletions: protectedProcedure
    .input(
      z.object({
        batchId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      //check if block is owned by user
      const batch = await ctx.prisma.batch.findUnique({
        where: { id: input.batchId },
        include: { testCompletions: true, block: true },
      });

      if (batch?.block.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        if (batch) {
          return batch.testCompletions;
        }
      }
    }),

  startBatch: protectedProcedure
    .input(
      z.object({
        blockId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      if (user == null) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      if (user.stripeSubscriptionStatus !== "active") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You need to have billing enabled to use this feature.",
        });
      }

      //check if block is owned by user
      const block = await ctx.prisma.block.findUnique({
        where: { id: input.blockId },
        include: { units: true },
      });
      if (block?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        const newBatch = await ctx.prisma.batch.create({
          data: {
            block: {
              connect: { id: input.blockId },
            },
            name: "Batch - " + new Date().toLocaleString(),
          },
        });

        block.units.forEach(async (unit) => {
          const jsonised = JSON.parse(unit.content);

          const ideal = jsonised.ideal;
          if (ideal == null) {
            throw new TRPCError({
              message: "No ideal was set in your unit.",
              code: "BAD_REQUEST",
            });
          }

          for (const key in jsonised) {
            if (key !== "ideal") {
              ctx.prisma.block
                .findUnique({
                  where: { id: input.blockId },
                })
                .then(async (block) => {
                  if (block == null) {
                    throw new TRPCError({ code: "BAD_REQUEST" });
                  }
                  const e = block?.messages?.valueOf() as Message[];

                  const messages = e.map((message) => {
                    message.content = message.content.replace(
                      new RegExp(`{${key}}`, "g"),
                      jsonised[key]
                    );
                    return message;
                  });

                  console.log(messages);

                  const completion = await complete(
                    messages,
                    "gpt-3.5-turbo",
                    user?.id
                  );

                  if (completion == null) {
                    throw new TRPCError({ code: "BAD_REQUEST" });
                  }

                  const response = completion.data.choices[0]?.message;

                  console.log(response);

                  //short uuid
                  const uuid = Math.random().toString(36).substring(2, 15);

                  await ctx.prisma.testCompletion.create({
                    data: {
                      actual: response?.content || "<No response>",
                      expected: ideal,
                      content: unit.content,
                      batch: {
                        connect: { id: newBatch.id },
                      },
                      name: unit.name + "-" + uuid,
                      success: response?.content.includes(ideal) || false,
                    },
                  });
                });
            }
          }
        });
      }
    }),
});
