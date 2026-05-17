import React, { useState } from "react";
import { ConfigScreen } from "./components/ConfigScreen";
import { GameScreen } from "./components/GameScreen";
import { PostGameScreen } from "./components/PostGameScreen";
import { GameConfig, Question, GameStats } from "./types";

type AppState = "CONFIG" | "PLAYING" | "POSTGAME";

export default function App() {
  const [appState, setAppState] = useState<AppState>("CONFIG");
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [teamScores, setTeamScores] = useState<{A: number, B: number}>();

  const handleStartGame = (gameConfig: GameConfig, generatedQuestions: Question[]) => {
    setConfig(gameConfig);
    setQuestions(generatedQuestions);
    setAppState("PLAYING");
  };

  const handleEndGame = (finalStats: GameStats, finalTeamScores?: {A: number, B: number}) => {
    setStats(finalStats);
    setTeamScores(finalTeamScores);
    setAppState("POSTGAME");
  };

  const handleRestart = () => {
    setConfig(null);
    setQuestions([]);
    setStats(null);
    setTeamScores(undefined);
    setAppState("CONFIG");
  };

  return (
    <div className="min-h-screen bg-[#0B0D17] font-sans text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(66,35,166,0.5),transparent)]"></div>
      <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <div className="absolute top-40 left-80 w-1 h-1 bg-blue-300 rounded-full"></div>
      <div className="absolute top-20 right-20 w-3 h-3 bg-purple-400 rounded-full blur-sm"></div>
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-white rounded-full"></div>

      <div className="relative z-10 w-full h-full flex flex-col p-4 items-center justify-center">
        {appState === "CONFIG" && (
          <ConfigScreen onStartGame={handleStartGame} />
        )}
        
        {appState === "PLAYING" && config && questions.length > 0 && (
          <GameScreen 
            config={config} 
            questions={questions} 
            onEndGame={handleEndGame} 
          />
        )}

        {appState === "POSTGAME" && stats && config && (
          <PostGameScreen 
            stats={stats} 
            config={config}
            teamScores={teamScores}
            onRestart={handleRestart} 
          />
        )}
      </div>
    </div>
  );
}
