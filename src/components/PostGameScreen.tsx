import React from "react";
import { GameStats, GameConfig } from "../types";
import { CopyX, Trophy, Star, HeartCrack, RotateCcw, Medal } from "lucide-react";
import { motion } from "motion/react";

interface PostGameScreenProps {
  stats: GameStats;
  config: GameConfig;
  teamScores?: { A: number; B: number };
  onRestart: () => void;
}

export function PostGameScreen({ stats, config, teamScores, onRestart }: PostGameScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl w-full mx-auto p-8 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 shadow-2xl text-slate-100"
    >
      <div className="text-center mb-8">
        <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 font-display">
          Tổng Kết Nhiệm Vụ
        </h1>
        <p className="text-slate-400 font-medium">Báo cáo chuyến bay vũ trụ môn {config.subject}</p>
      </div>

      {config.mode === "2Teams" && teamScores ? (
        <div className="flex justify-center items-center gap-8 mb-10">
          <div className="flex flex-col items-center p-6 bg-blue-900/40 rounded-2xl border-2 border-blue-500/50 w-40">
            <h3 className="text-blue-400 font-bold mb-2 uppercase">Đội A</h3>
            <span className="text-4xl font-black text-white">{teamScores.A}</span>
          </div>
          <div className="text-3xl font-black text-slate-500">VS</div>
          <div className="flex flex-col items-center p-6 bg-red-900/40 rounded-2xl border-2 border-red-500/50 w-40">
            <h3 className="text-red-400 font-bold mb-2 uppercase">Đội B</h3>
            <span className="text-4xl font-black text-white">{teamScores.B}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-800/50 p-4 rounded-xl flex flex-col items-center border border-slate-700">
            <Medal className="w-8 h-8 text-indigo-400 mb-2" />
            <span className="text-sm text-slate-400">Điểm Số</span>
            <span className="text-2xl font-bold">{stats.score}</span>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl flex flex-col items-center border border-slate-700">
            <Star className="w-8 h-8 text-yellow-400 mb-2" />
            <span className="text-sm text-slate-400">Số Sao</span>
            <span className="text-2xl font-bold">{stats.stars}</span>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl flex flex-col items-center border border-slate-700">
            <CopyX className="w-8 h-8 text-emerald-400 mb-2" />
            <span className="text-sm text-slate-400">Câu Đúng</span>
            <span className="text-2xl font-bold">{stats.correctAnswers}/{stats.correctAnswers + stats.wrongAnswers}</span>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl flex flex-col items-center border border-slate-700">
             <HeartCrack className="w-8 h-8 text-red-400 mb-2" />
            <span className="text-sm text-slate-400">Mất máu</span>
            <span className="text-2xl font-bold">{stats.wrongAnswers}</span>
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition active:scale-95"
      >
        <RotateCcw className="w-6 h-6" />
        <span className="text-lg">Chơi Lại / Cài Đặt Mới</span>
      </button>
    </motion.div>
  );
}
