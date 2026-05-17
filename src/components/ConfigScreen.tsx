import React, { useState } from "react";
import { GameConfig } from "../types";
import { Play, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface ConfigScreenProps {
  onStartGame: (config: GameConfig, questions: any[]) => void;
}

export function ConfigScreen({ onStartGame }: ConfigScreenProps) {
  const [config, setConfig] = useState<GameConfig>({
    grade: "5",
    subject: "Toán",
    count: 10,
    difficulty: "Trung bình",
    timeLimit: 15,
    notes: "",
    mode: "Single",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        let msg = "Failed to generate questions. Please try again.";
        try {
           const errData = await response.json();
           if (errData.error) {
             try {
                // Try to parse the nested JSON error message if it's a string
                const parsedInner = JSON.parse(errData.error);
                if (parsedInner.error && parsedInner.error.message) {
                  msg = parsedInner.error.message;
                } else if (parsedInner.message) {
                  msg = parsedInner.message;
                } else {
                  msg = errData.error;
                }
             } catch(e) {
                msg = errData.error;
             }
           }
        } catch(e) {}
        throw new Error(msg);
      }

      const data = await response.json();
      
      // Assign client-side IDs
      const questionsWithIds = data.questions.map((q: any) => ({
        ...q,
        id: crypto.randomUUID(),
      }));

      onStartGame(config, questionsWithIds);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl w-full mx-auto p-8 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 shadow-2xl text-slate-100"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 font-display">
          Đập Chuột Vũ Trụ
        </h1>
        <p className="text-slate-400 font-medium">Thiết lập thông tin chuyến bay</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-300">Khối Lớp</label>
            <select
              value={config.grade}
              onChange={(e) => setConfig({ ...config, grade: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={`${i + 1}`}>Lớp {i + 1}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-300">Môn Học</label>
            <select
              value={config.subject}
              onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              {["Toán", "Văn", "Anh", "Lý", "Hóa", "Sinh", "Sử", "Địa", "GDCD"].map((subj) => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-300">Số lượng câu hỏi</label>
            <select
              value={config.count}
              onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              {[10, 20, 30].map((c) => (
                <option key={c} value={c}>{c} câu</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-300">Độ khó</label>
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              {["Dễ", "Trung bình", "Khó"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-300">Thời gian mỗi lượt (câu hỏi)</label>
            <select
              value={config.timeLimit}
              onChange={(e) => setConfig({ ...config, timeLimit: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              {[15, 30, 60].map((t) => (
                <option key={t} value={t}>{t}s</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-300">Chế độ chơi</label>
            <select
              value={config.mode}
              onChange={(e) => setConfig({ ...config, mode: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              <option value="Single">Cá nhân (1 Người)</option>
              <option value="2Teams">Đối kháng 2 Đội</option>
              <option value="Practice">Luyện tập (Vô hạn mạng & câu hỏi)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-indigo-300">Ghi chú thêm (Chủ đề bài học)</label>
          <input
            type="text"
            value={config.notes}
            onChange={(e) => setConfig({ ...config, notes: e.target.value })}
            placeholder="Ví dụ: Phép cộng trừ phân số, Hình học không gian..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-6 h-6" />
              <span>Đang chuẩn bị phi thuyền...</span>
            </>
          ) : (
            <>
              <Play fill="currentColor" className="w-6 h-6" />
              <span className="text-lg">Khởi động Trò chơi</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
