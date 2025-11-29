import React, { useEffect, useState } from 'react';
import { DialogueLine, Character } from '../types';
import CharacterAvatar from './CharacterAvatar';

interface DialogueOverlayProps {
  line: DialogueLine;
  onNext: () => void;
}

const characters: Record<string, Character> = {
  nova: { id: 'nova', name: '诺瓦指挥官', role: '星际舰队导师', color: 'text-cyan-300' },
  sparky: { id: 'sparky', name: '斯帕克 (Sparky)', role: 'AI 助手', color: 'text-yellow-300' },
  chaos: { id: 'chaos', name: '混沌博士', role: '反派首领', color: 'text-purple-400' },
};

const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ line, onNext }) => {
  const [visibleText, setVisibleText] = useState('');
  const char = characters[line.characterId];

  // Typewriter effect
  useEffect(() => {
    setVisibleText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < line.text.length) {
        setVisibleText(line.text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30); // Speed of typing

    return () => clearInterval(interval);
  }, [line]);

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center pb-8 sm:pb-20 bg-slate-900/60 backdrop-blur-sm px-4">
      <div 
        className="w-full max-w-3xl bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 shadow-[0_0_30px_rgba(8,145,178,0.4)] animate-slide-up cursor-pointer"
        onClick={onNext}
      >
        {/* Avatar Area */}
        <div className="flex-shrink-0 -mt-16 sm:mt-0 sm:-ml-10 transition-transform hover:scale-105">
          <CharacterAvatar id={line.characterId} size="lg" mood={line.mood} />
        </div>

        {/* Text Area */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-baseline mb-2 border-b border-slate-700 pb-1">
            <h3 className={`text-xl font-bold font-sci-fi ${char.color}`}>
              {char.name}
            </h3>
            <span className="text-xs text-slate-400 uppercase tracking-widest">{char.role}</span>
          </div>
          
          <p className="text-lg text-white leading-relaxed min-h-[3rem] font-sans">
            {visibleText}
            <span className="animate-pulse inline-block w-2 h-4 bg-cyan-400 ml-1 align-middle"></span>
          </p>
          
          <div className="mt-2 text-right">
             <span className="text-xs text-slate-500 animate-bounce">点击继续 ▶</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueOverlay;
