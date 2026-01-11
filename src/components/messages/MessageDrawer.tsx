"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Search, Plus } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useFollowData } from "@/hooks/useFollower";
import Link from "next/link";
import { Spinner } from "../kibo-ui/spinner";
import { useProfile, useToggleFollow } from "@/hooks/useProfile";
import { profileAPI } from "@/services/endpoints";
import { useQueries } from "@tanstack/react-query";

export function MessageFloatingButton() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { following, suggested } = useFollowData(open);

  // ⬇️ mutation WITHOUT username
  const followMutation = useToggleFollow();

  const suggestedProfiles = useQueries({
    queries: suggested.map((user: any) => ({
      queryKey: ["profile", user.username],
      queryFn: () =>
        profileAPI.getProfile(user.username).then((res) => res.data),
      staleTime: 1000 * 60 * 2,
    })),
  });

  const filteredFollowing = following.filter((u: any) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuggested = suggested.filter(
    (sugg: any) => !following.some((f: any) => f.username === sugg.username)
  );

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className='fixed bottom-8 right-6 z-50 w-14 h-14 bg-linear-to-br from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
        <Plus size={28} />
      </motion.button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className='h-[80vh]'>
          <DrawerHeader>
            <DrawerTitle>New Message</DrawerTitle>
          </DrawerHeader>

          <div className='p-4 overflow-y-auto scrollbar-hide'>
            <div className='flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2'>
              <Search size={16} className='text-white/60' />
              <input
                placeholder='Search people'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='bg-transparent text-sm outline-none placeholder:text-white/50 flex-1'
              />
            </div>

            {/* FOLLOWING */}
            {following.length > 0 && (
              <div className='mt-6 space-y-4'>
                <h3 className='text-sm font-medium text-gray-400'>Following</h3>

                {filteredFollowing.length > 0
                  ? filteredFollowing.map((user: any) => (
                      <motion.div
                        key={user.id}
                        whileTap={{ scale: 0.98 }}
                        className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5'>
                        <Link href={`/profile/${user.username}`}>
                          <Image
                            src={user.avatar || "/avatar/default.jpg"}
                            alt=''
                            width={42}
                            height={42}
                            className='rounded-full'
                          />
                        </Link>

                        <Link href={`/message/${user.username}`}>
                          <p className='font-medium'>{user.username}</p>
                        </Link>
                      </motion.div>
                    ))
                  : search && (
                      <p className='text-center text-gray-500 py-4'>
                        No matching users
                      </p>
                    )}
              </div>
            )}

            {/* SUGGESTED */}
            {/* SUGGESTED */}
            {filteredSuggested.length > 0 && (
              <div className='mt-8 space-y-4'>
                <h3 className='text-sm font-medium text-gray-400'>Suggested</h3>

                {filteredSuggested.map((user: any, index) => {
                  const profile = suggestedProfiles[index]?.data;

                  return (
                    <motion.div
                      key={user.id}
                      whileTap={{ scale: 0.98 }}
                      className='flex items-center justify-between p-2 rounded-lg hover:bg-white/5'>
                      <Link
                        href={`/profile/${user.username}`}
                        className='flex items-center gap-3'>
                        <Image
                          src={user.avatar || "/avatar/default.jpg"}
                          width={48}
                          height={48}
                          className='rounded-full'
                          alt=''
                        />
                        <p className='font-medium'>{user.username}</p>
                      </Link>

                      <Button
                        size='sm'
                        disabled={followMutation.isPending}
                        onClick={() => followMutation.mutate(user.username)}
                        className='bg-linear-to-br from-yellow-600 to-yellow-500 text-white hover:opacity-90'>
                        {followMutation.isPending ? (
                          <Spinner variant='ellipsis' />
                        ) : profile?.isFollowing ? (
                          "Following"
                        ) : (
                          "Follow"
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

// // components/messages/MessageDrawer.tsx
// "use client";

// import { useState } from "react";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
// } from "@/components/ui/drawer";
// import { Search, Plus } from "lucide-react";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import { Button } from "../ui/button";

// const MESSAGES = [
//   {
//     id: 1,
//     username: "Zesan H.",
//     avatar: "https://randomuser.me/api/portraits/men/32.jpg",
//     lastMessage: "Sent a video",
//     time: "2h",
//     unread: true,
//   },
//   {
//     id: 2,
//     username: "Design Hub",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//     lastMessage: "🔥🔥🔥",
//     time: "1d",
//     unread: false,
//   },
//   {
//     id: 3,
//     username: "Frontend Dev",
//     avatar: "https://randomuser.me/api/portraits/men/76.jpg",
//     lastMessage: "Thanks bro",
//     time: "3d",
//     unread: false,
//   },
// ];

// const SUGGESTED = [
//   {
//     id: 1,
//     username: "Musa Suleiman",
//     avatar: "https://randomuser.me/api/portraits/men/12.jpg",
//   },
//   {
//     id: 2,
//     username: "Praise Adeyemi",
//     avatar: "https://randomuser.me/api/portraits/women/40.jpg",
//   },
//   {
//     id: 3,
//     username: "Raymond Okoro",
//     avatar: "https://randomuser.me/api/portraits/men/65.jpg",
//   },
// ];

// export function MessageFloatingButton() {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <motion.button
//         whileTap={{ scale: 0.9 }}
//         onClick={() => setOpen(true)}
//         className='fixed bottom-8 right-6 z-50 w-14 h-14 bg-linear-to-br from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
//         <Plus size={28} />
//       </motion.button>

//       <Drawer open={open} onOpenChange={setOpen}>
//         <DrawerContent className='h-[80vh] '>
//           <DrawerHeader>
//             <DrawerTitle>New Message</DrawerTitle>
//           </DrawerHeader>

//           <div className='p-4 overflow-y-auto scrollbar-hide'>
//             <div className='flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2'>
//               <Search size={16} className='text-white/60' />
//               <input
//                 placeholder='Search people'
//                 className='bg-transparent text-sm outline-none placeholder:text-white/50 flex-1'
//               />
//             </div>

//             <div className='mt-6 space-y-4'>
//               <h3 className='text-sm font-medium text-gray-400'>Following</h3>
//               {/* List people you follow */}
//               {MESSAGES.map((chat) => (
//                 <motion.div
//                   key={chat.id}
//                   whileTap={{ scale: 0.98 }}
//                   className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5'>
//                   <Image
//                     src={chat.avatar}
//                     alt=''
//                     width={48}
//                     height={48}
//                     className='rounded-full'
//                   />
//                   <p className='font-medium'>{chat.username}</p>
//                 </motion.div>
//               ))}
//             </div>

//             <div className='mt-8 space-y-4'>
//               <h3 className='text-sm font-medium text-gray-400'>Suggested</h3>
//               {/* Suggested users */}
//               {SUGGESTED.map((suggest) => (
//                 <motion.div
//                   key={suggest.id}
//                   whileTap={{ scale: 0.98 }}
//                   className='flex items-center justify-between p-2 rounded-lg hover:bg-white/5'>
//                   <div className='flex items-center gap-3'>
//                     <Image
//                       src={suggest.avatar}
//                       alt=''
//                       width={48}
//                       height={48}
//                       className='rounded-full'
//                     />
//                     <p className='font-medium'>{suggest.username}</p>
//                   </div>
//                   <Button
//                     size='sm'
//                     className='bg-linear-to-br from-yellow-600 to-yellow-500 text-white hover:opacity-90'>
//                     Follow
//                   </Button>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// }
