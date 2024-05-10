import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router, privateProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // check if user is logged in
    if (!user?.id || !user?.email) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    // check if user in db
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    // check if user in db
    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const files = await db.file.findMany({
      where: { userId: ctx.userId },
    });

    return files;
  }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: { id: input.fileId, userId: ctx.userId },
      });

      if (!file) {
        return { status: "PENDING" as const };
      }

      return { status: file.uploadStatus };
    }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: { key: input.key, userId: ctx.userId },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      return file;
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const file = await db.file.findUnique({
        where: { id: input.id, userId },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      await db.file.delete({ where: { id: input.id } });

      return { success: true, file };
    }),
});

export type AppRouter = typeof appRouter;
