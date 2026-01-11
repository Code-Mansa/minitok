"use client";

import React, { useRef, useState } from "react";
import { PostGrid } from "@/components/profile/PostGrid";
import { ProfilePostTabs } from "@/components/profile/ProfilePostTabs";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellPlus,
  ChevronLeft,
  EllipsisVertical,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const isMe = true; // for demo, set to true

const POSTS = {
  posts: [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1767635503652-784d6b76994b?q=80&w=709&auto=format&fit=crop&ixlib=rb-4.1.0",
      views: "2.1M",
      pinned: true,
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1761839258289-72f12b0de058?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0",
      views: "3.4M",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1761839258830-81f87b1c6d62?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: "2.2M",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1761839258045-6ef373ab82a7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: "3.8M",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1766946399726-f3018fb27113?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: "1.4M",
    },
  ],
  clips: [],
  bookmarks: [],
  likes: [],
};

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(isMe ? "posts" : "posts");

  const [profileImage, setProfileImage] = useState(
    "https://win.gg/wp-content/uploads/2026/01/carterefe-net-worth.jpg.webp"
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image")) {
      alert("Only image files are allowed!");
      return;
    }
    setPreviewImage(URL.createObjectURL(selected));
  };

  const saveProfileImage = () => {
    if (previewImage) {
      setProfileImage(previewImage);
      setPreviewImage(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <main className='min-h-screen bg-black text-white font-sans py-5'>
      {/* nav header */}
      <div className='fixed top-5 left-0 w-full flex justify-between items-center px-4'>
        <button onClick={() => router.back()}>
          <ChevronLeft />
        </button>

        <p className='font-medium text-sm'>Musa S.</p>

        <div className='flex gap-4'>
          <Bell size={20} />
          <EllipsisVertical size={20} />
        </div>
      </div>

      {/* User Profile */}
      <section className='relative flex flex-col gap-3 px-4 mt-15 mb-4'>
        <div className='flex gap-4 items-center relative'>
          <div className='relative'>
            <Image
              src={previewImage ?? profileImage}
              alt='user profile infographic'
              width={80}
              height={80}
              className='w-20 h-20 object-cover object-center rounded-full'
            />

            {/* Plus icon for uploading new profile image */}
            {isMe && (
              <button
                className='absolute bottom-0 right-0 bg-yellow-600 w-6 h-6 rounded-full flex items-center justify-center border-2 border-black'
                onClick={() => inputRef.current?.click()}>
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
              carterefe
              <span className='text-purple-500'>💜</span>
            </h1>
            <p className='text-sm'>Live some hours ago</p>
          </div>
        </div>

        {/* user bio */}
        <div className='space-y-4'>
          <p className='text-sm font-semibold text-gray-400/90'>
            THANK YOU LORD FOR EVERYTHING 🙏 CHARIS❤️ I STREAM EVERYDAY 🔔📢
          </p>
          <p className='mt-2 text-sm'>523.9K followers</p>
        </div>

        {/* web link and action button */}
        <div className='flex flex-col gap-3'>
          <a href='www.something.com' className='text-blue-500 font-medium'>
            www.something.com
          </a>

          <div className='grid grid-cols-5 gap-2 text-sm w-full'>
            {isMe ? (
              <>
                <Button className='col-span-2 bg-gray-200 text-black'>
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
                <Button className='col-span-2 bg-linear-to-br from-yellow-700 to-yellow-600 text-white'>
                  Follow
                </Button>
                <Button className='bg-gray-200 col-span-2 text-black'>
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

      {/* Save preview button */}
      {previewImage && (
        <div className='px-4 mb-4'>
          <Button
            onClick={saveProfileImage}
            className='w-full bg-linear-to-br from-yellow-600 to-yellow-500'>
            Save new profile picture
          </Button>
        </div>
      )}

      {/* User posts */}
      <section>
        <ProfilePostTabs
          active={activeTab}
          onChange={setActiveTab}
          isMe={isMe}
        />
        <PostGrid posts={POSTS} activeTab={activeTab} />
      </section>
    </main>
  );
};

export default Page;
