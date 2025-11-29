import React from 'react';
import { CharacterId } from '../types';

interface CharacterAvatarProps {
  id: CharacterId;
  size?: 'sm' | 'lg';
  mood?: string;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ id, size = 'lg', mood }) => {
  const pixelSize = size === 'lg' ? 120 : 60;
  
  const getAvatarContent = () => {
    switch (id) {
      case 'nova': // The Commander
        return (
          <g>
            <defs>
              <linearGradient id="novaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>
            {/* Helmet/Head */}
            <path d="M20 20 Q50 0 80 20 V60 Q50 80 20 60 Z" fill="url(#novaGrad)" stroke="#60a5fa" strokeWidth="2" />
            {/* Visor */}
            <path d="M25 30 Q50 40 75 30 V45 Q50 55 25 45 Z" fill="#22d3ee" className="animate-pulse" opacity="0.8" />
            {/* Body */}
            <path d="M10 90 Q50 110 90 90 L100 120 H0 Z" fill="#1e40af" />
            <circle cx="15" cy="35" r="3" fill="#fbbf24" /> {/* Mic */}
          </g>
        );
      case 'sparky': // The Robot Sidekick
        return (
          <g className="animate-bounce">
             <defs>
              <radialGradient id="sparkyBody" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>
            {/* Antenna */}
            <line x1="50" y1="20" x2="50" y2="5" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="50" cy="5" r="4" fill="#ef4444" className="animate-ping" />
            {/* Body */}
            <circle cx="50" cy="50" r="30" fill="url(#sparkyBody)" stroke="#fff" strokeWidth="2" />
            {/* Eye Screen */}
            <rect x="35" y="40" width="30" height="20" rx="5" fill="#000" />
            {/* Eyes */}
            <circle cx="42" cy="50" r="3" fill="#4ade80" />
            <circle cx="58" cy="50" r="3" fill="#4ade80" />
            {/* Arms */}
            <path d="M20 50 Q10 50 20 70" stroke="#94a3b8" strokeWidth="3" fill="none" />
            <path d="M80 50 Q90 50 80 70" stroke="#94a3b8" strokeWidth="3" fill="none" />
          </g>
        );
      case 'chaos': // The Villain
        return (
          <g>
             <defs>
              <linearGradient id="chaosGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#000" />
              </linearGradient>
            </defs>
            {/* Spiky Head */}
            <path d="M20 40 L30 10 L50 30 L70 10 L80 40 L90 20 L90 80 Q50 100 10 80 L10 20 Z" fill="url(#chaosGrad)" stroke="#a855f7" strokeWidth="2" />
            {/* Evil Eyes */}
            <path d="M30 50 L45 60 L30 60 Z" fill="#f43f5e" />
            <path d="M70 50 L55 60 L70 60 Z" fill="#f43f5e" />
            {/* Grin */}
            <path d="M35 75 Q50 85 65 75" stroke="#f43f5e" strokeWidth="2" fill="none" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative flex items-center justify-center rounded-full border-4 ${id === 'chaos' ? 'border-purple-600 bg-purple-900/50' : (id === 'sparky' ? 'border-yellow-400 bg-yellow-900/50' : 'border-cyan-500 bg-blue-900/50')} shadow-lg overflow-hidden`} style={{ width: pixelSize, height: pixelSize }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {getAvatarContent()}
      </svg>
    </div>
  );
};

export default CharacterAvatar;
