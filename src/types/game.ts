
export interface Question {
  id: number;
  category: string;
  points: number;
  question: string;
  answer: string;
  bonusPoints?: number;
  imageUrl?: string;
  videoUrl?: string;
  mediaAssignment?: 'question' | 'answer' | 'both'; // New field to specify where media appears
}

export interface Player {
  id: number;
  name: string;
  score: number;
  avatar?: string;
}

export interface CategoryDescription {
  category: string;
  description: string;
}

export interface GameData {
  players: Player[];
  questions: Question[];
  answeredQuestions: number[];
  categoryDescriptions: CategoryDescription[];
}
