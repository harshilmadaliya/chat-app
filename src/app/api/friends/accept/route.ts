import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utiles";
import { getServerSession } from "next-auth";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("unAuth", { status: 401 });
    }

    // verify both users are not already friend
    // const isAlreadyFriends = await fetchRedis(
    //   "sismember",
    //   `user:${session.user.id}:friends`
    // );
    // if (isAlreadyFriends) {
    //   return new Response("already friends", { status: 401 });
    // }
    const hasFriendRequest = await fetchRedis('sismember' , `user:${session.user.id}:incoming_friend_requests`,idToAdd)
    if (!hasFriendRequest) {
      return new Response('No friend request' , {status:400})
    }

    pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`) , 'new_friend' , {})

    await db.sadd(`user:${session.user.id}:friends`,idToAdd)
    await db.sadd(`user:${idToAdd}:friends`, session.user.id)

    // await db.srem(`user:${idToAdd}:outbound_incoming_friend_requests` , session.user.id)
    await db.srem(`user:${session.user.id}:incoming_friend_requests` , idToAdd)
    
    return new Response('ok')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload' , {status : 422})
    }
    return new Response('Invalid request', { status:400})
  }
}