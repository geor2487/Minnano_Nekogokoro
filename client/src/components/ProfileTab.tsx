import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { uploadImage } from "../utils/imageUpload";
import type { User, Cat } from "../types";
import { PawPrint } from "./Icons";
import ImageCropper from "./ImageCropper";

const BREEDS = [
  "雑種", "スコティッシュフォールド", "マンチカン", "ロシアンブルー",
  "ベンガル", "ラグドール", "アメリカンショートヘア", "ブリティッシュショートヘア",
  "メインクーン", "ペルシャ", "アビシニアン", "三毛猫", "黒猫", "白猫", "茶トラ", "キジトラ", "サバトラ",
];

interface ProfileTabProps {
  user: User;
  cats: Cat[];
  onLogout: () => void;
  onUpdateProfile: (data: { name?: string; bio?: string; avatarUrl?: string }) => Promise<void>;
  onUpdateCat: (id: string, data: Partial<{ name: string; breed: string; age: number; gender: string; personality: string; photoUrl: string }>) => Promise<any>;
  onDeleteCat: (id: string) => Promise<void>;
  onDeleteAccount: (password?: string) => Promise<void>;
  onRefreshCats: () => Promise<void>;
}

type ModalType = "editProfile" | "notifications" | "account" | null;

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #e7e5e4",
  fontSize: 14,
  color: "#1c1917",
  background: "#fafaf9",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box" as const,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 20px",
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 24,
  width: "100%",
  maxWidth: 440,
  maxHeight: "85vh",
  overflowY: "auto",
  padding: "24px 20px 32px",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: "#292524",
  textAlign: "center",
  marginBottom: 20,
};

const btnPrimaryStyle: React.CSSProperties = {
  width: "100%",
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
};

// ──────── Profile Edit Modal ────────
function EditProfileModal({
  user,
  onSave,
  onClose,
}: {
  user: User;
  onSave: (data: { name?: string; bio?: string; avatarUrl?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropFile(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleCropped = (croppedFile: File) => {
    setAvatarFile(croppedFile);
    setAvatarPreview(URL.createObjectURL(croppedFile));
    setCropFile(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("名前は必須です");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }
      await onSave({ name: name.trim(), bio: bio.trim() || undefined, avatarUrl });
      onClose();
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}>
              キャンセル
            </button>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#292524" }}>プロフィール編集</p>
            <div style={{ width: 60 }} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Avatar upload area */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer", display: "inline-block" }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={name}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "3px solid #fbbf24",
                    objectFit: "cover",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "3px solid #fbbf24",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#b45309",
                  }}
                >
                  {name.charAt(0)}
                </div>
              )}
              <p style={{ fontSize: 11, color: "#a8a29e", marginTop: 4 }}>タップして変更</p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>名前</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="猫好きの飼い主です..."
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
            />
          </div>

          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimaryStyle, opacity: saving ? 0.6 : 1 }}>
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
      {cropFile && (
        <ImageCropper
          file={cropFile}
          onCrop={handleCropped}
          onCancel={() => setCropFile(null)}
        />
      )}
    </>
  );
}

