import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VALID_MOODS = [
  "ご機嫌", "リラックス", "甘えたい", "不安", "イライラ",
  "興奮", "警戒", "退屈", "眠い", "お腹すいた",
] as const;

interface CatInfo {
  name: string;
  breed: string;
  age: number;
  gender: string;
  personality?: string | null;
}

interface ConsultInput {
  cat: CatInfo;
  inputType: "text" | "photo" | "video";
  inputText?: string;
  imageBase64?: string;
  videoFrames?: string[];
}

interface ConsultResult {
  feeling: string;
  explanation: string;
  advice: string;
  mood: string;
}

function buildSystemPrompt(cat: CatInfo): string {
  return `あなたは猫の気持ちを翻訳する専門家です。
ユーザーが飼い猫の行動について相談します。猫の一人称（ニャ語）で、その猫になりきって気持ちを伝えてください。

## 猫の情報
- 名前: ${cat.name}
- 猫種: ${cat.breed}
- 年齢: ${cat.age}歳
- 性別: ${cat.gender}
- 性格: ${cat.personality || "特になし"}

## 回答ルール
1. 猫の一人称で話す（「〜ニャ」「〜だニャン」など猫語を使う）
2. その猫の性格や年齢を考慮して回答する
3. 以下のJSON形式で回答する:

\`\`\`json
{
  "feeling": "猫の気持ちを猫語で表現（2-3文）",
  "explanation": "飼い主向けの行動の説明（人間の言葉で）",
  "advice": "飼い主へのアドバイス（人間の言葉で）",
  "mood": "以下から1つ選択: ご機嫌, リラックス, 甘えたい, 不安, イライラ, 興奮, 警戒, 退屈, 眠い, お腹すいた"
}
\`\`\`

必ず上記のJSON形式のみで回答してください。JSON以外のテキストは含めないでください。`;
}

function buildUserContent(input: ConsultInput): Anthropic.MessageCreateParams["messages"][0]["content"] {
  const parts: Anthropic.ContentBlockParam[] = [];

  if (input.inputType === "text" && input.inputText) {
    parts.push({ type: "text", text: `猫の行動: ${input.inputText}` });
  }

  if (input.inputType === "photo" && input.imageBase64) {
    parts.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: input.imageBase64 },
    });
    parts.push({
      type: "text",
      text: input.inputText
        ? `写真の猫の行動について: ${input.inputText}`
        : "この写真の猫の気持ちを教えてニャ",
    });
  }

  if (input.inputType === "video" && input.videoFrames && input.videoFrames.length > 0) {
    parts.push({
      type: "text",
      text: `以下は猫の動画から抽出した${input.videoFrames.length}枚のフレームです。動きのパターンから気持ちを読み取ってください。`,
    });
    for (const frame of input.videoFrames) {
      parts.push({
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: frame },
      });
    }
    if (input.inputText) {
      parts.push({ type: "text", text: `補足: ${input.inputText}` });
    }
  }

  return parts;
}

function parseResponse(text: string): ConsultResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response format");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const mood = VALID_MOODS.includes(parsed.mood) ? parsed.mood : "ご機嫌";

  return {
    feeling: parsed.feeling || "",
    explanation: parsed.explanation || "",
    advice: parsed.advice || "",
    mood,
  };
}

export async function performConsultation(input: ConsultInput): Promise<ConsultResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: buildSystemPrompt(input.cat),
    messages: [{ role: "user", content: buildUserContent(input) }],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";
  return parseResponse(responseText);
}

export type { ConsultInput, ConsultResult, CatInfo };
