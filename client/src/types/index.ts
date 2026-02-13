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
  coverUrl?: string | null;
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
  videoUrl?: string | null;
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

// ── 相談機能（10 mood 詳細版） ──

export const CONSULT_MOODS = [
  "ご機嫌", "リラックス", "甘えたい", "不安", "イライラ",
  "興奮", "警戒", "退屈", "眠い", "お腹すいた",
] as const;

export type ConsultMood = (typeof CONSULT_MOODS)[number];

export const CONSULT_MOOD_COLORS: Record<ConsultMood, { bg: string; fg: string; bd: string }> = {
  ご機嫌:     { bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  リラックス: { bg: "#ecfdf5", fg: "#047857", bd: "#a7f3d0" },
  甘えたい:   { bg: "#fdf2f8", fg: "#be185d", bd: "#fbcfe8" },
  不安:       { bg: "#f5f3ff", fg: "#6d28d9", bd: "#ddd6fe" },
  イライラ:   { bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
  興奮:       { bg: "#fff7ed", fg: "#c2410c", bd: "#fed7aa" },
  警戒:       { bg: "#fefce8", fg: "#a16207", bd: "#fef08a" },
  退屈:       { bg: "#f5f5f4", fg: "#57534e", bd: "#d6d3d1" },
  眠い:       { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
  お腹すいた: { bg: "#fef9c3", fg: "#854d0e", bd: "#fde047" },
};

export const CONSULT_MOOD_FACES: Record<ConsultMood, string> = {
  ご機嫌:     "^_^",
  リラックス: "-w-",
  甘えたい:   "^w^",
  不安:       "O_O",
  イライラ:   ">_<",
  興奮:       ">w<",
  警戒:       "o_o",
  退屈:       "-_-",
  眠い:       "=w=",
  お腹すいた: "T_T",
};

export type InputType = "text" | "photo" | "video";

export type FrameCount = 3 | 5 | 10;

export const FRAME_OPTIONS: { value: FrameCount; label: string }[] = [
  { value: 3,  label: "さくっと" },
  { value: 5,  label: "ふつう" },
  { value: 10, label: "じっくり" },
];

export interface ConsultResult {
  feeling: string;
  explanation: string;
  advice: string;
  mood: ConsultMood;
}

export interface Consultation {
  id: string;
  catId: string;
  inputType: InputType;
  inputText?: string | null;
  mediaUrl?: string | null;
  frameCount?: number | null;
  feeling: string;
  explanation: string;
  advice: string;
  mood: string;
  createdAt: string;
  cat: {
    id: string;
    name: string;
    breed: string;
    photoUrl?: string | null;
  };
}
