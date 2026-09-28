import { Component, Input } from '@angular/core';
import { PerformancePoint } from '../core/models';

@Component({
  selector: 'sb-line-chart',
  standalone: true,
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart" preserveAspectRatio="none">
      @for (y of gridLines; track y) {
        <line
          [attr.x1]="padding"
          [attr.x2]="width - padding"
          [attr.y1]="yFor(y)"
          [attr.y2]="yFor(y)"
          stroke="var(--border)"
          stroke-width="1"
        />
      }
      <polyline [attr.points]="pointsFor('classAverage')" fill="none" stroke="#c7cbe0" stroke-width="2" stroke-dasharray="4 4" />
      <polyline [attr.points]="pointsFor('averageGrade')" fill="none" stroke="var(--primary)" stroke-width="2.5" />
      @for (p of data; track p.label; let i = $index) {
        <circle [attr.cx]="xFor(i)" [attr.cy]="yFor(p.averageGrade)" r="3.5" fill="var(--primary)" />
      }
    </svg>
    <div class="x-axis">
      @for (p of data; track p.label) {
        <span>{{ p.label }}</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .chart {
        width: 100%;
        height: 200px;
        display: block;
      }
      .x-axis {
        display: flex;
        justify-content: space-between;
        padding: 4px 28px 0;
        font-size: 11px;
        color: var(--text-muted);
      }
    `,
  ],
})
export class LineChartComponent {
  @Input() data: PerformancePoint[] = [];

  readonly width = 600;
  readonly height = 200;
  readonly padding = 28;
  readonly gridLines = [0, 25, 50, 75, 100];

  private maxValue = 100;

  xFor(index: number): number {
    if (this.data.length <= 1) return this.padding;
    const usable = this.width - this.padding * 2;
    return this.padding + (usable * index) / (this.data.length - 1);
  }

  yFor(value: number): number {
    const usable = this.height - 24;
    return 12 + usable - (usable * value) / this.maxValue;
  }

  pointsFor(key: 'averageGrade' | 'classAverage'): string {
    return this.data.map((p, i) => `${this.xFor(i)},${this.yFor(p[key])}`).join(' ');
  }
}
