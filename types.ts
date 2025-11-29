export enum GameMode {
  MENU = 'MENU',
  STORY_DIALOGUE = 'STORY_DIALOGUE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export type CharacterId = 'nova' | 'sparky' | 'chaos';

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  color: string;
}

export interface DialogueLine {
  characterId: CharacterId;
  text: string;
  mood?: 'neutral' | 'happy' | 'angry' | 'worried';
}

export interface Question {
  factorA: number;
  factorB: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface GameState {
  mode: GameMode;
  score: number;
  health: number;
  maxHealth: number;
  level: number;
  questionsAnswered: Question[];
  currentQuestion: Question | null;
  combo: number;
  missionBriefing: string;
  currentDialogue: DialogueLine | null;
  dialogueQueue: DialogueLine[];
}

export interface Enemy {
  id: string;
  type: 'scout' | 'battleship' | 'boss';
  hp: number;
  maxHp: number;
  color: string;
}
