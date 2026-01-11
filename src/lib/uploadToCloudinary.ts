export async function uploadToCloudinary(
  file: File,
  signature: any,
  onProgress?: (percent: number) => void
) {
  return new Promise<{
    secureUrl: string;
    duration?: number;
    thumbnail?: string | null;
  }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", signature.timestamp);
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      resolve({
        secureUrl: res.secure_url,
        duration: res.duration,
        thumbnail:
          signature.resourceType === "video"
            ? res.secure_url.replace(".mp4", ".jpg")
            : null,
      });
    };

    xhr.onerror = reject;

    const url = `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType}/upload`;
    xhr.open("POST", url);
    xhr.send(formData);
  });
}
