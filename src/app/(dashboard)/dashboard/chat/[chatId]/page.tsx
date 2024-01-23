import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import axios from "axios";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useState } from "react";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const result: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    const dbMessages = result.map((message) => JSON.parse(message) as Message);

    // display message from reverse
    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }
  const { user } = session;
  const [userId1, userId2] = chatId.split("--");
  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }
  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  // const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User
  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 md:m-3 mt-14 mx-3 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-2 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative md:w-8 w-7 sm:w-12 md:h-8 h-7 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name}`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="md:text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm md:text-xs text-gray-600">
              {chatPartner.email}
            </span>
          </div>
        </div>
      </div>

      <Messages
        chatId={chatId}
        sessionImg={session.user.image}
        chatPartner={chatPartner}
        sessionId={session.user.id}
        initialMessages={initialMessages}
      />
      {/* <ChatInput chatId={chatId} chatPartner={chatPartner} /> */}
      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
};

export default page;
