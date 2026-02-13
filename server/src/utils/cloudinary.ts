import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  base64Data: string
): Promise<string> {
  const dataUri = base64Data.startsWith("data:")
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "nekogokoro-sns",
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  });
  return result.secure_url;
}

export async function uploadVideo(
  base64Data: string
): Promise<string> {
  const dataUri = base64Data.startsWith("data:")
    ? base64Data
    : `data:video/mp4;base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "nekogokoro-sns",
    resource_type: "video",
    transformation: [{ width: 720, crop: "limit" }],
  });
  return result.secure_url;
}

export default cloudinary;
