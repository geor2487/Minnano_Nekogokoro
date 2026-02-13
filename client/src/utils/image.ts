/**
 * 画像をリサイズしてBase64で返す
 * @param file 画像ファイル
 * @param maxLongSide 長辺の最大px（写真: 1568, 動画フレーム: 768）
 * @returns Base64エンコードされた画像データ（data URL形式）
 */
export function resizeImage(file: File | Blob, maxLongSide: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
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

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };

    img.src = url;
  });
}

/**
 * Base64データURLからpureなBase64文字列を抽出
 */
export function extractBase64(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx >= 0 ? dataUrl.substring(idx + 1) : dataUrl;
}
