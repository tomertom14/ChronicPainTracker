import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  // We now have 3 steps: 1(Select), 2(Questions), 3(Cleansing)
  currentStep: number = 1;

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

  constructor(private router: Router) {}

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
      // Move to the final Cleansing step
      this.currentStep++;
    }
    else if (this.currentStep === 3) {
      // Finalize and save!
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
    // Here we will eventually call the C# API to save to PostgreSQL
    console.log('Data ready to save:', this.emotionDetails);
    
    // For now, just alert and go back to dashboard
    alert('Practice complete! Your emotions have been processed and saved.');
    this.router.navigate(['/dashboard']);
  }
}