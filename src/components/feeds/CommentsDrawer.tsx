"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { usePostComment, useLikeComment } from "@/hooks/useCommentActions";
import { postAPI } from "@/services/endpoints";

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  author: { _id: string; username: string; avatar?: string };
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId: string;
  commentsCount: number;
}

export function CommentsDrawer({
  open,
  onOpenChange,
  postId,
  commentsCount,
}: Props) {
  const [input, setInput] = useState("");

  const { data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      postAPI.getComments(postId).then((res) => res.data.comments as Comment[]),
    enabled: open,
    placeholderData: [],
  });

  const postComment = usePostComment(postId);
  const comments = data || [];

  const sendComment = () => {
    if (!input.trim()) return;
    postComment.mutate({ text: input });
    setInput("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='h-[70vh] flex flex-col'>
        <DrawerHeader className='border-b text-center py-3'>
          <DrawerTitle>{commentsCount} Comments</DrawerTitle>
        </DrawerHeader>

        <div className='flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide'>
          {comments.map((comment: Comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
          {comments.length === 0 && (
            <p className='text-center text-gray-500 mt-10'>
              No comments yet. Be the first!
            </p>
          )}
        </div>

        <div className='relative border-t p-4 flex gap-3 items-end'>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Leave a comment'
            id='comment'
            className='field-sizing-content max-h-20.5 min-h-0 resize-none py-1.75 w-full scrollbar-hide focus-visible:ring-1'
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), sendComment())
            }
          />
          <div className='absolute bottom-4 right-5 text-gray-600'>
            <button
              onClick={sendComment}
              disabled={!input.trim() || postComment.isPending}
              className='text-yellow-500 disabled:text-gray-400'>
              <SendHorizontal size={24} />
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const likeMutation = useLikeComment(comment._id);

  const handleLike = () => {
    likeMutation.mutate();
  };

  return (
    <div className='flex gap-3 items-start'>
      <Avatar>
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
      </Avatar>

      <div className='flex flex-1 justify-between items-center w-full gap-2'>
        <div className='space-y-px flex flex-col'>
          <p className='text-gray-300 flex items-center text-sm font-medium'>
            {comment.author.username}
          </p>
          <p className='text-sm'>{comment.text}</p>

          <div className='mt-2 flex items-center gap-4 text-xs text-gray-500'>
            <span>2h</span>
            <button className='font-medium'>Reply</button>
          </div>
        </div>

        <div className='flex flex-col items-center gap-1'>
          <motion.button whileTap={{ scale: 1.4 }} onClick={handleLike}>
            <Heart
              size={20}
              className={
                comment.likedByMe
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400"
              }
            />
          </motion.button>
          {comment.likesCount > 0 && (
            <span className='text-xs text-gray-500'>{comment.likesCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}
