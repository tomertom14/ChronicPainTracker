import { Component, Input } from '@angular/core';

/**
 * The app's signature decorative mark: an organic blob run through an SVG
 * turbulence filter so its edge reads as ink diffusing in water, rather
 * than a crisp geometric shape. Breathes on a slow, ambient pulse.
 *
 * `blotId` must be a unique, static string per usage site (not generated
 * at runtime) so the SVG filter id is stable across SSR and hydration.
 */
@Component({
  selector: 'app-ink-blot',
  standalone: true,
  template: `
    <svg viewBox="0 0 200 200" class="w-full h-full animate-breathe" [style.animation-delay]="delay" aria-hidden="true" focusable="false">
      <defs>
        <filter [attr.id]="filterId" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="noise"></feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="16"></feDisplacementMap>
        </filter>
      </defs>
      <path
        [attr.filter]="'url(#' + filterId + ')'"
        transform="translate(100 100)"
        fill="currentColor"
        d="M39.5,-51.6C50.6,-45.2,58.4,-32.6,62.7,-18.6C67,-4.6,67.8,10.8,62.5,23.8C57.2,36.8,45.8,47.4,32.7,54.6C19.6,61.8,4.8,65.6,-10.9,65.9C-26.6,66.2,-43.2,63,-54.4,52.9C-65.6,42.8,-71.4,25.8,-72.6,8.6C-73.8,-8.6,-70.4,-26,-60.7,-38.7C-51,-51.4,-35,-59.4,-19.4,-63.6C-3.8,-67.8,11.4,-68.2,24.8,-63.4C38.2,-58.6,49.8,-48.6,39.5,-51.6Z">
      </path>
    </svg>
  `
})
export class InkBlotComponent {
  @Input() blotId = 'blot';
  @Input() delay = '0s';

  get filterId(): string {
    return `ink-blot-filter-${this.blotId}`;
  }
}
