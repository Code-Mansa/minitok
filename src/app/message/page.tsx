"use client";

import { Search, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MessageFloatingButton } from "@/components/messages/MessageDrawer";

const MESSAGES = [
  {
    id: 1,
    username: "Zesan H.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Sent a video",
    time: "2h",
    unread: true,
  },
  {
    id: 2,
    username: "Design Hub",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "🔥🔥🔥",
    time: "1d",
    unread: false,
  },
  {
    id: 3,
    username: "Frontend Dev",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    lastMessage: "Thanks bro",
    time: "3d",
    unread: false,
  },
];

export default function MessagesPage() {
  const router = useRouter();

  return (
    <main className='max-h-screen bg-black text-white'>
      {/* Header */}
      <header className='sticky top-0 z-20 bg-black px-4 pt-5 pb-3'>
        <div className='flex items-center justify-between'>
          <button onClick={() => router.back()}>
            <ChevronLeft />
          </button>
          <h1 className='font-semibold'>Inbox</h1>
          <div className='w-6' />
        </div>

        {/* Search */}
        <div className='mt-4 flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2'>
          <Search size={16} className='text-white/60' />
          <input
            placeholder='Search'
            className='bg-transparent text-sm outline-none placeholder:text-white/50'
          />
        </div>
      </header>

      {/* Message list */}
      <section className='divide-y divide-white/10'>
        {MESSAGES.map((chat) => (
          <motion.div
            key={chat.id}
            onClick={() => router.push(`/message/${chat.id}`)}
            whileTap={{ scale: 0.98 }}
            className='flex items-center gap-3 px-4 py-3'>
            <div className='relative'>
              <img
                src={chat.avatar}
                alt={chat.username}
                className='w-12 h-12 rounded-full object-cover'
              />

              {chat.unread && (
                <span className='absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500' />
              )}
            </div>

            <div className='flex-1'>
              <p className='font-medium text-sm'>{chat.username}</p>
              <p className='text-xs text-white/60 truncate'>
                {chat.lastMessage}
              </p>
            </div>

            <span className='text-xs text-white/40'>{chat.time}</span>
          </motion.div>
        ))}
      </section>

      <MessageFloatingButton />
    </main>
  );
}
