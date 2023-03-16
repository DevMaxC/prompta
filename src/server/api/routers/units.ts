import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const unitsRouter = createTRPCRouter({
  addUnit: protectedProcedure
    .input(
      z.object({ name: z.string(), content: z.string(), blockId: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      //check if block is owned by user
      const block = await ctx.prisma.block.findUnique({
        where: { id: input.blockId },
        select: {
          userId: true,
        },
      });
      if (block?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        const unit = await ctx.prisma.unit.create({
          data: {
            name: input.name,
            block: {
              connect: { id: input.blockId },
            },
            content: input.content,
          },
        });
        return unit;
      }
    }),

  updateUnit: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //check if unit is owned by user
      const unit = await ctx.prisma.unit.findUnique({
        where: { id: input.id },
        select: {
          block: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (unit?.block.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        const unit = await ctx.prisma.unit.update({
          where: { id: input.id },
          data: {
            name: input.name,
            content: input.content,
          },
        });
        return unit;
      }
    }),

  deleteUnit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //check if unit is owned by user
      const unit = await ctx.prisma.unit.findUnique({
        where: { id: input.id },
        select: {
          block: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (unit?.block.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      } else {
        const unit = await ctx.prisma.unit.delete({
          where: { id: input.id },
        });
        return unit;
      }
    }),
});
