import { NextAuthOptions } from "next-auth";

import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/helpers/redis";
import { Adapter } from "next-auth/adapters";

function getGoogleCredentials() {
  const clientId = `${process.env.GOOGLE_CLIENT_ID}`;
  const clientSecret = `${process.env.GOOGLE_CLIENT_SECRET}`;

  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // const dbuser = (await db.get(`user:${token.id}`)) as User | null;
      const dbuserResult = (await fetchRedis("get", `user:${token.id}`)) as
        | string
        | null;

      //User is new
      if (!dbuserResult) {
        token.id = user!.id;
        return token;
      }

      const dbuser = JSON.parse(dbuserResult) as User;

      //User is not new that means dbuser is exists
      return {
        id: dbuser.id,
        name: dbuser.name,
        email: dbuser.email,
        picture: dbuser.image,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
    redirect() {
      return "/dashboard";
    },
  },
};
