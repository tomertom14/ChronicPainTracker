import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PainService } from '../../core/services/pain.service';

const COMMON_LOCATIONS = [
  'Head', 'Neck', 'Shoulders', 'Upper Back', 'Lower Back',
  'Chest', 'Abdomen', 'Hips', 'Arms', 'Hands', 'Legs', 'Knees', 'Feet'
];

const COMMON_TYPES = [
  'Aching', 'Sharp', 'Burning', 'Throbbing', 'Stiff', 'Shooting', 'Tingling', 'Cramping'
];

@Component({
  selector: 'app-pain-log',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './pain-log.html'
})
export class PainLogComponent {
  commonLocations = COMMON_LOCATIONS;
  commonTypes = COMMON_TYPES;

  intensity = signal<number>(5);
  selectedLocations = signal<string[]>([]);
  newLocation = signal<string>('');
  painType = signal<string>('');
  medicationTaken = signal<string>('');
  trackSleep = signal<boolean>(false);
  sleepQuality = signal<number>(5);
  notes = signal<string>('');

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private painService: PainService,
    private router: Router,
    private translate: TranslateService
  ) {}

  toggleLocation(location: string): void {
    const current = this.selectedLocations();
    if (current.includes(location)) {
      this.selectedLocations.set(current.filter(l => l !== location));
    } else {
      this.selectedLocations.set([...current, location]);
    }
  }

  addCustomLocation(): void {
    const trimmed = this.newLocation().trim();
    if (trimmed && !this.selectedLocations().includes(trimmed)) {
      this.selectedLocations.update(list => [...list, trimmed]);
    }
    this.newLocation.set('');
  }

  selectType(type: string): void {
    this.painType.set(this.painType() === type ? '' : type);
  }

  submit(): void {
    if (this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.painService.createEntry({
      intensity: this.intensity(),
      bodyLocations: this.selectedLocations(),
      painType: this.painType(),
      medicationTaken: this.medicationTaken(),
      sleepQuality: this.trackSleep() ? this.sleepQuality() : null,
      notes: this.notes()
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/history']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set(this.translate.instant('PAIN.ERROR_ALERT'));
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/history']);
  }
}
