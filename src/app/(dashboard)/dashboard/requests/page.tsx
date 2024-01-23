// 'use client'
import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const incomingFriendsRequestId = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendsRequestData = await Promise.all(
    incomingFriendsRequestId.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const senderparsed = JSON.parse(sender) as User
      return {
        senderId,
        senderEmail: senderparsed.email,
        senderImg: senderparsed.image
      };
    })
  );

  return (
    <main className="md:mt-8 md:ml-6 mt-32 ml-6">
      <h1 className="font-bold text-2xl md:text-5xl mb-8">Add a friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={incomingFriendsRequestData}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default page;
