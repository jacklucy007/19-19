import React from 'react';
import { Enemy } from '../types';

interface EnemyShipProps {
  enemy: Enemy;
  isHit: boolean;
}

const EnemyShip: React.FC<EnemyShipProps> = ({ enemy, isHit }) => {
  // Simple CSS shapes for aliens
  return (
    <div className={`relative transition-transform duration-200 ${isHit ? 'shake brightness-150' : 'animate-bounce'}`}>
      <div className="w-32 h-32 sm:w-48 sm:h-48 relative flex items-center justify-center">
        {/* Glow effect */}
        <div className={`absolute inset-0 blur-xl opacity-50 rounded-full ${enemy.type === 'boss' ? 'bg-red-500' : 'bg-purple-500'}`}></div>
        
        {/* The Ship Body (SVG) */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl filter">
          <defs>
            <linearGradient id="alienGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={enemy.color} />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>
          
          {enemy.type === 'scout' && (
             <g fill="url(#alienGrad)">
                <path d="M50 20 L80 50 L50 90 L20 50 Z" stroke="white" strokeWidth="2" />
                <circle cx="50" cy="50" r="10" fill="#a5f3fc" className="animate-pulse" />
                <path d="M20 50 L10 40 M80 50 L90 40" stroke={enemy.color} strokeWidth="3" />
             </g>
          )}

          {enemy.type === 'battleship' && (
             <g fill="url(#alienGrad)">
                <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="2" />
                <path d="M15 50 L5 60 M85 50 L95 60 M50 85 L50 95" stroke={enemy.color} strokeWidth="4" />
                <rect x="35" y="40" width="30" height="20" rx="5" fill="#a5f3fc" className="animate-pulse" />
                <circle cx="25" cy="30" r="5" fill="#f43f5e" />
                <circle cx="75" cy="30" r="5" fill="#f43f5e" />
             </g>
          )}

           {enemy.type === 'boss' && (
             <g fill="url(#alienGrad)">
                <path d="M20 30 Q50 0 80 30 L90 60 Q50 100 10 60 Z" stroke="white" strokeWidth="3" />
                <circle cx="50" cy="50" r="15" fill="#fbbf24" className="animate-pulse" />
                <path d="M10 60 L0 80 M90 60 L100 80" stroke="#f43f5e" strokeWidth="5" />
                <path d="M30 30 L40 40 M70 30 L60 40" stroke="black" strokeWidth="3" />
             </g>
          )}
        </svg>

        {/* Health Bar */}
        <div className="absolute -bottom-4 w-full h-3 bg-slate-700 rounded-full border border-slate-500 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${enemy.hp / enemy.maxHp < 0.3 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnemyShip;
