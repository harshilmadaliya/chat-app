import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utiles";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    console.log(session?.user.id);
    console.log(body.sessionId);
    console.log(body.friendId);
    console.log(chatHrefConstructor(body.sessionId, body.friendId));
    console.log(`chat:${chatHrefConstructor(body.sessionId, body.friendId)}:messages`)

    if (!session) {
      return new Response("UnAuth", { status: 401 });
    }
    // const { id: friendId } = z.object({ id: z.string() }).parse(body);

    await pusherServer.trigger(toPusherKey(`user:${body.friendId}:friends`) , 'remove_friend' , {})

    await db.srem(`user:${session.user.id}:friends`, body.friendId);
    await db.srem(`user:${body.friendId}:friends`, session.user.id);
    await db.zrem(
      `chat:${chatHrefConstructor(body.sessionId, body.friendId)}:messages`,
      0,
      -1
    );

    return new Response("ok");
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
