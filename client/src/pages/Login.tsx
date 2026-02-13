import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { PawPrint } from "../components/Icons";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: (credential: string) => Promise<void>;
  onSwitchToRegister: () => void;
  onClose?: () => void;
}

export default function Login({ onLogin, onGoogleLogin, onSwitchToRegister, onClose }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        setError((err.response as { data: { message: string } }).data.message);
      } else {
        setError("ログインに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: onClose ? undefined : "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: onClose ? "transparent" : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 24,
          padding: "40px 28px",
          boxShadow: "0 4px 24px rgba(180,83,9,0.08)",
        }}
      >
        {onClose && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: 20, color: "#a8a29e", cursor: "pointer", fontFamily: "inherit", padding: "4px 8px" }}
            >
              x
            </button>
          </div>
        )}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#fff",
            }}
          >
            <PawPrint size={28} />
          </div>
          <h1 style={{ margin: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 24, color: "#f59e0b" }}>みんなの</span>
            <span style={{ fontWeight: 700, fontSize: 24, color: "#292524" }}>ネコゴコロ</span>
          </h1>
          <p style={{ fontSize: 13, color: "#78716c", marginTop: 6 }}>
            猫の気持ち、翻訳します
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #e7e5e4",
                fontSize: 14,
                color: "#1c1917",
                background: "#fafaf9",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#57534e", marginBottom: 6 }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="パスワード"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #e7e5e4",
                fontSize: 14,
                color: "#1c1917",
                background: "#fafaf9",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 12,
              border: "none",
              background: loading ? "#d6d3d1" : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e7e5e4" }} />
          <span style={{ fontSize: 12, color: "#a8a29e" }}>または</span>
          <div style={{ flex: 1, height: 1, background: "#e7e5e4" }} />
        </div>

        {/* Google Login */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                onGoogleLogin(credentialResponse.credential);
              }
            }}
            onError={() => setError("Googleログインに失敗しました")}
            theme="outline"
            size="large"
            width="320"
            text="signin_with"
          />
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#78716c", marginTop: 20 }}>
          アカウントをお持ちでない方は{" "}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: "none",
              border: "none",
              color: "#f59e0b",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              padding: 0,
            }}
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
}
