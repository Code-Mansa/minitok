"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Image as ImageIcon, Video, Camera } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/hooks/useCreatePost";

export default function CreatePostPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const createPost = useCreatePost();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<"picker" | "details">("picker");
  const [caption, setCaption] = useState("");

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      setCameraMode(true);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      alert("Unable to access camera");
      console.error(err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setCameraMode(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const capturedFile = new File([blob], "photo.jpg", {
        type: "image/jpeg",
      });
      setFile(capturedFile);
      setPreview(URL.createObjectURL(capturedFile));
      stopCamera();
    }, "image/jpeg");
  };

  // Select from device media
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (
      !selected.type.startsWith("image") &&
      !selected.type.startsWith("video")
    ) {
      alert("Only images and videos are allowed");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const clearMedia = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    setStep("picker");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Proceed to details
  const goToDetails = () => {
    if (!file) return;
    setStep("details");
  };

  // Submit post (stub - replace with your API call)
  const submitPost = async () => {
    if (!file) return;

    try {
      await createPost.mutateAsync({
        file,
        caption,
        onProgress: setProgress,
      });

      clearMedia();
      alert("Post uploaded successfully!");
    } catch {
      alert("Upload failed");
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <main className='min-h-screen bg-black text-white flex flex-col'>
      {/* Header */}
      <header className='flex items-center justify-between px-4 py-3 border-b border-white/10'>
        <button
          onClick={step === "details" ? () => setStep("picker") : clearMedia}>
          <ChevronLeft />
        </button>
        <p className='font-semibold'>
          {step === "picker" ? "Create Post" : "Post Details"}
        </p>
        <Button
          size='sm'
          disabled={createPost.isPending || (step === "picker" && !file)}
          onClick={step === "picker" ? goToDetails : submitPost}>
          {step === "picker" ? "Next" : "Post"}
        </Button>
      </header>

      <section className='flex-1 flex flex-col items-center justify-center px-6'>
        <input
          ref={inputRef}
          type='file'
          accept='image/*,video/*'
          hidden
          onChange={handleSelect}
        />

        <AnimatePresence mode='wait'>
          {step === "picker" && !preview && !cameraMode ? (
            <motion.div
              key='picker'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='w-full max-w-sm border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center gap-4'>
              <div className='flex gap-4'>
                <ImageIcon className='opacity-70' />
                <Video className='opacity-70' />
                <Camera className='opacity-70' />
              </div>
              <p className='text-sm text-white/70 text-center'>
                Select an image/video or open your camera
              </p>
              <div className='flex gap-2'>
                <Button onClick={() => inputRef.current?.click()}>
                  Choose file
                </Button>
                <Button onClick={startCamera} variant='outline'>
                  Camera
                </Button>
              </div>
            </motion.div>
          ) : step === "picker" && cameraMode ? (
            <motion.div
              key='camera'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className='w-full max-w-md flex flex-col items-center gap-4'>
              <div className='relative rounded-xl overflow-hidden w-full'>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className='w-full h-[70vh] object-cover rounded-xl'
                />
              </div>
              <div className='flex gap-2'>
                <Button onClick={capturePhoto}>Snap Photo</Button>
                <Button onClick={stopCamera} variant='outline'>
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : step === "details" ? (
            <motion.div
              key='details'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className='w-full max-w-md flex flex-col items-center gap-4'>
              {/* Media preview card */}
              <div className='relative rounded-xl overflow-hidden shadow-lg border border-white/10 w-full'>
                {file?.type.startsWith("image") ? (
                  <Image
                    src={preview!}
                    alt='preview'
                    width={400}
                    height={600}
                    className='w-full h-[60vh] object-cover rounded-xl'
                  />
                ) : (
                  <video
                    src={preview!}
                    controls
                    playsInline
                    className='w-full h-[60vh] object-contain bg-black rounded-xl'
                  />
                )}
              </div>

              {createPost.isPending && (
                <div className='w-full bg-white/10 rounded-full h-2 overflow-hidden'>
                  <motion.div
                    className='h-full bg-white'
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              )}

              {/* Caption input */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder='Write a caption...'
                className='w-full rounded-xl p-3 bg-white/10 text-white placeholder:text-white/50 resize-none h-24'
              />
            </motion.div>
          ) : preview ? (
            <motion.div
              key='preview'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className='w-full max-w-md'>
              <div className='relative rounded-xl overflow-hidden shadow-lg border border-white/10'>
                {file?.type.startsWith("image") ? (
                  <Image
                    src={preview}
                    alt='preview'
                    width={400}
                    height={600}
                    className='w-full h-[70vh] object-cover rounded-xl'
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    playsInline
                    className='w-full h-[70vh] object-contain bg-black rounded-xl'
                  />
                )}
                <button
                  onClick={clearMedia}
                  className='absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full text-sm'>
                  Change
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <footer className='text-center text-xs text-white/50 pb-6'>
        Videos up to 60s · Images supported
      </footer>
    </main>
  );
}