// ──────── Notification Settings Modal ────────
function NotificationModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("notificationSettings");
    return stored
      ? JSON.parse(stored)
      : { likes: true, comments: true, follows: true };
  });

  const toggle = (key: string) => {
    setSettings((prev: Record<string, boolean>) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notificationSettings", JSON.stringify(next));
      return next;
    });
  };

  const items = [
    { key: "likes", label: "いいね", desc: "投稿にいいねされたときに通知" },
    { key: "comments", label: "コメント", desc: "投稿にコメントされたときに通知" },
    { key: "follows", label: "フォロー", desc: "新しいフォロワーがいるときに通知" },
  ];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}>
            閉じる
          </button>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#292524" }}>通知設定</p>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item, i) => (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: i < items.length - 1 ? "1px solid #f5f5f4" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#292524" }}>{item.label}</p>
                <p style={{ fontSize: 12, color: "#a8a29e", marginTop: 2 }}>{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  border: "none",
                  background: settings[item.key] ? "#f59e0b" : "#d6d3d1",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: 3,
                    left: settings[item.key] ? 23 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────── Account Settings Modal ────────
function AccountModal({
  user,
  onDeleteAccount,
  onClose,
}: {
  user: User;
  onDeleteAccount: (password?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [section, setSection] = useState<"main" | "password" | "delete">("main");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [deletePw, setDeletePw] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async () => {
    setError("");
    setSuccess("");
    if (!currentPw || !newPw) {
      setError("現在のパスワードと新しいパスワードは必須です");
      return;
    }
    if (newPw.length < 6) {
      setError("新しいパスワードは6文字以上必要です");
      return;
    }
    if (newPw !== confirmPw) {
      setError("新しいパスワードが一致しません");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/password", { currentPassword: currentPw, newPassword: newPw });
      setSuccess("パスワードを変更しました");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "パスワードの変更に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setSaving(true);
    try {
      await onDeleteAccount(deletePw || undefined);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "アカウントの削除に失敗しました");
      setSaving(false);
    }
  };

  if (section === "password") {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => { setSection("main"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}>
              戻る
            </button>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#292524" }}>パスワード変更</p>
            <div style={{ width: 30 }} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#16a34a", marginBottom: 16 }}>
              {success}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>現在のパスワード</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>新しいパスワード</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="6文字以上" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>新しいパスワード（確認）</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={inputStyle} />
          </div>

          <button onClick={handlePasswordChange} disabled={saving} style={{ ...btnPrimaryStyle, opacity: saving ? 0.6 : 1 }}>
            {saving ? "変更中..." : "パスワードを変更"}
          </button>
        </div>
      </div>
    );
  }

  if (section === "delete") {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => { setSection("main"); setError(""); }} style={{ background: "none", border: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}>
              戻る
            </button>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#dc2626" }}>アカウント削除</p>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>この操作は取り消せません</p>
            <p style={{ fontSize: 13, color: "#78716c" }}>
              アカウントを削除すると、投稿、猫の情報、フォロー関係など全てのデータが完全に削除されます。
            </p>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>確認のためパスワードを入力</label>
            <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} style={inputStyle} />
          </div>

          <button
            onClick={handleDelete}
            disabled={saving}
            style={{
              ...btnPrimaryStyle,
              background: saving ? "#d6d3d1" : "#dc2626",
              boxShadow: saving ? "none" : "0 2px 8px rgba(220,38,38,0.3)",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "削除中..." : "アカウントを削除する"}
          </button>
        </div>
      </div>
    );
  }

  // Main account settings
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}>
            閉じる
          </button>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#292524" }}>アカウント設定</p>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ background: "#fafaf9", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: "#a8a29e", marginBottom: 4 }}>メールアドレス</p>
          <p style={{ fontSize: 15, color: "#292524" }}>{user.email}</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e7e5e4", overflow: "hidden" }}>
          <div
            onClick={() => setSection("password")}
            style={{ padding: "13px 16px", fontSize: 14, cursor: "pointer", borderBottom: "1px solid #f5f5f4", color: "#44403c" }}
          >
            パスワード変更
          </div>
          <div
            onClick={() => setSection("delete")}
            style={{ padding: "13px 16px", fontSize: 14, cursor: "pointer", color: "#dc2626", fontWeight: 500 }}
          >
            アカウントを削除
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────── Cat Detail Modal ────────
function CatDetailModal({
  cat,
  onUpdate,
  onDelete,
  onClose,
}: {
  cat: Cat;
  onUpdate: (id: string, data: Partial<{ name: string; breed: string; age: number; gender: string; personality: string; photoUrl: string }>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [breed, setBreed] = useState(cat.breed);
  const [age, setAge] = useState(String(cat.age));
  const [gender, setGender] = useState(cat.gender);
  const [personality, setPersonality] = useState(cat.personality || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(cat.photoUrl || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCropFile, setPhotoCropFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoCropFile(file);
    }
    if (e.target) e.target.value = "";
  };

  const handlePhotoCropped = (croppedFile: File) => {
    setPhotoFile(croppedFile);
    setPhotoPreview(URL.createObjectURL(croppedFile));
    setPhotoCropFile(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !breed || !age || !gender) {
      setError("名前、猫種、年齢、性別は必須です");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        photoUrl = await uploadImage(photoFile);
      }
      await onUpdate(cat.id, {
        name: name.trim(),
        breed,
        age: parseInt(age),
        gender,
        personality: personality.trim() || undefined,
        ...(photoUrl ? { photoUrl } : {}),
      });
      setEditing(false);
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete(cat.id);
      onClose();
    } catch {
      setError("削除に失敗しました");
      setSaving(false);
    }
  };

  // Delete confirmation
  if (confirmDelete) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <p style={{ ...modalTitleStyle, color: "#dc2626" }}>猫を削除しますか?</p>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "#78716c" }}>
              <strong style={{ color: "#292524" }}>{cat.name}</strong>の情報と関連する投稿が全て削除されます。この操作は取り消せません。
            </p>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "1px solid #e7e5e4", background: "#fff", color: "#44403c", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 14, border: "none",
                background: saving ? "#d6d3d1" : "#dc2626", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: "inherit",
              }}
            >
              {saving ? "削除中..." : "削除する"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  if (editing) {
    return (
      <>
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}>
              戻る
            </button>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#292524" }}>猫の情報を編集</p>
            <div style={{ width: 30 }} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Photo upload area */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <input
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={handlePhotoSelect}
              style={{ display: "none" }}
            />
            <div
              onClick={() => photoInputRef.current?.click()}
              style={{ cursor: "pointer", display: "inline-block" }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={name}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    border: "3px solid #fbbf24",
                    objectFit: "cover",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#fef3c7,#fde68a)",
                    border: "3px solid #fbbf24",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#b45309",
                    margin: "0 auto",
                  }}
                >
                  {name.charAt(0)}
                </div>
              )}
              <p style={{ fontSize: 11, color: "#a8a29e", marginTop: 4 }}>タップして変更</p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>名前</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>猫種</label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              style={{
                ...inputStyle,
                appearance: "none",
                WebkitAppearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
              }}
            >
              <option value="">猫種を選択...</option>
              {BREEDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>年齢</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="0" max="30" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>性別</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["オス", "メス"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: gender === g ? "2px solid #f59e0b" : "1px solid #e7e5e4",
                      background: gender === g ? "#fffbeb" : "#fafaf9",
                      color: gender === g ? "#b45309" : "#78716c",
                      fontSize: 14,
                      fontWeight: gender === g ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>性格・特徴</label>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="甘えん坊、ツンデレ、好奇心旺盛..."
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
            />
          </div>

          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimaryStyle, opacity: saving ? 0.6 : 1 }}>
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
      {photoCropFile && (
        <ImageCropper
          file={photoCropFile}
          onCrop={handlePhotoCropped}
          onCancel={() => setPhotoCropFile(null)}
        />
      )}
    </>
    );
  }

  // Detail view
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 14, color: "#78716c", cursor: "pointer", fontFamily: "inherit" }}>
            閉じる
          </button>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#292524" }}>{cat.name}</p>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {cat.photoUrl ? (
            <img
              src={cat.photoUrl}
              alt={cat.name}
              style={{ width: 100, height: 100, borderRadius: "50%", border: "3px solid #fbbf24", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#fef3c7,#fde68a)",
                border: "3px solid #fbbf24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                color: "#b45309",
                margin: "0 auto",
              }}
            >
              {cat.name.charAt(0)}
            </div>
          )}
        </div>

        <div style={{ background: "#fafaf9", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
          {[
            { label: "猫種", value: cat.breed },
            { label: "年齢", value: `${cat.age}歳` },
            { label: "性別", value: cat.gender },
            { label: "性格・特徴", value: cat.personality || "未設定" },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #e7e5e4" : "none" }}>
              <p style={{ fontSize: 12, color: "#a8a29e", marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: 15, color: "#292524" }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setEditing(true)}
            style={{ ...btnPrimaryStyle, flex: 1 }}
          >
            編集する
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 14,
              border: "1px solid #fecaca",
              background: "#fff",
              color: "#dc2626",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────── Cat Follower List Modal ────────
function CatFollowerListModal({ cat, onClose }: { cat: Cat; onClose: () => void }) {
  const [followers, setFollowers] = useState<Array<{ id: string; name: string; avatarUrl: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cats/${cat.id}/followers`).then((res) => {
      setFollowers(res.data);
      setLoading(false);
    });
  }, [cat.id]);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <p style={modalTitleStyle}>{cat.name} のフォロワー</p>
        {loading ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ width: 28, height: 28, border: "3px solid #fde68a", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : followers.length === 0 ? (
          <p style={{ textAlign: "center", padding: "30px 0", color: "#a8a29e", fontSize: 14 }}>
            まだフォロワーはいません
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {followers.map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {f.avatarUrl ? (
                  <img src={f.avatarUrl} alt={f.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #e7e5e4" }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", border: "2px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {f.name.charAt(0)}
                  </div>
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: "#292524" }}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid #e7e5e4", background: "#fff", color: "#78716c", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 20 }}>
          閉じる
        </button>
      </div>
    </div>
  );
}

// ──────── Main ProfileTab ────────
export default function ProfileTab({
  user,
  cats,
  onLogout,
  onUpdateProfile,
  onUpdateCat,
  onDeleteCat,
  onDeleteAccount,
  onRefreshCats,
}: ProfileTabProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [followerCat, setFollowerCat] = useState<Cat | null>(null);
  const [followingCats, setFollowingCats] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/users/${user.id}`).then((res) => setProfile(res.data));
  }, [user.id]);

  useEffect(() => {
    api.get(`/users/${user.id}/following`).then((res) => {
      setFollowingCats(res.data);
    });
  }, [user.id]);

  const u = profile || user;

  const handleSettingClick = (item: string) => {
    switch (item) {
      case "プロフィール編集":
        setModal("editProfile");
        break;
      case "通知設定":
        setModal("notifications");
        break;
      case "アカウント設定":
        setModal("account");
        break;
      case "ログアウト":
        onLogout();
        break;
    }
  };

  return (
    <div>
      {/* Gradient header */}
      <div
        style={{
          background: "linear-gradient(135deg,#fef3c7 0%,#fde68a 50%,#fed7aa 100%)",
          padding: "32px 16px 20px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {u.avatarUrl ? (
          <img
            src={u.avatarUrl}
            alt={u.name}
            onClick={() => setModal("editProfile")}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "3px solid #fbbf24",
              objectFit: "cover",
              margin: "0 auto 12px",
              display: "block",
              cursor: "pointer",
            }}
          />
        ) : (
          <div
            onClick={() => setModal("editProfile")}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#fff",
              border: "3px solid #fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 28,
              fontWeight: 700,
              color: "#b45309",
              cursor: "pointer",
            }}
          >
            {u.name.charAt(0)}
          </div>
        )}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#292524", position: "relative", margin: 0 }}>
          {u.name}
        </h2>
        {u.bio && (
          <p style={{ fontSize: 13, color: "#78716c", marginTop: 4, position: "relative" }}>{u.bio}</p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginTop: 16,
            position: "relative",
          }}
        >
          {[
            { v: u._count?.posts ?? 0, l: "投稿" },
            { v: u._count?.following ?? 0, l: "フォロー中" },
          ].map((s) => (
            <div key={s.l}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#292524" }}>{s.v}</p>
              <p style={{ fontSize: 11, color: "#78716c" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cats section */}
      <div style={{ padding: "20px 16px" }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#292524",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <PawPrint size={16} style={{ color: "#f59e0b" }} />
          うちの猫たち
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cats.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e7e5e4",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
              }}
            >
              {cat.photoUrl ? (
                <img
                  src={cat.photoUrl}
                  alt={cat.name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "3px solid #fbbf24",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#fef3c7,#fde68a)",
                    border: "3px solid #fbbf24",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#b45309",
                    flexShrink: 0,
                  }}
                >
                  {cat.name.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#292524" }}>{cat.name}</p>
                <p style={{ fontSize: 12, color: "#a8a29e", marginTop: 2 }}>
                  {cat.breed} / {cat.age}歳 / {cat.gender}
                </p>
                <div
                  onClick={(e) => { e.stopPropagation(); setFollowerCat(cat); }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 6,
                    padding: "3px 10px",
                    borderRadius: 10,
                    background: (cat._count?.followers ?? 0) > 0 ? "#fef3c7" : "#f5f5f4",
                    cursor: "pointer",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={(cat._count?.followers ?? 0) > 0 ? "#d97706" : "#a8a29e"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: (cat._count?.followers ?? 0) > 0 ? "#b45309" : "#a8a29e",
                  }}>
                    {cat._count?.followers ?? 0}人のフォロワー
                  </span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
          {cats.length === 0 && (
            <p style={{ fontSize: 13, color: "#a8a29e", textAlign: "center", padding: "20px 0" }}>
              猫がまだ登録されていません
            </p>
          )}
        </div>
      </div>

      {/* フォロー中の猫 */}
      <div style={{ padding: "0 16px 16px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#57534e", marginBottom: 10 }}>
          フォロー中の猫
        </p>
        {followingCats.length === 0 ? (
          <p style={{ fontSize: 13, color: "#a8a29e", padding: "12px 0" }}>
            まだフォロー中の猫はいません
          </p>
        ) : (
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {followingCats.map((cat) => (
              <div key={cat.id} style={{ textAlign: "center", flexShrink: 0 }}>
                {cat.photoUrl ? (
                  <img src={cat.photoUrl} alt={cat.name} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid #fde68a" }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "3px solid #fbbf24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#b45309" }}>
                    {cat.name.charAt(0)}
                  </div>
                )}
                <p style={{ fontSize: 12, fontWeight: 600, color: "#292524", marginTop: 4 }}>{cat.name}</p>
                <p style={{ fontSize: 10, color: "#a8a29e" }}>{cat.user?.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div style={{ padding: "0 16px 20px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#78716c", marginBottom: 10 }}>設定</h3>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e7e5e4",
            overflow: "hidden",
          }}
        >
          {["プロフィール編集", "通知設定", "アカウント設定", "ログアウト"].map((item, i, arr) => (
            <div
              key={item}
              onClick={() => handleSettingClick(item)}
              style={{
                padding: "13px 16px",
                fontSize: 14,
                cursor: "pointer",
                borderBottom: i < arr.length - 1 ? "1px solid #f5f5f4" : "none",
                fontWeight: item === "ログアウト" ? 500 : 400,
                color: item === "ログアウト" ? "#ef4444" : "#44403c",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal === "editProfile" && (
        <EditProfileModal
          user={u}
          onSave={async (data) => {
            await onUpdateProfile(data);
            const res = await api.get(`/users/${user.id}`);
            setProfile(res.data);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "notifications" && (
        <NotificationModal onClose={() => setModal(null)} />
      )}
      {modal === "account" && (
        <AccountModal
          user={u}
          onDeleteAccount={onDeleteAccount}
          onClose={() => setModal(null)}
        />
      )}
      {selectedCat && (
        <CatDetailModal
          cat={selectedCat}
          onUpdate={async (id, data) => {
            const updated = await onUpdateCat(id, data);
            setSelectedCat(updated);
            await onRefreshCats();
            return updated;
          }}
          onDelete={async (id) => {
            await onDeleteCat(id);
            setSelectedCat(null);
          }}
          onClose={() => setSelectedCat(null)}
        />
      )}
      {followerCat && (
        <CatFollowerListModal cat={followerCat} onClose={() => setFollowerCat(null)} />
      )}
    </div>
  );
}
