import React, { useState, useCallback, useEffect } from 'react';
import StarField from './components/StarField';
import Keypad from './components/Keypad';
import EnemyShip from './components/EnemyShip';
import DialogueOverlay from './components/DialogueOverlay';
import CharacterAvatar from './components/CharacterAvatar';
import { GameMode, GameState, Question, Enemy, DialogueLine } from './types';
import { getStoryDialogue, getAfterActionReport } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    mode: GameMode.MENU,
    score: 0,
    health: 100,
    maxHealth: 100,
    level: 1,
    questionsAnswered: [],
    currentQuestion: null,
    combo: 0,
    missionBriefing: '',
    currentDialogue: null,
    dialogueQueue: [],
  });

  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [isHit, setIsHit] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [laserVisible, setLaserVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Audio synthesis
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous speech to prevent overlapping queues
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // --- Dialogue Handling ---

  const playDialogue = useCallback((lines: DialogueLine[]) => {
    if (lines.length === 0) return;
    
    setState(prev => ({
      ...prev,
      mode: GameMode.STORY_DIALOGUE,
      dialogueQueue: lines.slice(1),
      currentDialogue: lines[0]
    }));
    // Speak the first line
    speak(lines[0].text);
  }, [speak]);

  const advanceDialogue = () => {
    if (state.dialogueQueue.length > 0) {
      const nextLine = state.dialogueQueue[0];
      setState(prev => ({
        ...prev,
        currentDialogue: nextLine,
        dialogueQueue: prev.dialogueQueue.slice(1)
      }));
      speak(nextLine.text);
    } else {
      // Dialogue finished, resume game or start specific phase
      setState(prev => ({
        ...prev,
        mode: GameMode.PLAYING,
        currentDialogue: null
      }));
    }
  };

  // --- Game Logic ---

  const generateQuestion = useCallback((): Question => {
    const max = 19;
    const min = 1; 
    
    let a = Math.floor(Math.random() * (max - min + 1)) + min;
    let b = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Harder questions for higher levels or bosses
    if (Math.random() > 0.4) {
      a = Math.floor(Math.random() * 9) + 11; // 11-19
      b = Math.floor(Math.random() * 9) + 11; // 11-19
    } else if (Math.random() > 0.5) {
       a = Math.floor(Math.random() * 19) + 1;
       b = Math.floor(Math.random() * 9) + 11;
    }

    return {
      factorA: a,
      factorB: b,
      answer: a * b,
    };
  }, []);

  const spawnEnemy = useCallback((level: number) => {
    const type = level % 5 === 0 ? 'boss' : (level % 3 === 0 ? 'battleship' : 'scout');
    
    let hp = 1;
    let color = '#4ade80';

    if (type === 'scout') { hp = 1; color = '#4ade80'; }
    if (type === 'battleship') { hp = 2; color = '#c084fc'; }
    if (type === 'boss') { hp = 5; color = '#f43f5e'; }

    setEnemy({
      id: Date.now().toString(),
      type,
      hp,
      maxHp: hp,
      color
    });
    return type; // Return type to check for events
  }, []);

  const startGame = async () => {
    setAiLoading(true);
    // Get Intro Dialogue
    const introLines = await getStoryDialogue('START', 1);
    setAiLoading(false);
    
    setState({
      mode: GameMode.MENU, // Will switch to dialogue immediately
      score: 0,
      health: 100,
      maxHealth: 100,
      level: 1,
      questionsAnswered: [],
      currentQuestion: generateQuestion(),
      combo: 0,
      missionBriefing: '',
      currentDialogue: null,
      dialogueQueue: []
    });
    
    spawnEnemy(1);
    setInputBuffer('');
    setFeedbackMessage('');
    playDialogue(introLines);
  };

  const handleInput = (num: number) => {
    if (inputBuffer.length < 4) {
      setInputBuffer(prev => prev + num.toString());
    }
  };

  const handleDelete = () => {
    setInputBuffer(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInputBuffer('');
  };

  const checkAnswer = async () => {
    if (!state.currentQuestion || !enemy) return;
    if (!inputBuffer) return;

    const val = parseInt(inputBuffer);
    if (isNaN(val)) return;

    const isCorrect = val === state.currentQuestion.answer;
    const newQuestion = { ...state.currentQuestion, userAnswer: val, isCorrect };
    const newHistory = [...state.questionsAnswered, newQuestion];

    if (isCorrect) {
      setLaserVisible(true);
      setTimeout(() => setLaserVisible(false), 400);
      setIsHit(true);
      setTimeout(() => setIsHit(false), 200);

      const newHp = enemy.hp - 1;
      let newScore = state.score + 10 + (state.combo * 2);
      
      if (newHp <= 0) {
        // Enemy Defeated
        newScore += 50;
        const newLevel = state.level + 1;
        const newEnemyType = spawnEnemy(newLevel);
        
        // Trigger Boss Dialogue if applicable
        if (newLevel % 5 === 0) {
             const bossLines = await getStoryDialogue('BOSS_APPROACH', newLevel);
             playDialogue(bossLines);
        }

        setState(prev => ({
           ...prev,
           score: newScore,
           level: newLevel,
           questionsAnswered: newHistory,
           currentQuestion: generateQuestion(),
           combo: prev.combo + 1
        }));
      } else {
        // Hit
        setEnemy(prev => prev ? { ...prev, hp: newHp } : null);
        setState(prev => ({
          ...prev,
          score: newScore,
          questionsAnswered: newHistory,
          currentQuestion: generateQuestion(),
          combo: prev.combo + 1
        }));
      }

    } else {
      // Wrong
      setIsPlayerHit(true);
      setTimeout(() => setIsPlayerHit(false), 500);
      
      const damage = 20;
      const newHealth = state.health - damage;

      if (newHealth <= 0) {
        endGame(state.score, newHistory);
      } else {
        setState(prev => ({
          ...prev,
          health: newHealth,
          questionsAnswered: newHistory,
          combo: 0
        }));
        setFeedbackMessage(`错误！${state.currentQuestion.factorA} x ${state.currentQuestion.factorB} = ${state.currentQuestion.answer}`);
        speak(`警报！正确答案是 ${state.currentQuestion.answer}`);
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    }
    
    setInputBuffer('');
  };

  const endGame = async (finalScore: number, history: Question[]) => {
    setState(prev => ({ ...prev, mode: GameMode.GAME_OVER, score: finalScore, questionsAnswered: history }));
    setAiLoading(true);
    const mistakes = history.filter(q => !q.isCorrect);
    const report = await getAfterActionReport(finalScore, mistakes);
    setAiLoading(false);
    setState(prev => ({ ...prev, missionBriefing: report }));
  };

  // --- Renders ---

  const renderHealthBar = () => (
    <div className="w-full max-w-md h-4 bg-slate-800 rounded-full border border-slate-600 mt-4 overflow-hidden relative shadow-lg">
      <div 
        className={`h-full transition-all duration-500 ${state.health < 30 ? 'bg-red-600' : 'bg-cyan-500'}`}
        style={{ width: `${(state.health / state.maxHealth) * 100}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-sci-fi tracking-widest text-white drop-shadow-md z-10">
        护盾完整度 (SHIELD) {state.health}%
      </span>
    </div>
  );

  if (state.mode === GameMode.MENU) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <StarField />
        <div className="z-10 text-center space-y-8 animate-fade-in flex flex-col items-center">
          <div className="flex gap-4 mb-4">
             <CharacterAvatar id="nova" size="sm" />
             <CharacterAvatar id="sparky" size="sm" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] font-sci-fi">
            银河学院: 19x19
          </h1>
          <p className="text-cyan-200 text-xl tracking-widest bg-slate-900/50 px-4 py-1 rounded-full">GALAXY MATH ACADEMY</p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto pt-8">
            <button
              onClick={() => startGame()}
              disabled={aiLoading}
              className="group relative px-8 py-6 bg-slate-800/80 hover:bg-fuchsia-900/80 rounded-xl border border-fuchsia-500/50 transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-[0_0_20px_rgba(192,132,252,0.3)] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-fuchsia-400/10 group-hover:bg-fuchsia-400/20 transition-colors"></div>
              <span className="relative text-3xl font-bold text-fuchsia-300">
                  {aiLoading ? "正在初始化..." : "新兵报到 (START)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Combine PLAYING and STORY_DIALOGUE for background persistence
  if (state.mode === GameMode.PLAYING || state.mode === GameMode.STORY_DIALOGUE) {
    return (
      <div className={`relative min-h-screen flex flex-col items-center p-4 overflow-hidden ${isPlayerHit ? 'shake bg-red-900/30' : ''}`}>
        <StarField />
        
        {/* Story Overlay */}
        {state.mode === GameMode.STORY_DIALOGUE && state.currentDialogue && (
           <DialogueOverlay line={state.currentDialogue} onNext={advanceDialogue} />
        )}

        {/* HUD Top */}
        <div className="z-10 w-full max-w-2xl flex justify-between items-start pt-2">
          <div className="bg-slate-800/60 backdrop-blur rounded-lg p-2 border border-slate-600 flex items-center gap-2">
            <div className="text-xs text-slate-400 font-sci-fi">SCORE</div>
            <div className="text-2xl text-yellow-400 font-mono">{state.score}</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-lg p-2 border border-slate-600 text-right flex items-center gap-2">
             <div className="text-2xl text-cyan-400 font-mono">{state.level}</div>
             <div className="text-xs text-slate-400 font-sci-fi">LEVEL</div>
          </div>
        </div>

        {/* Main Battle Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
          
          {/* Enemy Zone */}
          <div className="relative mb-6 mt-2 transition-all">
             {enemy && <EnemyShip enemy={enemy} isHit={isHit} />}
             
             {/* Player Laser Visual */}
             {laserVisible && (
                 <div className="absolute left-1/2 bottom-0 w-2 h-screen bg-cyan-400 shadow-[0_0_20px_#22d3ee] laser-beam -translate-x-1/2 z-20 pointer-events-none"></div>
             )}
          </div>

          {/* Feedback Overlay */}
          {feedbackMessage && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-red-600/90 text-white px-6 py-4 rounded-xl text-xl font-bold shadow-2xl animate-ping-once whitespace-nowrap border-2 border-red-400">
              {feedbackMessage}
            </div>
          )}

          {/* Question Display - Dim when dialogue is active */}
          <div className={`mb-4 flex flex-col items-center transition-opacity duration-300 ${state.mode === GameMode.STORY_DIALOGUE ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
            <div className="text-5xl md:text-7xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-mono tracking-wider">
               {state.currentQuestion?.factorA} <span className="text-cyan-400">×</span> {state.currentQuestion?.factorB}
            </div>
            <div className="text-4xl h-12 mt-2 font-mono text-yellow-300 min-w-[100px] text-center border-b-2 border-slate-600">
              {inputBuffer ? inputBuffer : <span className="animate-pulse text-white/30">?</span>}
            </div>
          </div>

          {/* Controls */}
          <div className={`${state.mode === GameMode.STORY_DIALOGUE ? 'pointer-events-none opacity-50' : ''}`}>
             <Keypad 
                onInput={handleInput} 
                onDelete={handleDelete} 
                onClear={handleClear}
                onSubmit={checkAnswer} 
                disabled={state.mode !== GameMode.PLAYING} 
            />
          </div>
          
          {renderHealthBar()}
        </div>
      </div>
    );
  }

  if (state.mode === GameMode.GAME_OVER) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <StarField />
        <div className="z-10 bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-600 shadow-2xl max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
             <CharacterAvatar id="nova" size="lg" mood="neutral" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mt-8 mb-2">任务终止</h2>
          
          <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl">
            <div>
              <div className="text-slate-400 text-sm font-sci-fi">SCORE</div>
              <div className="text-3xl text-yellow-400 font-bold">{state.score}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm font-sci-fi">LEVEL REACHED</div>
              <div className="text-3xl text-cyan-400 font-bold">{state.level}</div>
            </div>
          </div>

          <div className="bg-cyan-900/30 border border-cyan-500/30 p-4 rounded-xl text-left">
            <h3 className="text-cyan-300 font-bold mb-2 flex items-center text-sm uppercase tracking-widest">
               指挥官评估 (Report)
            </h3>
            {aiLoading ? (
              <div className="flex space-x-2 justify-center py-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
              </div>
            ) : (
              <p className="text-slate-200 text-sm leading-relaxed">
                {state.missionBriefing}
              </p>
            )}
          </div>

          <button
            onClick={() => setState(prev => ({ ...prev, mode: GameMode.MENU }))}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold text-xl shadow-lg transform transition active:scale-95 text-white"
          >
            返回基地 (Back to Base)
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
