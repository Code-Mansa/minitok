import api from "@/lib/api";

export const authAPI = {
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post("/auth/login", data),

  register: (data: { email: string; password: string; username: string }) =>
    api.post("/auth/register", data),

  me: () => api.get("/auth/me"),

  logout: () => api.post("/auth/logout"),
};

export const profileAPI = {
  getProfile: (username: string) => api.get(`/users/${username}`),

  updateMe: (data: { bio?: string; website?: string; avatar?: string }) =>
    api.patch("/auth/me", data),

  getUploadSignature: (type: "image" | "video" | "avatar") =>
    api.post("/upload/cloudinary", { type }),

  toggleFollow: (username: string) => api.post(`/users/${username}/follow`),
};

// Post endpoint
export const postAPI = {
  getUploadSignature: (type: "image" | "video" | "avatar") =>
    api.post("/upload/cloudinary", { type }),

  createPost: (data: {
    type: "image" | "video";
    mediaUrl: string;
    thumbnailUrl?: string | null;
    caption?: string;
    duration?: number;
  }) => api.post("/posts/create", data),

  toggleLike: (postId: string) => api.post(`/posts/${postId}/like`),

  toggleBookmark: (postId: string) => api.post(`/posts/${postId}/bookmark`),

  postComment: (postId: string, data: { text: string; parent?: string }) =>
    api.post(`/posts/${postId}/comments`, data),

  getComments: (postId: string) => api.get(`/posts/${postId}/comments`),
};

// Post endpoint
export const commentAPI = {
  toggleLike: (commentId: string) => api.post(`/comments/${commentId}/like`),
};

// Follower suggestion endpoint
export const followAPI = {
  followingUsers: () => api.get("/users/following"),
  suggestedUsers: () => api.get("/users/suggested"),
};
