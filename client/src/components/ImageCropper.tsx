import { useRef, useState, useCallback, useEffect } from "react";

interface ImageCropperProps {
  file: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  cropSize?: number;
  shape?: "circle" | "rect";
  aspectRatio?: number; // width / height, e.g. 3 for 3:1
}

export default function ImageCropper({
  file,
  onCrop,
  onCancel,
  cropSize = 400,
  shape = "circle",
  aspectRatio = 1,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const viewWidth = shape === "rect" ? 300 : 280;
  const viewHeight = shape === "rect" ? Math.round(300 / aspectRatio) : 280;

  // Compute actual pixel scale from zoom level (0-100)
  // zoom=0 means image just covers the crop area, zoom=100 means 3x that
  const getScale = useCallback(
    (z: number) => {
      if (naturalSize.w === 0 || naturalSize.h === 0) return 1;
      const fitScaleW = viewWidth / naturalSize.w;
      const fitScaleH = viewHeight / naturalSize.h;
      const fitScale = Math.max(fitScaleW, fitScaleH);
      return fitScale * (1 + (z / 100) * 2);
    },
    [naturalSize, viewWidth, viewHeight]
  );

  const scale = getScale(zoom);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      const fitScaleW = viewWidth / img.naturalWidth;
      const fitScaleH = viewHeight / img.naturalHeight;
      const fitScale = Math.max(fitScaleW, fitScaleH);
      setOffset({
        x: (viewWidth - img.naturalWidth * fitScale) / 2,
        y: (viewHeight - img.naturalHeight * fitScale) / 2,
      });
      setZoom(0);
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

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      const clamped = Math.max(0, Math.min(100, newZoom));
      const oldScale = getScale(zoom);
      const newScale = getScale(clamped);
      if (oldScale === 0) return;
      const ratio = newScale / oldScale;
      const cx = viewWidth / 2;
      const cy = viewHeight / 2;
      setOffset((o) => ({
        x: cx - (cx - o.x) * ratio,
        y: cy - (cy - o.y) * ratio,
      }));
      setZoom(clamped);
    },
    [zoom, getScale]
  );

  const handleCrop = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const outW = shape === "rect" ? cropSize : cropSize;
    const outH = shape === "rect" ? Math.round(cropSize / aspectRatio) : cropSize;
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sw = viewWidth / scale;
    const sh = viewHeight / scale;

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(outW / 2, outH / 2, outW / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const name = shape === "rect" ? "cover.jpg" : "avatar.jpg";
          onCrop(new File([blob], name, { type: "image/jpeg" }));
        }
      },
      "image/jpeg",
      0.85
    );
  }, [offset, scale, cropSize, aspectRatio, shape, viewWidth, viewHeight, onCrop]);

  const displayW = naturalSize.w * scale;
  const displayH = naturalSize.h * scale;

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
              width: viewWidth,
              height: viewHeight,
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
                width: viewWidth,
                height: viewHeight,
                margin: "0 auto",
                borderRadius: shape === "rect" ? 12 : "50%",
                overflow: "hidden",
                position: "relative",
                border: "3px solid #fbbf24",
                background: "#f5f5f4",
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
                    width: displayW,
                    height: displayH,
                    maxWidth: "none",
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
                gap: 12,
                marginTop: 16,
              }}
            >
              <button
                onClick={() => handleZoomChange(zoom - 5)}
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
                value={zoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                style={{ width: 160, accentColor: "#f59e0b" }}
              />
              <button
                onClick={() => handleZoomChange(zoom + 5)}
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
