import { useState } from "react";
import type { CSSProperties } from "react";
import type { Post } from "../types";
import { PawPrint, HeartIcon, CommentIcon, ShareIcon, TranslateIcon, ChevDown, ChevUp, TrashIcon } from "./Icons";
import Avatar from "./Avatar";
import MoodBadge from "./MoodBadge";
import SpeechBubble from "./SpeechBubble";
import { timeAgo, getInitial } from "../utils/helpers";

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment?: (id: string) => void;
  onFollowCat?: (catId: string) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  style?: CSSProperties;
}

export default function PostCard({ post, onLike, onComment, onFollowCat, onDelete, currentUserId, style }: PostCardProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasTranslation = !!post.translation;
  const isOwner = currentUserId && post.userId === currentUserId;

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e7e5e4",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 8px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Avatar initial={getInitial(post.user.name)} color="blue" photoUrl={post.user.avatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#292524" }}>
            {post.user.name}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#a8a29e",
            }}
          >
            <PawPrint size={11} />
            <span>{post.cat.name}</span>
            <span>-</span>
            <span>{post.cat.breed}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          {onFollowCat && post.userId !== currentUserId && (
            <button
              onClick={(e) => { e.stopPropagation(); onFollowCat(post.cat.id); }}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                border: post.isFollowingCat ? "none" : "1.5px solid #f59e0b",
                background: post.isFollowingCat ? "#f59e0b" : "transparent",
                color: post.isFollowingCat ? "#fff" : "#f59e0b",
                whiteSpace: "nowrap",
              }}
            >
              {post.isFollowingCat ? "フォロー中" : "フォロー"}
            </button>
          )}
          <span style={{ fontSize: 12, color: "#a8a29e" }}>{timeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 16px 10px" }}>
        <p style={{ fontSize: 14, color: "#44403c", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" style={{ width: "100%", objectFit: "cover" }} />
      )}

      {/* Video */}
      {post.videoUrl && (
        <video
          src={post.videoUrl}
          controls
          playsInline
          preload="metadata"
          style={{ width: "100%", display: "block" }}
        />
      )}

      {/* Translation toggle */}
      {hasTranslation && (
        <div style={{ padding: "0 16px 12px" }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
              border: open ? "1px solid #fde68a" : "1px dashed #d6d3d1",
              background: open ? "#fffbeb" : "#fafaf9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <TranslateIcon size={15} style={{ color: "#f59e0b" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#b45309" }}>
                ネコゴコロ翻訳
              </span>
              {post.mood && <MoodBadge mood={post.mood} face={post.moodFace || undefined} size="sm" />}
            </div>
            {open ? (
              <ChevUp size={14} style={{ color: "#b45309" }} />
            ) : (
              <ChevDown size={14} style={{ color: "#a8a29e" }} />
            )}
          </button>
          <div
            style={{
              maxHeight: open ? 200 : 0,
              opacity: open ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.35s ease,opacity 0.25s ease,margin 0.3s ease",
              marginTop: open ? 10 : 0,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Avatar
                initial={getInitial(post.cat.name)}
                size="sm"
                photoUrl={post.cat.photoUrl}
              />
              <SpeechBubble>
                <p style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
                  {post.translation}
                </p>
              </SpeechBubble>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ padding: "0 16px 10px", display: "flex", gap: 4 }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            background: post.liked ? "#fdf2f8" : "transparent",
            color: post.liked ? "#ec4899" : "#a8a29e",
          }}
        >
          <HeartIcon size={15} filled={!!post.liked} />
          {post._count.likes}
        </button>
        <button
          onClick={() => onComment?.(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            color: "#a8a29e",
            background: "transparent",
          }}
        >
          <CommentIcon size={15} />
          {post._count.comments}
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            color: "#a8a29e",
            background: "transparent",
          }}
        >
          <ShareIcon size={15} />
        </button>
        {isOwner && onDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              color: "#a8a29e",
              background: "transparent",
            }}
          >
            <TrashIcon size={15} />
          </button>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          style={{
            padding: "0 16px 12px",
          }}
        >
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <p style={{ fontSize: 13, color: "#b91c1c", fontWeight: 500 }}>
              この投稿を削除しますか?
            </p>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #e7e5e4",
                  background: "#fff",
                  color: "#57534e",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await onDelete?.(post.id);
                  } catch {
                    setDeleting(false);
                    setConfirmDelete(false);
                  }
                }}
                disabled={deleting}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: deleting ? "#d6d3d1" : "#dc2626",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: deleting ? "wait" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {deleting ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
