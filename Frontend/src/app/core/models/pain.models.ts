export interface PainEntryCreate {
  intensity: number;
  bodyLocations: string[];
  painType?: string;
  medicationTaken?: string;
  sleepQuality?: number | null;
  notes?: string;
}

export interface PainEntryResponse {
  id: number;
  createdAt: string;
  intensity: number;
  bodyLocations: string[];
  painType: string;
  medicationTaken: string;
  sleepQuality: number | null;
  notes: string;
}

export interface BodyLocationFrequency {
  name: string;
  count: number;
}

export interface IntensityTrendPoint {
  date: string;
  averageIntensity: number;
  sessionCount: number;
}

export interface PainInsights {
  totalEntries: number;
  topLocations: BodyLocationFrequency[];
  intensityTrend: IntensityTrendPoint[];
}
