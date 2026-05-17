import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Question } from "../types";
import { Timer, AlertCircle } from "lucide-react";

interface QuestionModalProps {
  key?: React.Key;
  question: Question;
  timeLimit: number; // in seconds
  onAnswer: (isCorrect: boolean) => void;
  teamTurn?: "A" | "B";
  stars: number;
  onUseItem: (cost: number) => void;
}

export function QuestionModal({ question, timeLimit, onAnswer, teamTurn, stars, onUseItem }: QuestionModalProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAnswer(-1); // Timeout
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return; // Prevent double click
    
    setSelectedOption(index);
    const isCorrect = index === (typeof question?.correctOptionIndex === 'number' ? question.correctOptionIndex : 0);
    
    // Brief delay to show what they clicked before moving on
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1500);
  };

  const handleAddTime = () => {
    if (stars >= 3) {
      onUseItem(3);
      setTimeLeft(prev => prev + 15);
    }
  };

  const handleFiftyFifty = () => {
    if (stars >= 5 && eliminatedOptions.length === 0) {
      onUseItem(5);
      const verifiedCorrectIdx = typeof question?.correctOptionIndex === 'number' ? question.correctOptionIndex : 0;
      const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== verifiedCorrectIdx);
      // random 2 wrong answers to eliminate
      const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
      setEliminatedOptions(toEliminate);
    }
  };

  const isWarning = timeLeft <= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`w-full max-w-[700px] bg-white text-gray-900 rounded-[40px] p-6 md:p-10 shadow-[0_0_60px_rgba(255,255,255,0.2)] flex flex-col gap-8 border-[12px] relative
          ${question.isBossQuestion ? "border-amber-500" : "border-indigo-500"}
        `}
      >
        <div className={`absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 font-black px-6 md:px-10 py-2 md:py-3 rounded-full text-lg md:text-xl shadow-xl transform rotate-1 whitespace-nowrap
          ${question.isBossQuestion ? "bg-red-500 text-white" : "bg-yellow-400 text-black"}
        `}>
          {question.isBossQuestion ? "BOSS BATTLE!" : "TRẢ LỜI CÂU HỎI"}
          {teamTurn && ` - LƯỢT ĐỘI ${teamTurn}`}
        </div>

        <div className="absolute top-4 right-6 flex items-center gap-2 font-mono text-2xl font-bold">
          <div className={`px-4 py-1 flex items-center gap-2 rounded-full border-4 shadow-sm
            ${isWarning ? "border-red-400 bg-red-100 text-red-600 animate-pulse" : "border-blue-400 bg-blue-100 text-blue-600"}
          `}>
            {isWarning ? <AlertCircle className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
            {timeLeft}s
          </div>
        </div>

        <div className="text-center mt-8">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">
            {question.question}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Array.isArray(question?.options) && question.options.length === 4 ? question.options : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"]).map((opt, idx) => {
            const alphabet = ["A", "B", "C", "D"];
            const isEliminated = eliminatedOptions.includes(idx);
            const verifiedCorrectIdx = typeof question?.correctOptionIndex === 'number' ? question.correctOptionIndex : 0;
            
            const colors = [
              { base: "blue", bg: "bg-blue-50", border: "border-blue-200", hoverBg: "hover:bg-blue-500", hoverBorder: "hover:border-blue-600", text: "text-gray-900", hoverText: "hover:text-white", circleBg: "bg-blue-600", circleText: "text-white" },
              { base: "purple", bg: "bg-purple-50", border: "border-purple-200", hoverBg: "hover:bg-purple-500", hoverBorder: "hover:border-purple-600", text: "text-gray-900", hoverText: "hover:text-white", circleBg: "bg-purple-600", circleText: "text-white" },
              { base: "pink", bg: "bg-pink-50", border: "border-pink-200", hoverBg: "hover:bg-pink-500", hoverBorder: "hover:border-pink-600", text: "text-gray-900", hoverText: "hover:text-white", circleBg: "bg-pink-600", circleText: "text-white" },
              { base: "green", bg: "bg-green-50", border: "border-green-200", hoverBg: "hover:bg-green-500", hoverBorder: "hover:border-green-600", text: "text-gray-900", hoverText: "hover:text-white", circleBg: "bg-green-600", circleText: "text-white" }
            ];
            
            const clr = colors[idx];
            
            let btnClass = `${clr.bg} border-4 ${clr.border} rounded-2xl text-xl font-bold ${clr.hoverBg} ${clr.hoverText} ${clr.hoverBorder} transition-all text-left flex items-center gap-4`;
            let circleClass = `${clr.circleBg} ${clr.circleText} w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors`;
            
            if (selectedOption !== null) {
              if (idx === verifiedCorrectIdx) {
                btnClass = "bg-green-500 border-4 border-green-600 rounded-2xl text-xl font-bold text-white text-left flex items-center gap-4 transition-all";
                circleClass = "bg-green-700 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors";
              } else if (idx === selectedOption) {
                btnClass = "bg-red-500 border-4 border-red-600 rounded-2xl text-xl font-bold text-white text-left flex items-center gap-4 transition-all opacity-80";
                circleClass = "bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors";
              } else {
                btnClass = "bg-gray-100 border-4 border-gray-200 rounded-2xl text-xl font-bold text-gray-400 text-left flex items-center gap-4 transition-all opacity-50";
                circleClass = "bg-gray-300 text-gray-500 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors";
              }
            }
            
            if (isEliminated) {
              btnClass = "bg-gray-100 border-4 border-gray-200 rounded-2xl text-xl font-bold text-gray-300 text-left flex items-center gap-4 cursor-not-allowed opacity-50";
              circleClass = "bg-gray-200 text-gray-400 w-10 h-10 rounded-full flex items-center justify-center shrink-0";
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null || isEliminated}
                onClick={() => handleAnswer(idx)}
                className={`p-4 md:p-6 ${btnClass}`}
              >
                <span className={circleClass}>
                  {alphabet[idx]}
                </span>
                <span>{isEliminated ? "..." : opt}</span>
              </button>
            );
          })}
        </div>

        {!selectedOption && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleAddTime}
              disabled={stars < 3}
              className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-800 border-2 border-blue-200 hover:bg-blue-200 disabled:opacity-50 disabled:hover:bg-blue-100 rounded-xl font-bold transition"
            >
              <span>+15s (3 ⭐)</span>
            </button>
            <button
              onClick={handleFiftyFifty}
              disabled={stars < 5 || eliminatedOptions.length > 0}
              className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-800 border-2 border-amber-200 hover:bg-amber-200 disabled:opacity-50 disabled:hover:bg-amber-100 rounded-xl font-bold transition"
            >
              <span>50/50 (5 ⭐)</span>
            </button>
          </div>
        )}

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`p-4 rounded-xl text-center font-bold text-lg border-2 ${
                selectedOption === (typeof question?.correctOptionIndex === 'number' ? question.correctOptionIndex : 0)
                  ? "bg-green-100 border-green-300 text-green-800" 
                  : "bg-red-100 border-red-300 text-red-800"
              }`}
            >
              {selectedOption === (typeof question?.correctOptionIndex === 'number' ? question.correctOptionIndex : 0) ? "🎉 Tuyệt vời! " : "👎 Rất tiếc! "}
              {question?.explanation || ""}
            </motion.div>
          )}
          
          {selectedOption === null && timeLeft <= 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-xl text-center font-bold text-lg bg-red-100 border-2 border-red-300 text-red-800"
            >
              Hết giờ! Đáp án đúng là {["A", "B", "C", "D"][typeof question?.correctOptionIndex === 'number' ? question.correctOptionIndex : 0] || "Đáp án"}.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
