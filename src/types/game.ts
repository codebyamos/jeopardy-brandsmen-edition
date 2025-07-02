
export interface Question {
  id: number;
  category: string;
  points: number;
  question: string;
  answer: string;
}

export interface Player {
  id: number;
  name: string;
  score: number;
}
