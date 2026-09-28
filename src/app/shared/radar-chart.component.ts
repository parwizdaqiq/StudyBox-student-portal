import { Component, Input } from '@angular/core';

export interface RadarAxis {
  label: string;
  value: number; // 0-100
}

let nextId = 0;

/**
 * Hexagonal radar chart in the reference style: a soft electric-blue
 * radial-gradient body with a crisp navy outline, thin axes that end in
 * arrowheads past the data, a faint dotted outer guide, and plain labels at
 * the axis tips. Pure inline SVG — no chart library.
 */
@Component({
  selector: 'sb-radar-chart',
  standalone: true,
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart" role="img" [attr.aria-label]="ariaLabel">
      <defs>
        <radialGradient [attr.id]="gradId" cx="52%" cy="58%" r="62%">
          <stop offset="0%" stop-color="#1f5bff" />
          <stop offset="38%" stop-color="#2f8dff" />
          <stop offset="72%" stop-color="#a9dcff" />
          <stop offset="100%" stop-color="#eef8ff" />
        </radialGradient>
        <filter [attr.id]="blurId" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath [attr.id]="clipId">
          <polygon [attr.points]="dataPoints()" />
        </clipPath>
        <marker [attr.id]="arrowId" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1.5 L9 5 L0 8.5 z" fill="var(--primary)" />
        </marker>
      </defs>

      <!-- faint dotted outer guide -->
      <polygon [attr.points]="ringPoints(1)" fill="none" stroke="#cfd0d8" stroke-width="1" stroke-dasharray="2 4" />

      <!-- gradient body, blurred inside the data shape -->
      <g [attr.clip-path]="'url(#' + clipId + ')'">
        <polygon [attr.points]="dataPoints()" [attr.fill]="'url(#' + gradId + ')'" [attr.filter]="'url(#' + blurId + ')'" />
      </g>

      <!-- axes with arrowheads -->
      @for (axis of axes; track axis.label; let i = $index) {
        <line
          [attr.x1]="vertex(i, fractionFor(axis.value)).x"
          [attr.y1]="vertex(i, fractionFor(axis.value)).y"
          [attr.x2]="vertex(i, 1.08).x"
          [attr.y2]="vertex(i, 1.08).y"
          stroke="var(--primary)"
          stroke-width="1.4"
          [attr.marker-end]="'url(#' + arrowId + ')'"
        />
      }

      <!-- navy outline -->
      <polygon [attr.points]="dataPoints()" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linejoin="round" />

      @for (axis of axes; track axis.label; let i = $index) {
        <text
          [attr.x]="labelPos(i).x"
          [attr.y]="labelPos(i).y"
          [attr.text-anchor]="labelAnchor(i)"
          dominant-baseline="middle"
          class="axis-label"
        >
          {{ axis.label }}
        </text>
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .chart {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }
      .axis-label {
        font-size: 16px;
        font-weight: 400;
        fill: var(--text-primary);
      }
    `,
  ],
})
export class RadarChartComponent {
  @Input() axes: RadarAxis[] = [];
  /** Value that sits at the centre. Raising it (e.g. 40) spreads out values that all live in the 70–95 band. */
  @Input() min = 0;

  readonly width = 460;
  readonly height = 340;
  readonly cx = 230;
  readonly cy = 170;
  readonly radius = 114;

  private readonly uid = nextId++;
  readonly gradId = `sb-radar-grad-${this.uid}`;
  readonly blurId = `sb-radar-blur-${this.uid}`;
  readonly clipId = `sb-radar-clip-${this.uid}`;
  readonly arrowId = `sb-radar-arrow-${this.uid}`;

  get ariaLabel(): string {
    return this.axes.map((a) => `${a.label} ${a.value}%`).join(', ');
  }

  private angleFor(index: number): number {
    const count = this.axes.length || 1;
    return -Math.PI / 2 + (2 * Math.PI * index) / count;
  }

  vertex(index: number, fraction: number): { x: number; y: number } {
    const angle = this.angleFor(index);
    return {
      x: this.cx + Math.cos(angle) * this.radius * fraction,
      y: this.cy + Math.sin(angle) * this.radius * fraction,
    };
  }

  ringPoints(fraction: number): string {
    return this.axes.map((_, i) => this.point(this.vertex(i, fraction))).join(' ');
  }

  dataPoints(): string {
    return this.axes.map((axis, i) => this.point(this.vertex(i, this.fractionFor(axis.value)))).join(' ');
  }

  fractionFor(value: number): number {
    const span = 100 - this.min || 1;
    return Math.min(1, Math.max(0.08, (value - this.min) / span));
  }

  labelPos(index: number): { x: number; y: number } {
    const v = this.vertex(index, 1.2);
    const angle = this.angleFor(index);
    // Nudge top/bottom labels a little further out so they clear the arrowhead.
    return { x: v.x, y: v.y + Math.sin(angle) * 6 };
  }

  labelAnchor(index: number): string {
    const cos = Math.cos(this.angleFor(index));
    if (cos > 0.3) return 'start';
    if (cos < -0.3) return 'end';
    return 'middle';
  }

  private point(v: { x: number; y: number }): string {
    return `${v.x.toFixed(1)},${v.y.toFixed(1)}`;
  }
}
