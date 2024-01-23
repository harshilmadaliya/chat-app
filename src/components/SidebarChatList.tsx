"use client";
import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utiles";
import { Divide, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";
import Image from "next/image";
import axios from "axios";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessages extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const [unseenMessages, setunseenMessages] = useState<Message[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // const deletefriend = async (friendId: string, sessionId: string) => {
  //   console.log("delete");
  //   try {
  //     await axios.post("/api/friends/remove", {
  //       friendId: friendId,
  //       sessionId: sessionId,
  //     });

  //     pusherClient.subscribe(toPusherKey(`user:${friendId}:friends`));
  //     const newFriendHandler = () => {
  //       console.log("hello from router . push");
  //       router.push(`/dashboard`);
  //     };
  //      await pusherClient.bind("remove_friend", newFriendHandler);
  //     pusherClient.unsubscribe(toPusherKey(`user:${friendId}:friends`));
  //     pusherClient.unbind("remove_friend", newFriendHandler);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));

    const chatHandler = (message: ExtendedMessages) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      // should be notified
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderName={message.senderName}
          senderImg={message.senderImg}
          senderMessage={message.text}
        />
      ));

      setunseenMessages((prev) => [...prev, message]);
    };
    const newFriendHandler = () => {
      router.refresh();
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [pathname, sessionId, router ]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setunseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);
  return (
    <ul
      role="list"
      className="max-h-[25rem] w-full overflow-y-auto -m-2 space-y-1"
    >
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;

        return (
          <div className="flex justify-between" key={friend.id}>
            <a
              className="text-gray-700 hover:text-indigo-600 hover:bg-slate-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}
            >
              <Image
                src={friend.image}
                alt=""
                width={32}
                height={32}
                className="rounded-full"
              />
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center ">
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
            {/* <div
              className="flex my-2.5 w-auto h-auto hover:cursor-pointer hover:text-indigo-600 hover:bg-slate-50"
              onClick={() => deletefriend(friend.id, sessionId)}
            >
              <Trash2 />
            </div> */}
          </div>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
