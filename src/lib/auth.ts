import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { users, accounts, sessions, verificationTokens } from "@/db/schema"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        // @ts-ignore
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
