import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PracticeService } from '../../core/services/practice.service';
import { PainService } from '../../core/services/pain.service';
import { PracticeInsights, PracticeSessionResponse } from '../../core/models/practice.models';
import { PainInsights, PainEntryResponse } from '../../core/models/pain.models';

type Tab = 'practice' | 'pain';

interface TrendChart {
  points: string;
  areaPoints: string;
  labels: { x: number; label: string }[];
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './history.html'
})
export class HistoryComponent implements OnInit {
  activeTab = signal<Tab>('practice');

  loadingPractice = signal(true);
  loadingPain = signal(true);

  practiceSessions = signal<PracticeSessionResponse[]>([]);
  practiceInsights = signal<PracticeInsights | null>(null);
  painEntries = signal<PainEntryResponse[]>([]);
  painInsights = signal<PainInsights | null>(null);

  expandedSessionId = signal<number | null>(null);
  expandedPainId = signal<number | null>(null);

  practiceChart = computed<TrendChart | null>(() => this.buildChart(this.practiceInsights()?.intensityTrend ?? []));
  painChart = computed<TrendChart | null>(() => this.buildChart(this.painInsights()?.intensityTrend ?? []));

  constructor(
    private practiceService: PracticeService,
    private painService: PainService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.practiceService.getSessions().subscribe({
      next: (sessions) => this.practiceSessions.set(sessions),
      error: () => this.practiceSessions.set([])
    });

    this.practiceService.getInsights().subscribe({
      next: (insights) => {
        this.practiceInsights.set(insights);
        this.loadingPractice.set(false);
      },
      error: () => this.loadingPractice.set(false)
    });

    this.painService.getEntries().subscribe({
      next: (entries) => this.painEntries.set(entries),
      error: () => this.painEntries.set([])
    });

    this.painService.getInsights().subscribe({
      next: (insights) => {
        this.painInsights.set(insights);
        this.loadingPain.set(false);
      },
      error: () => this.loadingPain.set(false)
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  toggleSession(id: number): void {
    this.expandedSessionId.set(this.expandedSessionId() === id ? null : id);
  }

  togglePainEntry(id: number): void {
    this.expandedPainId.set(this.expandedPainId() === id ? null : id);
  }

  topEmotionsFor(session: PracticeSessionResponse): string {
    return session.emotions
      .slice()
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3)
      .map(e => `${this.getEmotionName(e.emotionName)} (${e.intensity})`)
      .join(' · ');
  }

  getEmotionName(name: string): string {
    const key = `EMOTIONS.${name}`;
    const translated = this.translate.instant(key);
    return translated === key ? name : translated;
  }

  formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  private buildChart(trend: { date: string; averageIntensity: number }[]): TrendChart | null {
    if (trend.length === 0) return null;

    const width = 100;
    const height = 32;
    const maxIntensity = 10;

    if (trend.length === 1) {
      const y = height - (trend[0].averageIntensity / maxIntensity) * height;
      const points = `0,${y.toFixed(1)} ${width},${y.toFixed(1)}`;
      return {
        points,
        areaPoints: `0,${height} ${points} ${width},${height}`,
        labels: [{ x: 0, label: this.formatDate(trend[0].date) }]
      };
    }

    const step = width / (trend.length - 1);
    const coords = trend.map((point, i) => {
      const x = i * step;
      const y = height - (point.averageIntensity / maxIntensity) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const points = coords.join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    const labels = [
      { x: 0, label: this.formatDate(trend[0].date) },
      { x: width, label: this.formatDate(trend[trend.length - 1].date) }
    ];

    return { points, areaPoints, labels };
  }
}
