import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyPassword } from "@/src/lib/auth/password";

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsed.data.email.toLowerCase(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
          },
        });

        if (
          !user ||
          user.role !== "ADMIN" ||
          !user.passwordHash ||
          !verifyPassword(parsed.data.password, user.passwordHash)
        ) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "");
      }

      return session;
    },
  },
});
