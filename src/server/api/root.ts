import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { blocksRouter } from "~/server/api/routers/blocks";
import { unitsRouter } from "./routers/units";
import { batchRouter } from "./routers/batch";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  blocks: blocksRouter,
  units: unitsRouter,
  batch: batchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
