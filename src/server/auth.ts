import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/server/db";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      name?: string | null | undefined;
      role?: string;
      email?: string | null | undefined;
    };
  }

  interface User {
    // ...other properties
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      return { ...token, ...user };
    },
    session: async ({ session, token, user }) => {
      session.user = token;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Seu email..." },
        password: {
          label: "Senha",
          type: "password",
          placeholder: "Sua senha...",
        },
      },
      authorize: async (credentials) => {
        if (!credentials) throw new Error("Credenciais inválidas.");
        const { email, password } = credentials;

        const user = await prisma.user.findFirst({
          where: {
            email,
          },
        });

        if (!user) throw new Error("O usuário não existe.");
        if (!user.is_enabled) throw new Error("O usuário está desativado.");

        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return {
            id: `${user.id}`,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } else {
          throw new Error("Credenciais inválidas.");
        }
      },
    }),
  ],
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};