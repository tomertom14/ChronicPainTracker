export interface EmotionEntryResponse {
  id: number;
  emotionName: string;
  intensity: number;
  whenOccurred: string;
  regardingWhoWhat: string;
  bodyLocation: string;
  physicalSensation: string;
  duration: string;
}

export interface PracticeSessionResponse {
  id: number;
  createdAt: string;
  emotions: EmotionEntryResponse[];
}

export interface EmotionFrequency {
  name: string;
  count: number;
  averageIntensity: number;
}

export interface IntensityTrendPoint {
  date: string;
  averageIntensity: number;
  sessionCount: number;
}

export interface PracticeInsights {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticedAt: string | null;
  topEmotions: EmotionFrequency[];
  intensityTrend: IntensityTrendPoint[];
}
