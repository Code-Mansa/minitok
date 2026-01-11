"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { profileAPI, postAPI } from "@/services/endpoints";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current user profile (isMe = true)
  const { user, isLoading } = useAuth(); // You'll create this variant
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [bio, setBio] = useState(() => user?.bio ?? "");
  const [website, setWebsite] = useState(() => user?.website ?? "");

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setPreviewImage(URL.createObjectURL(file));

    try {
      const sigRes = await postAPI.getUploadSignature("avatar");
      const signature = sigRes.data;

      const uploadRes = await uploadToCloudinary(file, signature);

      await profileAPI.updateMe({ avatar: uploadRes.secureUrl });

      // Invalidate profile cache
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setPreviewImage(null);
    } catch {
      console.error("Avatar upload failed");
      setPreviewImage(null);
    }
  };

  const handleSave = async () => {
    try {
      await profileAPI.updateMe({ bio: bio.trim(), website: website.trim() });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.back();
    } catch {
      console.error("Update failed");
    }
  };

  if (isLoading || !user) {
    return <div className='text-center mt-20'>Loading...</div>;
  }

  return (
    <main className='min-h-screen bg-black text-white pb-16'>
      {/* Header */}
      <div className='fixed top-0 left-0 right-0 bg-black border-b border-white/10 z-10'>
        <div className='flex items-center justify-between px-4 py-3'>
          <button onClick={() => router.back()}>
            <ChevronLeft size={28} />
          </button>
          <h1 className='font-semibold'>Edit profile</h1>
          <Button
            onClick={handleSave}
            className='bg-linear-to-br from-yellow-600 to-yellow-500 hover:bg-yellow-700 text-white font-medium px-6'>
            Save
          </Button>
        </div>
      </div>

      <div className='pt-16 px-4 space-y-8'>
        {/* Avatar */}
        <div className='flex flex-col items-center gap-4 py-6'>
          <div className='relative'>
            <Image
              src={previewImage || user.avatar || "/avatar/default.jpg"}
              alt='profile'
              width={100}
              height={100}
              className='w-24 h-24 rounded-full object-cover'
            />
            <button
              onClick={() => inputRef.current?.click()}
              className='absolute bottom-0 right-0 bg-yellow-600 w-8 h-8 rounded-full flex items-center justify-center border-4 border-black'>
              <Plus size={18} />
            </button>
            <input
              ref={inputRef}
              type='file'
              accept='image/*'
              hidden
              onChange={handleSelectImage}
            />
          </div>
          <p className='text-sm text-gray-400'>Change profile picture</p>
        </div>

        {/* Username (read-only) */}
        <div>
          <label className='text-sm text-gray-400 mb-2 block'>Username</label>
          <Input
            value={user.username}
            disabled
            className='bg-gray-900 border-gray-800 text-gray-500'
          />
        </div>

        {/* Bio */}
        <div>
          <label className='text-sm text-gray-400 mb-2 block'>Bio</label>
          <Textarea
            value={user.bio || bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder='Tell us about yourself'
            className='bg-gray-900 border-gray-800 min-h-32 resize-none focus-visible:ring-[1px] '
            maxLength={150}
          />
          <p className='text-right text-xs text-gray-500 mt-1'>
            {bio.length}/150
          </p>
        </div>

        {/* Website */}
        <div>
          <label className='text-sm text-gray-400 mb-2 block'>Website</label>
          <Input
            value={user.website || website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder='https://example.com'
            className='bg-gray-900 border-gray-800'
          />
        </div>
      </div>
    </main>
  );
}
