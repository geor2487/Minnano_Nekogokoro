import { useState, useEffect, useRef } from "react";
import api from "../lib/api";
import type { Post, Comment } from "../types";
import { XIcon, SendIcon } from "./Icons";
import Avatar from "./Avatar";
import { timeAgo, getInitial } from "../utils/helpers";

interface CommentModalProps {
  postId: string;
  onClose: () => void;
}

export default function CommentModal({ postId, onClose }: CommentModalProps) {
  const [post, setPost] = useState<(Post & { comments: Comment[] }) | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/posts/${postId}`)
      .then((res) => setPost(res.data))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [post?.comments]);

  const handleSend = async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content });
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, res.data],
              _count: { ...prev._count, comments: prev._count.comments + 1 },
            }
          : prev
      );
      setContent("");
    } catch {
      console.error("Failed to send comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          flex: "0 0 auto",
          height: "20%",
          background: "rgba(0,0,0,0.3)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          flex: 1,
          background: "#fffbf5",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e7e5e4",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, color: "#292524" }}>
            コメント {post ? `(${post._count.comments})` : ""}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "none",
              background: "#f5f5f4",
              cursor: "pointer",
              color: "#78716c",
            }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Post summary */}
        {post && (
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #f5f5f4" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Avatar initial={getInitial(post.user.name)} size="sm" color="blue" photoUrl={post.user.avatarUrl} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#292524" }}>{post.user.name}</p>
                <p style={{ fontSize: 13, color: "#57534e", lineHeight: 1.5, marginTop: 2 }}>{post.content}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments list */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: "3px solid #fde68a",
                  borderTopColor: "#f59e0b",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : post?.comments.length === 0 ? (
            <p style={{ textAlign: "center", color: "#a8a29e", fontSize: 13, padding: "40px 0" }}>
              まだコメントはありません
            </p>
          ) : (
            post?.comments.map((c) => (
              <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Avatar initial={getInitial(c.user.name)} size="sm" color="blue" photoUrl={c.user.avatarUrl} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#292524" }}>{c.user.name}</span>
                    <span style={{ fontSize: 11, color: "#a8a29e" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.5, marginTop: 2 }}>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e7e5e4",
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: "#fff",
          }}
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="コメントを入力..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              fontSize: 14,
              color: "#1c1917",
              background: "#fafaf9",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "none",
              background: content.trim() && !sending ? "#f59e0b" : "#e7e5e4",
              color: content.trim() && !sending ? "#fff" : "#a8a29e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: content.trim() && !sending ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
