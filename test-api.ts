import { GoogleGenAI, Type } from "@google/genai";

async function test() {
  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Tạo 2 câu hỏi toán lớp 1",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctOptionIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              isBossQuestion: { type: Type.BOOLEAN }
            },
            required: ["question", "options", "correctOptionIndex", "explanation", "isBossQuestion"],
          },
        },
      },
    });
    console.log(response.text);
  } catch (err: any) {
    console.error("TEST ERROR:", err.message);
  }
}

test();
