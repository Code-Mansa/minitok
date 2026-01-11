import { useMutation } from "@tanstack/react-query";
import { postAPI } from "@/services/endpoints";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export function useCreatePost() {
  return useMutation({
    mutationFn: async ({
      file,
      caption,
      onProgress,
    }: {
      file: File;
      caption?: string;
      onProgress?: (p: number) => void;
    }) => {
      const type = file.type.startsWith("video") ? "video" : "image";

      // 1️⃣ Get upload signature
      const sigRes = await postAPI.getUploadSignature(type);
      const sig = sigRes.data;

      // 2️⃣ Upload to Cloudinary
      const upload = await uploadToCloudinary(file, sig, onProgress);

      // 3️⃣ Create post
      const postRes = await postAPI.createPost({
        type,
        mediaUrl: upload.secureUrl,
        thumbnailUrl: upload.thumbnail,
        caption,
        duration: upload.duration,
      });

      return postRes.data;
    },
  });
}
