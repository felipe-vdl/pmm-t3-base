import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

export const userRouter = createTRPCRouter({
  getUserInfo: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.id) {
      return ctx.prisma.user.findFirst({
        where: {
          id: +ctx.session.user.id,
        },
      });
    }
    throw new TRPCError({ code: "BAD_REQUEST" });
  }),
  list: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
  register: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        role: z.enum(["USER", "ADMIN", "SUPERADMIN"]),
      })
    )
    .mutation(async ({ input, ctx: { prisma } }) => {
      const { email, name, role } = input;
      const isUserExistant = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (isUserExistant) {
        throw new Error("O Email informado já está em uso.");
      }

      await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: await bcrypt.hash(
            process.env.DEFAULT_PASSWORD ?? "admin",
            10
          ),
          role,
          updated_at: null,
        },
      });

      return { message: "Usuário criado com sucesso." };
    }),
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string(),
        confirmNewPassword: z.string(),
      })
    )
    .mutation(async (req) => {
      const { currentPassword, newPassword, confirmNewPassword } = req.input;
      if (newPassword !== confirmNewPassword) {
        throw new Error("Confirme a nova senha corretamente.");
      }

      const { prisma, session } = req.ctx;

      if (!session.user?.email)
        throw new Error("Usuário não está autenticado.");

      const user = await req.ctx.prisma.user.findFirst({
        where: {
          email: session.user?.email,
        },
      });

      if (!user) throw new Error("Usuário não existe.");

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        throw new Error("Senha atual incorreta.");
      }

      await prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          password: await bcrypt.hash(newPassword, 10),
        },
      });

      return { message: "Senha alterada com sucesso." };
    }),
  deactivate: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({ where: { id: +input } });
      if (user) {
        await ctx.prisma.user.update({
          where: { id: +input },
          data: {
            is_enabled: !user.is_enabled,
          },
        });

        return { message: "O acesso do usuário foi modificado com sucesso." };
      } else {
        throw new Error("O usuário não existe.");
      }
    }),
  resetPassword: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({ where: { id: +input } });
      if (user) {
        await ctx.prisma.user.update({
          where: { id: +input },
          data: {
            password: await bcrypt.hash(
              process.env.DEFAULT_PASSWORD ?? "admin",
              10
            ),
          },
        });
        return { message: "Senha restaurada com sucesso." };
      } else {
        throw new Error("O usuário não existe.");
      }
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        role: z.enum(["USER", "ADMIN", "SUPERADMIN"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, email, role, name } = input;

      const checkExistingUser = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      });
  
      if (checkExistingUser && checkExistingUser.id !== +id) {
        throw new Error("O e-mail informado já está em uso por outro usuário.");
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data: {
          name: name,
          email: email,
          role: role,
        },
      });

      return {
        message: "Usuário atualizado com sucesso.",
        updatedUser: {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      };
    }),
});
