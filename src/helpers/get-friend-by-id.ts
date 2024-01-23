import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  // retrieve friend for current user
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const getAllFriendDetail = (await fetchRedis(
        "get",
        `user:${friendId}`
      )) as string;
      const parsedgetAllFriendDetail = JSON.parse(getAllFriendDetail)
      return parsedgetAllFriendDetail;
    })
  );

  return friends
};
