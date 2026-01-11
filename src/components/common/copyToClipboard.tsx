"use client";

import { IoCopyOutline } from "react-icons/io5";
import { toast } from "sonner";

interface HandleCopyProps {
  text: string;
}

const HandleCopy: React.FC<HandleCopyProps> = ({ text }) => {
  const handleCopy = async (textToCopy: string) => {
    if (!textToCopy) {
      toast.error("No text to copy");
      return;
    }

    try {
      // Modern Clipboard API (requires HTTPS + permission)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for restricted environments
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <span
      className='cursor-pointer hover:text-secondary transition-colors'
      onClick={() => handleCopy(text)}
      title='Copy to clipboard'>
      <IoCopyOutline size={15} />
    </span>
  );
};

export default HandleCopy;
