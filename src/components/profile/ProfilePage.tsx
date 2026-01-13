"use client";

import { useRef, useState } from "react";
import { PostGrid } from "@/components/profile/PostGrid";
import { ProfilePostTabs } from "@/components/profile/ProfilePostTabs";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellPlus,
  ChevronLeft,
  EllipsisVertical,
  LogOut,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useProfile,
  useProfilePosts,
  useToggleFollow,
} from "@/hooks/useProfile";
import { profileAPI, postAPI } from "@/services/endpoints";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { Spinner } from "../kibo-ui/spinner";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage({ username }: { username: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();

  const { data: profile, isLoading } = useProfile(username);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const followMutation = useToggleFollow();
  const { data: tabPosts, isLoading: postsLoading } = useProfilePosts(
    profile?.username,
    activeTab
  );

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setPreviewImage(URL.createObjectURL(file));

    try {
      // Get signature
      const sigRes = await postAPI.getUploadSignature("avatar");
      const signature = sigRes.data;

      // Upload to Cloudinary
      const uploadRes = await uploadToCloudinary(file, signature);

      // Update profile
      await profileAPI.updateMe({ avatar: uploadRes.secureUrl });

      // Optimistically update local profile
      // (React Query will refetch on next navigation anyway)
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setPreviewImage(null);
    }
  };

  const normalizeWebsite = (url: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center text-yellow-400'>
        <Spinner variant='ellipsis' />{" "}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='text-center mt-20 text-gray-400'>User not found</div>
    );
  }

  const isMe = profile.isMe;

  return (
    <main className='max-h-screen bg-black text-white font-sans pt-5 overflow-y-auto'>
      {/* Header */}
      <div className='fixed top-5 left-0 w-full flex justify-between items-center px-4 z-20'>
        <button onClick={() => router.back()}>
          <ChevronLeft size={28} />
        </button>
        <p className='font-medium text-sm'>{profile.username}</p>
        <div className='flex gap-4'>
          <Bell size={20} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='rounded-full hover:bg-muted'>
                <EllipsisVertical size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-40'>
              <DropdownMenuItem
                onClick={() => logout()}
                className='cursor-pointer text-red-400'>
                <LogOut className='mr-2 h-4 w-4' />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Section */}
      <section className='relative flex flex-col gap-3 px-4 mt-15 mb-4'>
        <div className='flex gap-4 items-center relative'>
          <div className='relative'>
            <Image
              src={previewImage || profile.avatar || "/avatar/default.jpg"}
              alt='profile'
              width={80}
              height={80}
              className='w-20 h-20 object-cover rounded-full'
            />
            {isMe && (
              <button
                onClick={() => inputRef.current?.click()}
                className='absolute bottom-0 right-0 bg-yellow-600 w-6 h-6 rounded-full flex items-center justify-center border-2 border-black'>
                <Plus size={14} />
              </button>
            )}
            <input
              ref={inputRef}
              type='file'
              accept='image/*'
              hidden
              onChange={handleSelectImage}
            />
          </div>

          <div className='space-y-0.5'>
            <h1 className='text-lg font-bold flex items-center gap-2'>
              {profile.username}
            </h1>
            <p className='text-sm'>Live some hours ago</p>
          </div>
        </div>

        <div className='space-y-4'>
          <p className='text-sm font-semibold text-gray-400/90'>
            {profile.bio || "No bio yet"}
          </p>
          <p className='mt-2 text-sm'>
            {profile.followersCount.toLocaleString()} followers
          </p>
        </div>

        <div className='flex flex-col gap-3'>
          {profile.website && (
            <a
              href={normalizeWebsite(profile.website)}
              className='text-yellow-500 font-medium text-sm'
              target='_blank'
              rel='noopener noreferrer'>
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}

          <div className='grid grid-cols-5 gap-2 text-sm w-full'>
            {isMe ? (
              <>
                <Button
                  onClick={() => router.push("/profile/edit")}
                  className='col-span-2 bg-gray-200 text-black'>
                  Edit profile
                </Button>

                <Button className='col-span-2 bg-gray-200 text-black'>
                  Promotions
                </Button>
                <Button size='icon' className='bg-gray-200 text-black w-full'>
                  <Bell />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => followMutation.mutate(profile?.username)}
                  disabled={followMutation.isPending}
                  className={`col-span-2 ${
                    profile.isFollowing
                      ? "bg-gray-200 text-black"
                      : "bg-linear-to-br from-yellow-600 to-yellow-500 text-white"
                  } `}>
                  {followMutation.isPending ? (
                    <Spinner variant='ellipsis' />
                  ) : profile.isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
                <Button
                  onClick={() => router.push("/message")}
                  className='bg-gray-200 col-span-2 text-black'>
                  Message
                </Button>
                <Button size='icon' className='bg-gray-200 text-black w-full'>
                  <BellPlus />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Tabs & Posts */}
      <section>
        <ProfilePostTabs
          active={activeTab}
          onChange={setActiveTab}
          isMe={isMe}
        />
        <PostGrid
          posts={tabPosts}
          isLoading={postsLoading}
          activeTab={activeTab}
        />
      </section>
    </main>
  );
}
