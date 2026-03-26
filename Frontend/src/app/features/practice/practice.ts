import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface EmotionRate {
  name: string;
  intensity: number;
}

interface EmotionAnswers {
  when: string;
  whoWhat: string;
  whereInBody: string;
  physicalSensation: string;
  duration: string;
}

interface EmotionDetail {
  emotion: EmotionRate;
  answers: EmotionAnswers;
}

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './practice.html',
  styleUrls: ['./practice.css']
})
export class PracticeComponent {
  // State Signals
  currentStep = signal<number>(1);
  isSaving = signal<boolean>(false);
  isReleasing = signal<boolean>(false);
  newEmotion = signal<string>('');

  // Computed Signal for progress bar
  progressWidth = computed(() => (this.currentStep() / 3) * 100);

  // Data Signals
  emotionsList = signal<EmotionRate[]>([
    { name: 'Anger', intensity: 0 },
    { name: 'Sadness', intensity: 0 },
    { name: 'Insult', intensity: 0 },
    { name: 'Rage', intensity: 0 },
    { name: 'Frustration', intensity: 0 },
    { name: 'Anxiety', intensity: 0 },
    { name: 'Fear', intensity: 0 },
    { name: 'Despair', intensity: 0 },
    { name: 'Disappointment', intensity: 0 },
    { name: 'Joy', intensity: 0 },
    { name: 'Happiness', intensity: 0 },
    { name: 'Satisfaction', intensity: 0 },
    { name: 'Relief', intensity: 0 },
    { name: 'Calmness', intensity: 0 }
  ]);

  emotionDetails = signal<EmotionDetail[]>([]);

  constructor(private router: Router, private http: HttpClient, private translate: TranslateService) {}

  getEmotionName(name: string): string {
    const key = `EMOTIONS.${name}`;
    const translatedKey = this.translate.instant(key);
    return translatedKey === key ? name : translatedKey;
  }

  addCustomEmotion(): void {
    const trimmed = this.newEmotion().trim();
    if (trimmed) {
      const exists = this.emotionsList().find(e => e.name.toLowerCase() === trimmed.toLowerCase());
      if (!exists) {
        // Using update to unshift to the array signal
        this.emotionsList.update(list => [{ name: trimmed, intensity: 0 }, ...list]);
      }
      this.newEmotion.set('');
    }
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      const activeEmotions = this.emotionsList().filter(e => Number(e.intensity) > 0);
      
      if (activeEmotions.length === 0) {
        alert(this.translate.instant('PRACTICE.RATE_ALERT'));
        return;
      }

      const sortedEmotions = activeEmotions.sort((a, b) => Number(b.intensity) - Number(a.intensity));
      const topEmotions = sortedEmotions.slice(0, 3);
      
      this.emotionDetails.set(topEmotions.map(e => ({
        emotion: e,
        answers: { when: '', whoWhat: '', whereInBody: '', physicalSensation: '', duration: '' }
      })));
      
      this.currentStep.update(s => s + 1);
    } 
    else if (this.currentStep() === 2) {
      this.currentStep.update(s => s + 1);
    }
    else if (this.currentStep() === 3) {
      this.finishAndSave();
    }
  }

  prevStep(): void {
    this.currentStep.update(s => s - 1);
  }

  cancelPractice(): void {
    const hasInput = this.emotionsList().some(e => Number(e.intensity) > 0);
    if (hasInput) {
      if (confirm(this.translate.instant('PRACTICE.CANCEL_ALERT'))) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  finishAndSave(): void {
    if (this.isSaving()) return;

    this.isSaving.set(true);
    this.isReleasing.set(true);

    const allRatedEmotions = this.emotionsList()
      .filter(e => Number(e.intensity) > 0)
      .map(e => {
        const details = this.emotionDetails().find(d => d.emotion.name === e.name);
        return {
          name: e.name,
          intensity: Number(e.intensity),
          when: details?.answers.when || '',
          whoWhat: details?.answers.whoWhat || '',
          whereInBody: details?.answers.whereInBody || '',
          physicalSensation: details?.answers.physicalSensation || '',
          duration: details?.answers.duration || ''
        };
      });

    const payload = { allEmotions: allRatedEmotions };
    const apiUrl = `${environment.apiUrl}/practice`; 
    const token = localStorage.getItem('jwt_token'); 

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const minimumAnimationTime = new Promise(resolve => setTimeout(resolve, 3500));

    const saveToServer = new Promise((resolve, reject) => {
      this.http.post(apiUrl, payload, { headers }).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });

    Promise.all([saveToServer, minimumAnimationTime])
      .then(() => {
        this.isSaving.set(false);
        this.isReleasing.set(false);
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.error('Error saving practice:', error);
        this.isSaving.set(false);
        this.isReleasing.set(false);
        alert(this.translate.instant('PRACTICE.ERROR_ALERT'));
      });
  }
}