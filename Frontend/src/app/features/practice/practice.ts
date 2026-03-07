import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './practice.html',
  styleUrls: ['./practice.css']
})
export class PracticeComponent {
  currentStep: number = 1;
  isSaving: boolean = false;
  isReleasing: boolean = false;

  emotionsList: EmotionRate[] = [
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
  ];

  newEmotion: string = '';
  emotionDetails: EmotionDetail[] = []; 

  // Injected HttpClient here
  constructor(private router: Router, private http: HttpClient) {}

  addCustomEmotion(): void {
    const trimmed = this.newEmotion.trim();
    if (trimmed) {
      const exists = this.emotionsList.find(e => e.name.toLowerCase() === trimmed.toLowerCase());
      if (!exists) {
        this.emotionsList.unshift({ name: trimmed, intensity: 0 });
      }
      this.newEmotion = '';
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const activeEmotions = this.emotionsList.filter(e => Number(e.intensity) > 0);
      
      if (activeEmotions.length === 0) {
        alert('Please rate at least 1 emotion.');
        return;
      }

      const sortedEmotions = activeEmotions.sort((a, b) => Number(b.intensity) - Number(a.intensity));
      const topEmotions = sortedEmotions.slice(0, 3);
      
      this.emotionDetails = topEmotions.map(e => ({
        emotion: e,
        answers: { when: '', whoWhat: '', whereInBody: '', physicalSensation: '', duration: '' }
      }));
      this.currentStep++;
    } 
    else if (this.currentStep === 2) {
      this.currentStep++;
    }
    else if (this.currentStep === 3) {
      this.finishAndSave();
    }
  }

  prevStep(): void {
    this.currentStep--;
  }

  cancelPractice(): void {
    const hasInput = this.emotionsList.some(e => Number(e.intensity) > 0);
    if (hasInput) {
      if (confirm('Cancel and lose progress?')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

finishAndSave(): void {
    if (this.isSaving) return;

    // Lock the button and start the full-screen release animation
    this.isSaving = true;
    this.isReleasing = true;

    const allRatedEmotions = this.emotionsList
      .filter(e => Number(e.intensity) > 0)
      .map(e => {
        const details = this.emotionDetails.find(d => d.emotion.name === e.name);
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

    // 1. Create a promise that just waits for 3.5 seconds (for the animation to play)
    const minimumAnimationTime = new Promise(resolve => setTimeout(resolve, 3500));

    // 2. Create a promise for the actual HTTP call to C#
    const saveToServer = new Promise((resolve, reject) => {
      this.http.post(apiUrl, payload, { headers }).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });

    // 3. Wait for BOTH the animation time AND the server response to finish
    Promise.all([saveToServer, minimumAnimationTime])
      .then(() => {
        console.log('Practice silently saved to DB and animation completed.');
        this.isSaving = false;
        this.isReleasing = false;
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.error('Error saving practice:', error);
        this.isSaving = false;
        this.isReleasing = false;
        alert('There was a slight problem releasing your practice. Please try again.');
      });
  }
}