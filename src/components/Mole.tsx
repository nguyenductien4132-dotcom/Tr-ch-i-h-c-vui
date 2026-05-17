import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rat, Zap, Bomb } from "lucide-react";

export type MoleState = "hidden" | "up" | "laughing" | "dead" | "boss";

interface MoleProps {
  key?: React.Key;
  id: number;
  moleState: MoleState;
  onWhack: (id: number) => void;
  bossMultiplier?: boolean;
}

export function Mole({ id, moleState, onWhack, bossMultiplier }: MoleProps) {
  const isVisible = moleState !== "hidden";
  
  return (
    <div className="relative w-32 h-32 md:w-32 md:h-32 mx-auto">
      {/* Hole Background */}
      <div className="absolute bottom-0 w-full h-32 bg-[#050510] rounded-[100%] flex items-end justify-center pointer-events-none z-0 shadow-[inset_0_5px_20px_rgba(0,0,0,0.9)]">
        <div className="w-24 h-12 bg-black/80 rounded-full mb-2 blur-[4px]"></div>
      </div>
      
      {/* Mole */}
      <div className="absolute bottom-4 -left-10 -right-10 h-[150%] overflow-hidden flex justify-center z-10 pointer-events-none">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ 
                y: moleState === "dead" ? "150%" : "20%",
                rotate: moleState === "laughing" ? [0, -10, 10, -10, 10, 0] : 0,
                scale: moleState === "boss" ? 1.1 : 1
              }}
              exit={{ y: "100%" }}
              transition={{ 
                y: { type: "spring", stiffness: 300, damping: 20 },
                scale: { type: "spring", stiffness: 300, damping: 20 },
                rotate: { type: "tween", duration: 0.5 }
              }}
              onClick={() => {
                if (moleState === "up" || moleState === "boss") onWhack(id);
              }}
              className={`cursor-pointer absolute bottom-0 flex flex-col items-center pointer-events-auto
                ${moleState === "boss" ? "drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" : ""}
              `}
              onMouseDown={(e) => e.preventDefault()} // prevent text selection on double click
            >
              <div className="relative pb-2"> {/* Reduce padding so mole sits lower into the hole curve */}
                {moleState === "dead" ? (
                   <Bomb className="w-16 h-16 md:w-20 md:h-20 text-orange-500 animate-pulse relative z-30" />
                ) : (
                  <>
                    {moleState === "boss" && (
                      <Zap className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 fill-yellow-400 animate-bounce z-40 pointer-events-none" />
                    )}
                    {/* New Cute Mouse Body from request */}
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-t-[45%] rounded-b-[40%] bg-[#9ca3af] flex flex-col items-center pt-5 md:pt-6 relative z-20 shadow-[0_5px_15px_rgba(0,0,0,0.25)]">

                      
                      {/* Left Ear */}
                      <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-16 h-16 md:w-20 md:h-20 bg-[#9ca3af] rounded-full flex items-center justify-center -z-10 shadow-sm">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#f4cad6] rounded-full"></div>
                      </div>
                      
                      {/* Right Ear */}
                      <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-16 h-16 md:w-20 md:h-20 bg-[#9ca3af] rounded-full flex items-center justify-center -z-10 shadow-sm">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#f4cad6] rounded-full"></div>
                      </div>

                      {/* Eyes */}
                      <div className="flex gap-4 md:gap-5 mt-2 md:mt-3 z-30">
                        <div className="w-10 h-10 md:w-[44px] md:h-[44px] bg-white rounded-full flex justify-center items-center shadow-sm">
                          <div className="w-[22px] h-[22px] md:w-6 md:h-6 bg-[#004b87] rounded-full flex justify-center items-start pt-[3px] md:pt-1">
                            <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                          </div>
                        </div>
                        <div className="w-10 h-10 md:w-[44px] md:h-[44px] bg-white rounded-full flex justify-center items-center shadow-sm">
                          <div className="w-[22px] h-[22px] md:w-6 md:h-6 bg-[#004b87] rounded-full flex justify-center items-start pt-[3px] md:pt-1">
                            <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Whiskers Left */}
                      <div className="absolute left-[4px] md:left-[8px] top-[74px] md:top-[82px] w-[32px] md:w-[38px] h-[1.5px] bg-[#4b5563] -rotate-[10deg] rounded-full"></div>
                      <div className="absolute left-[8px] md:left-[12px] top-[86px] md:top-[96px] w-[28px] md:w-[32px] h-[1.5px] bg-[#4b5563] rotate-[5deg] rounded-full"></div>
                      
                      {/* Whiskers Right */}
                      <div className="absolute right-[4px] md:right-[8px] top-[74px] md:top-[82px] w-[32px] md:w-[38px] h-[1.5px] bg-[#4b5563] rotate-[10deg] rounded-full"></div>
                      <div className="absolute right-[8px] md:right-[12px] top-[86px] md:top-[96px] w-[28px] md:w-[32px] h-[1.5px] bg-[#4b5563] -rotate-[5deg] rounded-full"></div>

                      <div className="w-full flex justify-center mt-2 relative z-30">
                        {/* Nose */}
                        <div className="w-12 h-7 md:w-[48px] md:h-[28px] bg-[#ff8eb4] rounded-[50%] flex justify-center items-center gap-1 shadow-inner absolute top-0 z-30">
                           <div className="w-[2px] h-2.5 bg-[#d7507f] rounded-full -rotate-[25deg]"></div>
                           <div className="w-[2px] h-2.5 bg-[#d7507f] rounded-full rotate-[25deg]"></div>
                        </div>
                      </div>

                      <div className="w-full flex flex-col items-center z-20 mt-[26px] md:mt-[27px] relative">
                        {/* Line under nose */}
                        <div className="w-[1.5px] h-3.5 bg-[#4b5563] z-20 relative"></div>
                        
                        {/* Smile SVG & Teeth */}
                        <div className="relative flex justify-center w-full z-20 h-6">
                          <svg width="60" height="20" className="absolute -top-[16px] z-20" viewBox="0 0 60 20" fill="none">
                             <path d="M2 1 Q30 18 58 1" stroke="#4b5563" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                             {/* Dimples */}
                             <path d="M2 1 Q2 5 5 7" stroke="#4b5563" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                             <path d="M58 1 Q58 5 55 7" stroke="#4b5563" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>

                          {/* Teeth */}
                          <div className="absolute -top-[1px] flex gap-[1px] z-10">
                            <div className="w-[12px] h-[14px] bg-white border-[1px] border-[#4b5563] rounded-b-[2px]"></div>
                            <div className="w-[12px] h-[14px] bg-white border-[1px] border-[#4b5563] rounded-b-[2px]"></div>
                          </div>
                        </div>
                      </div>

                      {moleState === "laughing" && (
                        <div className="absolute top-10 flex gap-2">
                          <span className="text-xl -mt-6 ml-16 text-white font-black drop-shadow-md animate-bounce">Ha!</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Hole Front Lip */}
      <div className="absolute bottom-0 w-full h-32 rounded-[100%] border-b-8 border-indigo-900 pointer-events-none z-20 shadow-[0_5px_10px_rgba(0,0,0,0.5)]"></div>
    </div>
  );
}
