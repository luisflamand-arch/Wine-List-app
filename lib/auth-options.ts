import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }
        try {
          const email = credentials.email.trim().toLowerCase();
          console.log(`[AUTH] Login attempt for: ${email}`);
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            console.log(`[AUTH] User not found: ${email}`);
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log(`[AUTH] Invalid password for: ${email}`);
            return null;
          }
          console.log(`[AUTH] Login successful for: ${email}`);
          return { id: user.id, email: user.email, name: user.name ?? "", role: user.role };
        } catch (err) {
          console.error('[AUTH] Error during authorization:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user?.role;
        token.id = user?.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).role = token?.role;
        (session.user as any).id = token?.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  jwt: { maxAge: 30 * 24 * 60 * 60 }, // 30 days
  secret: process.env.NEXTAUTH_SECRET,
};
