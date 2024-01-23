import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utiles";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("UnAuth", { status: 401 });
    }
    const { id: idToDeny } = z.object({ id: z.string() }).parse(body);
    // pusherServer.trigger(
    //   toPusherKey(`user:${body.id}:incoming_friend_requests`),
    //   "incoming_friend_requests",
    //   { senderId: session.user.id, senderEmail: session.user.email }
    // );

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);
    return new Response('ok')
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
