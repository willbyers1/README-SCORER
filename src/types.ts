export interface Section {
  title: string;
  content: string;
  level: number;
}

export interface ScoreDetail {
  name: string;
  score: number;
  maxScore: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export interface ScoreReport {
  fileSize: number;
  totalScore: number;
  details: ScoreDetail[];
  suggestions: string[];
}
