import { Component, Input } from '@angular/core';

export type ArtVariant = 'hills' | 'sea' | 'reef' | 'dunes' | 'dusk';

interface ArtSpec {
  base: [string, string];
  sky: string | null;
  freq: string;
  scale: number;
  light: string;
  grid: boolean;
}

const SPECS: Record<ArtVariant, ArtSpec> = {
  hills: { base: ['#2f5a24', '#86a84a'], sky: '#b7c1c3', freq: '0.006 0.028', scale: 9, light: '#f4f7e8', grid: false },
  sea: { base: ['#1f6f73', '#a8d2c8'], sky: '#c3c9cc', freq: '0.003 0.06', scale: 5, light: '#f2fbff', grid: false },
  reef: { base: ['#d8c23c', '#1d4fd6'], sky: null, freq: '0.045 0.03', scale: 7, light: '#ffffff', grid: true },
  dunes: { base: ['#b8612b', '#f1c48b'], sky: '#e9d8c6', freq: '0.004 0.018', scale: 8, light: '#fff6ea', grid: false },
  dusk: { base: ['#3a2c7a', '#d58bb7'], sky: '#c9b8d9', freq: '0.01 0.02', scale: 6, light: '#fff2fb', grid: false },
};

let nextId = 0;

/**
 * Procedural "photograph" — an organic, lit texture generated with SVG
 * turbulence + diffuse lighting, so tiles read like the landscape photos in
 * the reference design without shipping any image files.
 */
@Component({
  selector: 'sb-art',
  standalone: true,
  template: `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" class="art" aria-hidden="true">
      <defs>
        <linearGradient [attr.id]="baseId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" [attr.stop-color]="spec.base[0]" />
          <stop offset="100%" [attr.stop-color]="spec.base[1]" />
        </linearGradient>
        <linearGradient [attr.id]="skyId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="spec.sky ?? '#ffffff'" stop-opacity="1" />
          <stop offset="55%" [attr.stop-color]="spec.sky ?? '#ffffff'" stop-opacity="0" />
        </linearGradient>
        <linearGradient [attr.id]="shadeId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="45%" stop-color="#000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000" stop-opacity="0.45" />
        </linearGradient>
        <filter [attr.id]="filterId" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" [attr.baseFrequency]="spec.freq" numOctaves="5" [attr.seed]="seed" result="noise" />
          <feDiffuseLighting in="noise" [attr.lighting-color]="spec.light" [attr.surfaceScale]="spec.scale" result="lit">
            <feDistantLight azimuth="225" elevation="38" />
          </feDiffuseLighting>
          <feBlend in="SourceGraphic" in2="lit" mode="multiply" />
        </filter>
        <pattern [attr.id]="gridId" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0H0V14" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.6" />
        </pattern>
      </defs>
      <rect width="200" height="200" [attr.fill]="'url(#' + baseId + ')'" [attr.filter]="'url(#' + filterId + ')'" />
      @if (spec.sky) {
        <rect width="200" height="200" [attr.fill]="'url(#' + skyId + ')'" />
      }
      @if (spec.grid) {
        <rect width="200" height="200" [attr.fill]="'url(#' + gridId + ')'" />
      }
      @if (shade) {
        <rect width="200" height="200" [attr.fill]="'url(#' + shadeId + ')'" />
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
        overflow: hidden;
      }
      .art {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class ArtTileComponent {
  @Input() variant: ArtVariant = 'hills';
  @Input() seed = 3;
  /** Darken the bottom so white caption text stays legible. */
  @Input() shade = false;

  private readonly uid = nextId++;
  readonly baseId = `sb-art-base-${this.uid}`;
  readonly skyId = `sb-art-sky-${this.uid}`;
  readonly shadeId = `sb-art-shade-${this.uid}`;
  readonly filterId = `sb-art-filter-${this.uid}`;
  readonly gridId = `sb-art-grid-${this.uid}`;

  get spec(): ArtSpec {
    return SPECS[this.variant] ?? SPECS.hills;
  }
}
