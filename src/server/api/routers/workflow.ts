import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { flow, flowBlock, flowRequest } from "~/utils/types";

export const workflowRouter = createTRPCRouter({
  updateFlow: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        flow: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // check if workflow belongs to user
      const workflow = await ctx.prisma.workflow.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      if (workflow.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Workflow does not belong to user",
        });
      }

      return ctx.prisma.workflow.update({
        where: {
          id: input.id,
        },
        data: {
          flow: input.flow,
        },
      });
    }),

  delete: protectedProcedure

    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // check if workflow belongs to user
      const workflow = await ctx.prisma.workflow.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      if (workflow.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Workflow does not belong to user",
        });
      }

      return ctx.prisma.workflow.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.workflow.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const flow = {
        version: 1,
        blocks: [
          {
            type: "request",
          },
          {
            type: "response",
          },
        ],
      };

      return ctx.prisma.workflow.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          flow: flow,
        },
      });
    }),

  getWorkflow: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // check if workflow belongs to user
      const workflow = await ctx.prisma.workflow.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      if (workflow.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Workflow does not belong to user",
        });
      }

      return workflow;
    }),
});
