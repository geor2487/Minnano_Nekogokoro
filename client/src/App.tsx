import { useState, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "./hooks/useAuth";
import { useCats } from "./hooks/useCats";
import { usePosts } from "./hooks/usePosts";
import { PW_SVG } from "./components/Icons";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeTab from "./components/HomeTab";
import SearchTab from "./components/SearchTab";
import ProfileTab from "./components/ProfileTab";
import ComposeModal from "./components/ComposeModal";
import CommentModal from "./components/CommentModal";
import OnboardingGuide from "./components/OnboardingGuide";
import Consult from "./pages/Consult";
import Login from "./pages/Login";
import Register from "./pages/Register";
import api from "./lib/api";
// CatOnboarding is no longer forced - cats can be registered from profile or compose

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const { user, loading: authLoading, login, register, loginWithGoogle, logout, updateUser, deleteAccount } = useAuth();
  const { cats, fetchCats, createCat, updateCat, deleteCat } = useCats();
  const { createPost } = usePosts();

  const [tab, setTab] = useState("home");
  const [showCompose, setShowCompose] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("onboarded");
  });

  useEffect(() => {
    if (user) {
      fetchCats();
    }
  }, [user, fetchCats]);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      action();
    },
    [user]
  );

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
      setShowAuthModal(false);
    },
    [login]
  );

  const handleRegister = useCallback(
    async (email: string, password: string, name: string) => {
      await register(email, password, name);
      setShowAuthModal(false);
    },
    [register]
  );

  const handleGoogleLogin = useCallback(
    async (credential: string) => {
      await loginWithGoogle(credential);
      setShowAuthModal(false);
    },
    [loginWithGoogle]
  );

  const handlePost = useCallback(
    async (data: {
      content: string;
      catId: string;
      imageUrl?: string;
      videoUrl?: string;
      translation?: string;
      mood?: string;
      moodFace?: string;
    }) => {
      await createPost(data);
    },
    [createPost]
  );

  const handleOpenComment = useCallback(
    (postId: string) => {
      requireAuth(() => setCommentPostId(postId));
    },
    [requireAuth]
  );

  const handleTabChange = useCallback(
    (newTab: string) => {
      if (newTab === "profile" || newTab === "consult") {
        requireAuth(() => setTab(newTab));
      } else {
        setTab(newTab);
      }
    },
    [requireAuth]
  );

  const handleCompose = useCallback(() => {
    requireAuth(() => setShowCompose(true));
  }, [requireAuth]);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem("onboarded", "1");
    setShowOnboarding(false);
  }, []);

  const bgStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    opacity: 0.02,
    pointerEvents: "none",
    zIndex: 0,
    backgroundImage: "url('" + PW_SVG + "')",
    backgroundSize: "60px 60px",
  };

  // Loading state
  if (authLoading) {
    return (
      <div
        style={{
          fontFamily: "'Zen Maru Gothic',-apple-system,sans-serif",
          background: "#fffbf5",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid #fde68a",
            borderTopColor: "#f59e0b",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ marginTop: 16, fontSize: 13, color: "#a8a29e" }}>
          読み込み中...
        </p>
        <style>
          {"@keyframes spin { to { transform: rotate(360deg) } }"}
        </style>
      </div>
    );
  }

  // Main app - always shown (even without login)
  return (
    <div
      style={{
        fontFamily: "'Zen Maru Gothic',-apple-system,sans-serif",
        background: "#fffbf5",
        color: "#1c1917",
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <div style={bgStyle} />

      <Header />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          paddingBottom: 68,
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {tab === "home" && <HomeTab onComment={handleOpenComment} requireAuth={requireAuth} currentUserId={user?.id} />}
        {tab === "search" && <SearchTab onComment={handleOpenComment} requireAuth={requireAuth} currentUserId={user?.id} />}
        {tab === "consult" && user && <Consult cats={cats} onPost={handlePost} onGoHome={() => setTab("home")} />}
        {tab === "profile" && user && (
          <ProfileTab
            user={user}
            cats={cats}
            onLogout={logout}
            onUpdateProfile={async (data) => {
              const res = await api.put("/users/profile", data);
              updateUser(res.data);
            }}
            onUpdateCat={updateCat}
            onDeleteCat={async (id) => {
              await deleteCat(id);
            }}
            onDeleteAccount={deleteAccount}
            onRefreshCats={fetchCats}
          />
        )}
      </main>

      {showCompose && user && (
        <ComposeModal
          cats={cats}
          onClose={() => setShowCompose(false)}
          onPost={handlePost}
          onRegisterCat={createCat}
        />
      )}

      {commentPostId && (
        <CommentModal
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
        />
      )}

      <BottomNav
        currentTab={tab}
        onChangeTab={handleTabChange}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
          }}
          onClick={() => setShowAuthModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420 }}>
            {authPage === "login" ? (
              <Login
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
                onSwitchToRegister={() => setAuthPage("register")}
                onClose={() => setShowAuthModal(false)}
              />
            ) : (
              <Register
                onRegister={handleRegister}
                onGoogleLogin={handleGoogleLogin}
                onSwitchToLogin={() => setAuthPage("login")}
                onClose={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Onboarding Guide */}
      {showOnboarding && (
        <OnboardingGuide onComplete={handleOnboardingComplete} />
      )}

      <style>
        {
          "* {box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{display:none} button:focus,input:focus,textarea:focus{outline:none} ::placeholder{color:#a8a29e}"
        }
      </style>
    </div>
  );
}
