"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send } from "lucide-react";
import Image from "next/image";

// ---------------- MOCK DATA ----------------
const MOCK_USER = {
  id: "me",
  name: "You",
};

const MOCK_PEER = {
  id: "peer",
  name: "Zesan H.",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

// ---------------- PAGE ----------------
export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([
    { id: 1, sender: "peer", text: "Hey 👋", time: "now" },
    { id: 2, sender: "me", text: "Hey, what’s up?", time: "now" },
  ]);

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ---------------- AUTOSCROLL ----------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- AUTOGROW TEXTAREA ----------------
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [input]);

  // ---------------- SEND (OPTIMISTIC) ----------------
  const sendMessage = () => {
    if (!input.trim()) return;

    const optimistic = {
      id: Date.now(),
      sender: "me",
      text: input,
      time: "now",
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    // Fake peer response (simulate realtime)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "peer", text: "Got it 👍", time: "now" },
      ]);
    }, 1200);
  };

  return (
    <main className='h-screen bg-black text-white flex flex-col'>
      {/* ---------------- HEADER ---------------- */}
      <header className='sticky top-0 z-20 bg-black flex items-center gap-3 px-4 py-3 border-b border-white/10'>
        <button onClick={() => router.back()}>
          <ChevronLeft />
        </button>
        <Image
          src={MOCK_PEER.avatar}
          alt='avatar'
          width={36}
          height={36}
          className='rounded-full'
        />
        <div>
          <p className='text-sm font-medium'>{MOCK_PEER.name}</p>
          <p className='text-xs text-green-400'>Online</p>
        </div>
      </header>

      {/* ---------------- MESSAGES ---------------- */}
      <section className='flex-1 overflow-y-auto px-4 py-4 space-y-3'>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-[80%] w-fit text-sm px-3 py-2 rounded-2xl ${
                msg.sender === "me"
                  ? "ml-auto bg-blue-500 text-white rounded-br-sm"
                  : "mr-auto bg-neutral-800 rounded-bl-sm"
              }`}>
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </section>

      {/* ---------------- INPUT ---------------- */}
      <footer className='sticky bottom-0 bg-black border-t border-white/10 py-2'>
        <div className='flex items-end gap-2 relative'>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Send a message'
            className='flex-1 resize-none bg-neutral-900 px-4 py-2 pr-16 text-sm focus:outline-none max-h-40 overflow-y-auto'
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            className='absolute right-2 bottom-0.5 p-1.5 flex items-center justify-center rounded-full bg-linear-to-br from-yellow-600 to-yellow-500 disabled:opacity-50'
            disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </footer>
    </main>
  );
}
