import { useRef, useState, useCallback, useEffect } from "react";

interface ImageCropperProps {
  file: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  cropSize?: number;
}

export default function ImageCropper({
  file,
  onCrop,
  onCancel,
  cropSize = 400,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const viewSize = 280;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const minDim = Math.min(img.width, img.height);
      const initScale = viewSize / minDim;
      setImgSize({ w: img.width, h: img.height });
      setScale(initScale);
      setOffset({
        x: (viewSize - img.width * initScale) / 2,
        y: (viewSize - img.height * initScale) / 2,
      });
      setImgLoaded(true);
    };
    img.src = URL.createObjectURL(file);
    return () => URL.revokeObjectURL(img.src);
  }, [file]);

  const getPointerPos = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if ("touches" in e) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const pos = getPointerPos(e);
      setDragging(true);
      setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
    },
    [offset, getPointerPos]
  );

  const handlePointerMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const pos = getPointerPos(e);
      setOffset({
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y,
      });
    },
    [dragging, dragStart, getPointerPos]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleZoom = useCallback(
    (delta: number) => {
      setScale((prev) => {
        const minDim = Math.min(imgSize.w, imgSize.h);
        const minScale = viewSize / minDim;
        const newScale = Math.max(minScale * 0.5, Math.min(prev + delta, minScale * 4));
        const ratio = newScale / prev;
        const centerX = viewSize / 2;
        const centerY = viewSize / 2;
        setOffset((o) => ({
          x: centerX - (centerX - o.x) * ratio,
          y: centerY - (centerY - o.y) * ratio,
        }));
        return newScale;
      });
    },
    [imgSize]
  );

  const handleCrop = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = cropSize / viewSize;
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sw = viewSize / scale;
    const sh = viewSize / scale;

    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      imgRef.current,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      cropSize,
      cropSize
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "avatar.jpg", {
            type: "image/jpeg",
          });
          onCrop(croppedFile);
        }
      },
      "image/jpeg",
      0.85
    );
  }, [offset, scale, cropSize, onCrop]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "24px 20px 20px",
          maxWidth: 360,
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#292524",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          画像の位置を調整
        </p>

        {!imgLoaded ? (
          <div
            style={{
              width: viewSize,
              height: viewSize,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid #fde68a",
                borderTopColor: "#f59e0b",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              style={{
                width: viewSize,
                height: viewSize,
                margin: "0 auto",
                borderRadius: "50%",
                overflow: "hidden",
                position: "relative",
                border: "3px solid #fbbf24",
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
                userSelect: "none",
              }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              {imgRef.current && (
                <img
                  src={imgRef.current.src}
                  alt="crop preview"
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: offset.x,
                    top: offset.y,
                    width: imgSize.w * scale,
                    height: imgSize.h * scale,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>

            {/* Zoom control */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                marginTop: 16,
              }}
            >
              <button
                onClick={() => handleZoom(-0.02)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #e7e5e4",
                  background: "#fafaf9",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#57534e",
                  fontFamily: "inherit",
                }}
              >
                -
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={(() => {
                  const minDim = Math.min(imgSize.w, imgSize.h);
                  const minScale = viewSize / minDim;
                  const maxScale = minScale * 4;
                  return ((scale - minScale * 0.5) / (maxScale - minScale * 0.5)) * 100;
                })()}
                onChange={(e) => {
                  const minDim = Math.min(imgSize.w, imgSize.h);
                  const minScale = viewSize / minDim;
                  const maxScale = minScale * 4;
                  const pct = Number(e.target.value) / 100;
                  const newScale = minScale * 0.5 + pct * (maxScale - minScale * 0.5);
                  const ratio = newScale / scale;
                  const centerX = viewSize / 2;
                  const centerY = viewSize / 2;
                  setOffset((o) => ({
                    x: centerX - (centerX - o.x) * ratio,
                    y: centerY - (centerY - o.y) * ratio,
                  }));
                  setScale(newScale);
                }}
                style={{
                  width: 140,
                  accentColor: "#f59e0b",
                }}
              />
              <button
                onClick={() => handleZoom(0.02)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #e7e5e4",
                  background: "#fafaf9",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#57534e",
                  fontFamily: "inherit",
                }}
              >
                +
              </button>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 14,
              border: "1px solid #e7e5e4",
              background: "#fff",
              color: "#78716c",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleCrop}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
            }}
          >
            決定
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
