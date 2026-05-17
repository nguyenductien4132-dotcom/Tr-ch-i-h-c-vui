import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Question, GameConfig, GameStats } from "../types";
import { Mole, MoleState } from "./Mole";
import { QuestionModal } from "./QuestionModal";
import { Heart, Star, Sparkles, User, Users, Pause } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GameScreenProps {
  config: GameConfig;
  questions: Question[];
  onEndGame: (stats: GameStats, teamScores?: { A: number; B: number }) => void;
}

const NUMBER_OF_MOLES = 6;
const MAX_LIVES = 3;

interface ActiveHole {
  holeId: number;
  state: MoleState;
  questionBase: Question;
  isBoss: boolean;
  spawnTime: number;
}

export function GameScreen({ config, questions, onEndGame }: GameScreenProps) {
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    stars: 0,
    lives: MAX_LIVES,
    combo: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  
  const [teamScores, setTeamScores] = useState({ A: 0, B: 0 });
  const teamScoresRef = useRef(teamScores);
  useEffect(() => { teamScoresRef.current = teamScores; }, [teamScores]);

  const [activeTeamTurn, setActiveTeamTurn] = useState<"A" | "B">("A");

  const availableQuestionsRef = useRef<Question[]>([...questions]);
  const [activeHoles, setActiveHoles] = useState<ActiveHole[]>([]);
  const activeHolesRef = useRef<ActiveHole[]>([]);
  const [activeQuestionHole, setActiveQuestionHole] = useState<ActiveHole | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const gameLoopRef = useRef<number>(null);
  const lastSpawnRef = useRef<number>(Date.now());
  const isPausedRef = useRef<boolean>(false);
  
  useEffect(() => {
    isPausedRef.current = isMenuOpen || activeQuestionHole !== null;
  }, [isMenuOpen, activeQuestionHole]);
  const pauseTimeRef = useRef<number>(0);

  // Difficulty speed parameters
  const getSpawnRate = () => {
    switch (config.difficulty) {
      case "Dễ": return 2500;
      case "Trung bình": return 1800;
      case "Khó": return 1200;
      default: return 2000;
    }
  };

  const getMoleLifetime = () => {
    // How long mole stays up before disappearing automatically (if not clicked)
    switch (config.difficulty) {
      case "Dễ": return 4000;
      case "Trung bình": return 3000;
      case "Khó": return 2000;
      default: return 3000;
    }
  };

  useEffect(() => {
    const loop = () => {
      if (isPausedRef.current) {
        gameLoopRef.current = requestAnimationFrame(loop);
        return;
      }

      const now = Date.now();
      const spawnRate = getSpawnRate() * Math.max(0.5, 1 - statsRef.current.combo * 0.05); // Speed up with combo
      const lifetime = getMoleLifetime();

      let changed = false;
      const currentHoles = activeHolesRef.current;

      // Clean up old moles
      const expired = currentHoles.filter(h => now - h.spawnTime >= lifetime && h.state !== "laughing" && h.state !== "dead");
      if (expired.length > 0) {
        availableQuestionsRef.current.push(...expired.map(h => h.questionBase));
        changed = true;
      }

      const remainingHoles = currentHoles.filter(h => {
        if (h.state === "laughing" || h.state === "dead") return true; // Let timeout clean these up
        return now - h.spawnTime < lifetime;
      });

      if (remainingHoles.length !== currentHoles.length) {
        activeHolesRef.current = remainingHoles;
        changed = true;
      }

      // Failsafe: if we run out of questions but haven't triggered end game
      if (availableQuestionsRef.current.length === 0 && activeHolesRef.current.length === 0) {
        if (config.mode === "Practice") {
          availableQuestionsRef.current = [...questions].sort(() => Math.random() - 0.5);
        } else if (statsRef.current.correctAnswers + statsRef.current.wrongAnswers < questions.length) {
          checkEndGame(questions.length, statsRef.current.lives);
        }
      }

      // Spawn new mole
      if (now - lastSpawnRef.current > spawnRate && availableQuestionsRef.current.length > 0 && activeHolesRef.current.length < 3) {
        const emptyHoles = [...Array(NUMBER_OF_MOLES).keys()].filter(
          (id) => !activeHolesRef.current.find((h) => h.holeId === id)
        );

        if (emptyHoles.length > 0) {
          const randomHole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
          const isBossEligible = statsRef.current.combo > 0 && statsRef.current.combo % 5 === 0;
          
          // Select question
          let qIndex = 0;
          if (isBossEligible) {
            const bossQIndex = availableQuestionsRef.current.findIndex(q => q.isBossQuestion);
            if (bossQIndex !== -1) qIndex = bossQIndex;
          }

          const question = availableQuestionsRef.current[qIndex];
          availableQuestionsRef.current.splice(qIndex, 1);

          lastSpawnRef.current = now;

          activeHolesRef.current = [
            ...activeHolesRef.current,
            {
              holeId: randomHole,
              state: isBossEligible ? "boss" : "up",
              questionBase: question,
              isBoss: isBossEligible,
              spawnTime: now
            }
          ];
          changed = true;
        }
      }

      if (changed) {
        setActiveHoles([...activeHolesRef.current]);
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const handleWhack = (holeId: number) => {
    if ((statsRef.current.lives <= 0 && config.mode !== "Practice") || ((statsRef.current.correctAnswers + statsRef.current.wrongAnswers) >= questions.length && config.mode !== "Practice")) return;
    const targetHole = activeHolesRef.current.find(h => h.holeId === holeId);
    if (!targetHole || (targetHole.state !== "up" && targetHole.state !== "boss")) return;

    pauseTimeRef.current = Date.now();
    isPausedRef.current = true;
    setActiveQuestionHole(targetHole);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!activeQuestionHole) return;

    const holeId = activeQuestionHole.holeId;
    const isBoss = activeQuestionHole.isBoss;

    if (isCorrect) {
      // Fire confetti
      confetti({
        particleCount: isBoss ? 150 : 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: isBoss ? ['#fbbf24', '#f59e0b', '#ef4444'] : ['#818cf8', '#c084fc', '#34d399']
      });

      const points = isBoss ? 200 : 100;
      const starsEarned = isBoss ? 3 : 1;
      
      setStats(prev => ({
        ...prev,
        score: prev.score + points,
        stars: prev.stars + starsEarned,
        combo: prev.combo + 1,
        correctAnswers: prev.correctAnswers + 1
      }));

      if (config.mode === "2Teams") {
        setTeamScores(prev => ({
          ...prev,
          [activeTeamTurn]: prev[activeTeamTurn as "A" | "B"] + points
        }));
      }

      // Update mole state to dead
      activeHolesRef.current = activeHolesRef.current.map(h => h.holeId === holeId ? { ...h, state: "dead" } : h);
      setActiveHoles([...activeHolesRef.current]);
      
      setTimeout(() => {
        activeHolesRef.current = activeHolesRef.current.filter(h => h.holeId !== holeId);
        setActiveHoles([...activeHolesRef.current]);
        checkEndGame(statsRef.current.correctAnswers + statsRef.current.wrongAnswers, statsRef.current.lives);
      }, 1000);

    } else {
      setStats(prev => ({
        ...prev,
        lives: prev.lives - 1,
        combo: 0,
        wrongAnswers: prev.wrongAnswers + 1
      }));

      // Update mole state to laughing
      activeHolesRef.current = activeHolesRef.current.map(h => h.holeId === holeId ? { ...h, state: "laughing" } : h);
      setActiveHoles([...activeHolesRef.current]);
      
      setTimeout(() => {
        activeHolesRef.current = activeHolesRef.current.filter(h => h.holeId !== holeId);
        setActiveHoles([...activeHolesRef.current]);
        checkEndGame(statsRef.current.correctAnswers + statsRef.current.wrongAnswers, statsRef.current.lives);
      }, 1500);
    }

    setActiveQuestionHole(null);
    
    // Adjust timers so moles don't immediately expire after a long pause
    const pauseDuration = Date.now() - pauseTimeRef.current;
    lastSpawnRef.current += pauseDuration;
    activeHolesRef.current.forEach(h => { h.spawnTime += pauseDuration; });
    
    isPausedRef.current = false;
    
    if (config.mode === "2Teams") {
      setActiveTeamTurn(t => t === "A" ? "B" : "A");
    }
  };

  const checkEndGame = (totalAnswered: number, currentLives: number) => {
    if ((currentLives <= 0 && config.mode !== "Practice") || (totalAnswered >= questions.length && config.mode !== "Practice")) {
      setTimeout(() => {
        onEndGame(statsRef.current, config.mode === "2Teams" ? teamScoresRef.current : undefined);
      }, 1000);
    }
  };

  return (
    <div className="relative w-[1024px] max-w-full h-full max-h-[768px] mx-auto flex flex-col font-sans">
      {/* Header HUD */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center px-8 py-6">
        <div className="flex gap-4">
          {config.mode !== "Practice" ? (
            <div className="bg-black/40 backdrop-blur-md border-2 border-red-500/50 rounded-2xl px-4 py-2 flex items-center gap-3">
               <Heart className="w-6 h-6 text-red-500 fill-red-500" />
               <span className="text-2xl font-black text-white">{stats.lives} / {MAX_LIVES}</span>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-md border-2 border-emerald-500/50 rounded-2xl px-4 py-2 flex items-center gap-2">
               <span className="text-emerald-400 font-bold uppercase tracking-wider">Luyện Tập</span>
            </div>
          )}
          <div className="bg-black/40 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl px-4 py-2 flex items-center gap-3">
             <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
             <span className="text-2xl font-black text-white">{stats.stars}</span>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl px-6 py-2 flex flex-col items-center min-w-[200px]">
          <div className="text-xs uppercase tracking-widest text-blue-300 mb-1">
            {config.mode === "2Teams" ? (
              <span className="flex gap-4">
                <span className={activeTeamTurn === 'A' ? 'text-white' : 'text-slate-500'}>Đội A: {teamScores.A}</span>
                <span className={activeTeamTurn === 'B' ? 'text-white' : 'text-slate-500'}>Đội B: {teamScores.B}</span>
              </span>
            ) : (
              <span>Điểm số</span>
            )}
          </div>
          {config.mode !== "2Teams" && (
            <span className="text-3xl font-mono font-bold text-white tracking-wider">{stats.score.toString().padStart(5, '0')}</span>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-black/40 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl px-6 py-2">
            <div className="text-xs uppercase text-purple-300">Chuỗi đúng</div>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${i < (stats.combo % 5 === 0 && stats.combo > 0 ? 5 : stats.combo % 5) ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="bg-black/40 backdrop-blur-md border-2 border-slate-500/50 hover:bg-white/10 hover:border-slate-300 rounded-2xl p-3 flex items-center justify-center transition-all"
            title="Dừng trò chơi"
          >
            <Pause className="w-8 h-8 text-white fill-white" />
          </button>
        </div>
      </div>

      {stats.combo >= 2 && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-32 left-8 z-10 flex items-center gap-2"
          >
            <Sparkles className="text-orange-400 w-8 h-8 animate-pulse" fill="currentColor"/>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 italic drop-shadow-lg font-display">
              {stats.combo} Combo!
            </span>
            {stats.combo > 0 && stats.combo % 5 === 0 && (
              <span className="ml-2 px-3 py-1 bg-red-600 text-white font-bold rounded-full text-xs uppercase animate-bounce shadow-lg shadow-red-500/50">Boss Ready</span>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Game Board */}
      <div className="relative z-0 flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-16 px-10 md:px-20 py-10 content-center max-w-5xl mx-auto w-full">
        {/* Fill empty holes */}
        {[...Array(8)].map((_, index) => {
          // Map 6 active moles into 8 holes
          const holeId = index < NUMBER_OF_MOLES ? index : null;
          const activeMole = holeId !== null ? activeHoles.find(h => h.holeId === holeId) : null;
          
          if (holeId !== null) {
            return (
              <Mole
                key={holeId}
                id={holeId}
                moleState={activeMole ? activeMole.state : "hidden"}
                onWhack={handleWhack}
              />
            );
          }
          
          return (
            <div key={`empty-${index}`} className="relative w-32 h-32 md:w-32 md:h-32 mx-auto">
              <div className="absolute bottom-0 w-full h-32 bg-indigo-950/50 rounded-[100%] border-b-8 border-indigo-900 flex items-end justify-center z-10">
                <div className="w-24 h-12 bg-black/40 rounded-full mb-2 blur-sm"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Modal Overlay */}
      <AnimatePresence>
        {activeQuestionHole && (
          <QuestionModal
            key={activeQuestionHole.questionBase.id}
            question={activeQuestionHole.questionBase}
            timeLimit={config.timeLimit}
            onAnswer={handleAnswer}
            teamTurn={config.mode === "2Teams" ? activeTeamTurn : undefined}
            stars={stats.stars}
            onUseItem={(cost) => setStats(prev => ({ ...prev, stars: prev.stars - cost }))}
          />
        )}
      </AnimatePresence>

      {/* Progress Footer */}
      <div className="relative z-10 px-8 py-6 bg-[#0B0D17]/80 border-t border-indigo-400/30 flex justify-between items-center text-white">
        <div className="flex items-center gap-6">
          {config.mode === "Practice" ? (
            <span className="text-sm font-medium text-indigo-200">
              Đã làm: <span className="text-emerald-400 font-bold text-lg">{stats.correctAnswers + stats.wrongAnswers}</span> câu
              {" "}(Đúng: <span className="text-white font-bold">{stats.correctAnswers}</span>)
            </span>
          ) : (
            <>
              <div className="h-4 w-64 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${((stats.correctAnswers + stats.wrongAnswers) / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-indigo-200">Câu hỏi: <span className="text-white font-bold">{stats.correctAnswers + stats.wrongAnswers} / {questions.length}</span></span>
            </>
          )}
        </div>
      </div>

      {/* Pause Menu Modal */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e1b4b] border-[3px] border-indigo-400 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center"
            >
              <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-8 drop-shadow-md text-center">Đã Dừng</h2>
              
              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl py-4 rounded-xl border-b-4 border-indigo-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all"
                >
                  Tiếp Tục Chơi
                </button>
                <button
                  onClick={() => onEndGame(statsRef.current, config.mode === "2Teams" ? teamScoresRef.current : undefined)}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-xl py-4 rounded-xl border-b-4 border-red-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all mt-4"
                >
                  Kết Thúc & Xem Điểm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
