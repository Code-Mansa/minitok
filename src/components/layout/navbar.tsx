"use client";

import Link from "next/link";
import { Home, User, MessageCircle, Tv, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
  const { user } = useAuth();
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 bg-black text-white md:max-w-xs md:mx-auto'>
      <div className='flex items-center justify-between pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]'>
        {/* Home */}
        <NavItem href='/' icon={<Home size={22} />} label='Home' active />

        {/* Live */}
        <NavItem href='/live' icon={<Tv size={22} />} label='Live' />

        {/* Create */}
        <Link href='/create-post' className='relative'>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className='flex items-center justify-center p-2 bg-white rounded-full'>
            <Plus className='text-black' />
          </motion.div>
        </Link>

        {/* Messages */}
        <NavItem
          href='/message'
          icon={<MessageCircle size={22} />}
          label='Messages'
        />

        {/* Profile */}
        <NavItem
          href={`/profile/${user?.username}`}
          icon={<User size={22} />}
          label='Profile'
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className='flex flex-1 flex-col items-center gap-1 text-xs'>
      <div className={active ? "text-white" : "text-white/70"}>{icon}</div>
      <span className={active ? "text-white" : "text-white/70"}>{label}</span>
    </Link>
  );
}
