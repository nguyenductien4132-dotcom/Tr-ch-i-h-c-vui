import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { grade, subject, count, difficulty, notes } = req.body;

    const prompt = `Bạn là một chuyên gia giáo dục và thiết kế nội dung trò chơi học tập.
Hãy tạo ${count} câu hỏi trắc nghiệm khách quan môn ${subject} dành cho học sinh Lớp ${grade}.
Độ khó: ${difficulty}.
Ghi chú thêm: ${notes || "Không có"}.

Yêu cầu định dạng JSON chính xác:
- question: Câu hỏi.
- options: Mảng chứa chính xác 4 lựa chọn (A, B, C, D). Mỗi lựa chọn chỉ chứa nội dung đáp án, không bắt đầu bằng "A. " hay "B. ".
- correctOptionIndex: Số nguyên từ 0 đến 3 biểu thị đáp án đúng tương ứng trong mảng options.
- explanation: Lời giải thích ngắn gọn tại sao lại là đáp án đó (dưới 15 chữ).

Lưu ý:
- Nội dung phải chính xác, bám sát chương trình phổ thông.
- Phân bổ 1 số câu hỏi khó hơn (khoảng 20%) để dùng làm câu hỏi Boss nếu người chơi đạt chuỗi 5 câu đúng.
- Không lặp lại câu hỏi.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
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
              isBossQuestion: { type: Type.BOOLEAN, description: "True if the question is harder and meant for boss battles." }
            },
            required: ["question", "options", "correctOptionIndex", "explanation", "isBossQuestion"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const generatedQuestions = JSON.parse(text);
    return res.status(200).json({ questions: generatedQuestions });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
}
