"use client";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utiles";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";

interface FriendsRequestProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}


const FriendRequest: FC<FriendsRequestProps> = ({
  sessionId,
  incomingFriendRequests,
}) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderEmail,
      senderId,
      senderImg,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [
        ...prev,
        { senderId, senderEmail, senderImg },
      ]);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);
  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    router.refresh();
  };
  const denyFriend = async (senderId: string) => {
    await axios.post("/api/friends/deny", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    router.refresh();
  };
  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">No any friend request...</p>
      ) : (
        friendRequests.map((data) => (
          <>
            <div key={data.senderId} className="md:flex gap-4 items-center">
              <div className="flex gap-4 ">
                <div className="w-9 h-9 md:h-[40px] md:w-[42px]">
                  <Image
                    alt={`Profile Picture`}
                    src={`${data.senderImg}` }
                    width={42}
                    height={42}
                    className="text-black rounded-full"
                  />
                </div>
                <div className="md:flex gap-4 md:items-center">
                  <p className="font-medium md:text-lg text-md">{data.senderEmail}</p>

                  <div className="flex md:gap-4 gap-2">
                    <button
                      onClick={() => acceptFriend(data.senderId)}
                      aria-label="accept friend"
                      className="md:w-8 md:h-8 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
                    >
                      <Check className="font-semibold text-white w-3/4 h-3/4" />
                    </button>

                    <button
                      onClick={() => denyFriend(data.senderId)}
                      aria-label="deny friend"
                      className="md:w-8 md:h-8 w-6 h-6 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
                    >
                      <X className="font-semibold text-white w-3/4 h-3/4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ))
      )}
    </>
  );
};

export default FriendRequest;
