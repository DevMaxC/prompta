import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const blocksRouter = createTRPCRouter({
  getAllBlocks: protectedProcedure.query(async ({ ctx }) => {
    const blocks = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { blocks: true },
    });

    return blocks?.blocks;
  }),


  copyBlock: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //check if user owns block
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { blocks: { select: { id: true } } },
      });
      if (!user?.blocks.some((block) => block.id === input.id)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        const block = await ctx.prisma.block.findUnique({
          where: { id: input.id },
        });

        if (!block) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const newBlock = await ctx.prisma.block.create({
          data: {
            name: block?.name + " copy",
            messages: block?.messages || [],
            user: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
        return newBlock;
      }
    }),
  deleteBlock: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //check if user owns block
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { blocks: { select: { id: true } } },
      });
      if (!user?.blocks.some((block) => block.id === input.id)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        const block = await ctx.prisma.block.delete({
          where: { id: input.id },
        });
        return block;
      }
    }),

  createBlock: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.prisma.block.create({
        data: {
          name: input.name,
          user: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
      return block;
    }),

  getBlock: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      //check if user owns block
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { blocks: { select: { id: true } } },
      });
      if (!user?.blocks.some((block) => block.id === input.id)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        const block = await ctx.prisma.block.findUnique({
          where: { id: input.id },
        });
        return block;
      }
    }),

  updateMessage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.array(z.object({ role: z.string(), content: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //check if user owns block
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { blocks: { select: { id: true } } },
      });
      if (!user?.blocks.some((block) => block.id === input.id)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const block = await ctx.prisma.block.update({
        where: { id: input.id },
        data: {
          messages: input.data,
        },
      });


      return block;
    }),

  getUnits: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      //check if user owns block
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { blocks: { select: { id: true } } },
      });
      if (!user?.blocks.some((block) => block.id === input.id)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const block = await ctx.prisma.block.findUnique({
        where: { id: input.id },
        select: { units: true },
      });
      return block?.units;
    }),

  updateBlock: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //check if user owns block
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { blocks: { select: { id: true } } },
      });
      if (!user?.blocks.some((block) => block.id === input.id)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const block = await ctx.prisma.block.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });
      return block;
    }),
});
