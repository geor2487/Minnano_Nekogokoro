import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CatInfo {
  name: string;
  breed: string;
  age: number;
  gender: string;
  personality?: string;
}

export interface AnalysisResult {
  behavior: string;
  context: string;
}

export interface TranslationResult {
  translation: string;
}

export interface MoodResult {
  mood: string;
  face: string;
}

const VALID_MOODS = ["集中", "甘え", "無関心", "ごきげん", "不安"] as const;

export async function analyzeBehavior(
  cat: CatInfo,
  text: string,
  imageBase64?: string
): Promise<AnalysisResult> {
  const content: Anthropic.ContentBlockParam[] = [];

  if (imageBase64) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
    });
  }

  content.push({
    type: "text",
    text: `猫の行動を客観的に分析してください。

猫の情報:
- 名前: ${cat.name}
- 猫種: ${cat.breed}
- 年齢: ${cat.age}歳
- 性別: ${cat.gender}
- 性格: ${cat.personality || "特になし"}

飼い主からの相談: ${text}

以下のJSON形式のみで回答してください:
{"behavior": "観察された行動の客観的な説明", "context": "その行動が起きる一般的な文脈や理由"}`,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 512,
    messages: [{ role: "user", content }],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("行動分析の応答が不正です");

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("行動分析の応答のJSON解析に失敗しました");
  }
}

export async function translateFeeling(
  cat: CatInfo,
  analysis: AnalysisResult
): Promise<TranslationResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `あなたは猫の気持ちを翻訳する専門家です。以下の行動分析結果をもとに、猫の一人称（ニャ語）で気持ちを表現してください。

猫の情報:
- 名前: ${cat.name}（${cat.breed}、${cat.age}歳、${cat.gender}）
- 性格: ${cat.personality || "特になし"}

行動分析:
- 行動: ${analysis.behavior}
- 文脈: ${analysis.context}

ルール:
- 「〜ニャ」「〜だニャン」など猫語を使う
- 猫の性格や年齢を反映させる
- 2-3文程度

以下のJSON形式のみで回答してください:
{"translation": "猫語での気持ち表現"}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("翻訳の応答が不正です");

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("翻訳の応答のJSON解析に失敗しました");
  }
}

export async function judgeMood(
  translation: string
): Promise<MoodResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `以下の猫語翻訳から、猫の気分を判定してください。

翻訳: ${translation}

気分は以下の5種類から1つ選んでください:
- 集中: 何かに夢中、狩猟本能
- 甘え: 甘えたい、寂しい、構ってほしい
- 無関心: 興味なし、どうでもいい
- ごきげん: 嬉しい、満足、楽しい
- 不安: 怖い、心配、パニック

また、対応する顔文字も選んでください:
- 集中: >w<
- 甘え: ^w^
- 無関心: -_-
- ごきげん: ^_^
- 不安: O_O

以下のJSON形式のみで回答してください:
{"mood": "気分", "face": "顔文字"}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Mood判定の応答が不正です");

  let result;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Mood判定の応答のJSON解析に失敗しました");
  }

  if (!VALID_MOODS.includes(result.mood)) {
    result.mood = "ごきげん";
    result.face = "^_^";
  }

  return result;
}
