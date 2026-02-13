export const MOODS = ["集中", "甘え", "無関心", "ごきげん", "不安"] as const;

export type Mood = (typeof MOODS)[number];

export const MOOD_COLORS: Record<
  Mood,
  { bg: string; fg: string; bd: string }
> = {
  集中: { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  甘え: { bg: "#fdf2f8", fg: "#be185d", bd: "#fbcfe8" },
  無関心: { bg: "#f5f5f4", fg: "#57534e", bd: "#d6d3d1" },
  ごきげん: { bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  不安: { bg: "#f5f3ff", fg: "#6d28d9", bd: "#ddd6fe" },
};

export const MOOD_FACES: Record<Mood, string> = {
  集中: ">w<",
  甘え: "^w^",
  無関心: "-_-",
  ごきげん: "^_^",
  不安: "O_O",
};

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  _count?: {
    posts: number;
    following: number;
  };
  cats?: Cat[];
}

export interface Cat {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  personality?: string | null;
  photoUrl?: string | null;
  userId?: string;
  user?: { id: string; name: string; avatarUrl?: string | null };
  _count?: {
    followers: number;
  };
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  translation?: string | null;
  mood?: string | null;
  moodFace?: string | null;
  catId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  cat: {
    id: string;
    name: string;
    breed: string;
    photoUrl?: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  liked?: boolean;
  isFollowingCat?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface TranslateResult {
  translation: string;
  mood: string;
  moodFace: string;
  analysis: {
    behavior: string;
    context: string;
  };
}
