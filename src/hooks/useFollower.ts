import { useQuery } from "@tanstack/react-query";
import { followAPI } from "../services/endpoints";

export const useFollowData = (open: boolean) => {
  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ["followingUsers"],
    queryFn: async () => {
      const res = await followAPI.followingUsers();
      return res.data.users;
    },
    enabled: open,
  });

  const { data: suggested = [], isLoading: suggestedLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      console.log("following:", following);
      const res = await followAPI.suggestedUsers();
      return res.data.suggested;
    },
    enabled: open,
  });

  return {
    following,
    suggested,
    followingLoading,
    suggestedLoading,
  };
};
