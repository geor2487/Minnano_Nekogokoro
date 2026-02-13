import type { FrameCount } from "../types";

/**
 * 動画からフレームを抽出してBase64配列で返す
 */
export async function extractVideoFrames(
  file: File,
  frameCount: FrameCount,
  maxLongSide: number = 768
): Promise<string[]> {
  const video = document.createElement("video");
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    video.preload = "metadata";

    video.onloadedmetadata = async () => {
      const duration = video.duration;

      if (duration > 30) {
        URL.revokeObjectURL(url);
        reject(new Error("動画は30秒以内にしてください"));
        return;
      }

      const interval = duration / (frameCount + 1);
      const timestamps = Array.from(
        { length: frameCount },
        (_, i) => interval * (i + 1)
      );

      try {
        const frames: string[] = [];
        for (const time of timestamps) {
          const frame = await captureFrame(video, time, maxLongSide);
          frames.push(frame);
        }
        URL.revokeObjectURL(url);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("動画の読み込みに失敗しました"));
    };

    video.src = url;
  });
}

function captureFrame(
  video: HTMLVideoElement,
  time: number,
  maxLongSide: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    video.currentTime = time;

    video.onseeked = () => {
      try {
        let width = video.videoWidth;
        let height = video.videoHeight;
        const longSide = Math.max(width, height);

        if (longSide > maxLongSide) {
          const ratio = maxLongSide / longSide;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => reject(new Error("フレームの取得に失敗しました"));
  });
}

/**
 * 動画ファイルの長さ（秒）を取得
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("動画の読み込みに失敗しました"));
    };

    video.src = url;
  });
}
