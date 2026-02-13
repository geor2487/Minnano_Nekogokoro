import {
  analyzeBehavior,
  translateFeeling,
  judgeMood,
  CatInfo,
} from "./subagents";

export interface TranslateInput {
  cat: CatInfo;
  text: string;
  imageBase64?: string;
}

export interface TranslateOutput {
  translation: string;
  mood: string;
  moodFace: string;
  analysis: {
    behavior: string;
    context: string;
  };
}

export async function orchestrateTranslation(
  input: TranslateInput
): Promise<TranslateOutput> {
  // Step 1: 行動分析 Agent
  const analysis = await analyzeBehavior(
    input.cat,
    input.text,
    input.imageBase64
  );

  // Step 2: 気持ち翻訳 Agent (分析結果に依存)
  const { translation } = await translateFeeling(input.cat, analysis);

  // Step 3: Mood判定 Agent (翻訳結果に依存)
  const { mood, face } = await judgeMood(translation);

  return {
    translation,
    mood,
    moodFace: face,
    analysis,
  };
}
