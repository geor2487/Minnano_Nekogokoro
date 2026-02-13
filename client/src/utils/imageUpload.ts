import api from "../lib/api";

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImage(file: File, maxSize: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }

      const ratio = Math.min(maxSize / width, maxSize / height);
      const newW = Math.round(width * ratio);
      const newH = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, newW, newH);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  const resized = await resizeImage(file, 800);
  const base64 = await fileToBase64(resized);
  const res = await api.post("/upload/image", { image: base64 });
  return res.data.url;
}

export async function uploadVideo(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  const res = await api.post("/upload/video", { video: base64 });
  return res.data.url;
}
