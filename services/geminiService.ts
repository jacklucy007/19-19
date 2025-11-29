import { GoogleGenAI } from "@google/genai";
import { Question, DialogueLine, CharacterId } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

// Helper to parse JSON safely from AI response
const parseJSON = (text: string) => {
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) return [];
    return JSON.parse(text.substring(start, end + 1));
  } catch (e) {
    console.error("Failed to parse AI JSON", e);
    return [];
  }
};

export const getMissionBriefing = async (): Promise<string> => {
  // Keeping original simple briefing for fallback
  return "准备战斗！外星人来了！熟练运用19x19乘法！🚀";
};

export const getStoryDialogue = async (phase: 'START' | 'BOSS_APPROACH' | 'VICTORY' | 'GAME_OVER', level: number): Promise<DialogueLine[]> => {
  try {
    let prompt = "";
    
    if (phase === 'START') {
      prompt = `
        Create a short dialogue (2-3 lines) for a game intro.
        Characters: 
        1. 'nova' (Commander): Welcomes the cadet (player). Serious.
        2. 'sparky' (Robot): Excited about the 19x19 engine.
        Format: JSON Array of objects { "characterId": "nova"|"sparky", "text": "Chinese text" }.
        Language: Chinese.
      `;
    } else if (phase === 'BOSS_APPROACH') {
      prompt = `
        Create a short dialogue (2 lines) for a Boss fight (Level ${level}).
        Characters:
        1. 'chaos' (Villain): Taunts the player about math being hard.
        2. 'nova' (Commander): Tells player to focus.
        Format: JSON Array of objects { "characterId": "chaos"|"nova", "text": "Chinese text" }.
        Language: Chinese.
      `;
    } else if (phase === 'VICTORY') {
      prompt = `
         Create a dialogue (2 lines) for winning a level.
         1. 'sparky': Cheering.
         2. 'nova': Good job.
         Format: JSON Array. Chinese.
      `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    const lines = parseJSON(response.text || "");
    
    // Fallbacks if AI fails or returns empty
    if (lines.length === 0) {
       if (phase === 'START') {
         return [
           { characterId: 'nova', text: '欢迎来到银河数学学院，新兵。我是诺瓦指挥官。' },
           { characterId: 'sparky', text: '哔哔！我是斯帕克！你的飞船引擎已经预热完毕！' }
         ];
       }
       if (phase === 'BOSS_APPROACH') {
          return [
            { characterId: 'chaos', text: '你们这些只会死记硬背的地球人，感受混乱吧！' },
            { characterId: 'nova', text: '别听他的！集中精神，计算结果！' }
          ];
       }
    }

    return lines;

  } catch (error) {
    console.error("Gemini dialogue error:", error);
    return [{ characterId: 'sparky', text: '通讯受到干扰...我们必须靠自己了！' }];
  }
};

export const getAfterActionReport = async (score: number, mistakes: Question[]): Promise<string> => {
  try {
    const mistakeText = mistakes.map(m => `${m.factorA} x ${m.factorB} = ${m.answer}`).join(", ");
    
    const prompt = `
      You are 'nova' (Commander). Debrief a student.
      Score: ${score}.
      Mistakes: [${mistakeText}].
      Briefly explain one mistake if any. Encouraging tone.
      Language: Chinese. Max 2 sentences.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || `战斗结束！得分: ${score}。继续加油！`;
  } catch (error) {
    return `通讯结束。最终得分: ${score}。下次再战！`;
  }
};
