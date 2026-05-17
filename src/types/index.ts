export interface Question {
  id: string; // Add a client-side ID
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  isBossQuestion: boolean;
}

export interface GameConfig {
  grade: string;
  subject: string;
  count: number;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  timeLimit: number; // 15, 30, 60
  notes: string;
  mode: "Single" | "2Teams" | "Practice";
}

export interface GameStats {
  score: number;
  stars: number;
  lives: number;
  combo: number;
  correctAnswers: number;
  wrongAnswers: number;
}
