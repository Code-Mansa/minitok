"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Copy,
  Link as LinkIcon,
  Share2,
  Twitter,
  Facebook,
} from "lucide-react";

type ShareDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
};

export function ShareDrawer({ open, onOpenChange, postId }: ShareDrawerProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?post=${postId}`
      : "";

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl,
        });
        onOpenChange(false);
      } catch {
        // user cancelled — do nothing
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
    onOpenChange(false);
  };

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='bg-black text-white'>
        <DrawerHeader>
          <DrawerTitle>Share</DrawerTitle>
        </DrawerHeader>

        <div className='px-4 pb-6 space-y-3'>
          {/* Native share (mobile-first like TikTok) */}
          {canNativeShare && (
            <Button
              onClick={handleNativeShare}
              className='w-full flex gap-2'
              variant='secondary'>
              <Share2 size={18} />
              Share to apps
            </Button>
          )}

          {/* Copy link */}
          <Button
            onClick={handleCopy}
            className='w-full flex gap-2'
            variant='secondary'>
            <Copy size={18} />
            Copy link
          </Button>

          {/* Optional social shortcuts */}
          <div className='grid grid-cols-3 gap-3 pt-2'>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
              )}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex flex-col items-center gap-1 text-xs'>
              <Twitter />
              Twitter
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex flex-col items-center gap-1 text-xs'>
              <Facebook />
              Facebook
            </a>

            <button
              onClick={handleCopy}
              className='flex flex-col items-center gap-1 text-xs'>
              <LinkIcon />
              Copy
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
