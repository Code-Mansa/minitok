export type Post = {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  type: "video" | "image";
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  duration?: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  bookmarkCount: number;
  sharesCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
};

export type FeedType = "following" | "forYou";

export type FeedResponse = {
  posts: Post[];
  nextCursor?: string | null;
};
