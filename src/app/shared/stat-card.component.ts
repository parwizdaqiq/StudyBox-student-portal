import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'sb-stat-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="card stat-card">
      <div class="stat-icon" [style.background]="color + '1f'" [style.color]="color">
        <sb-icon [name]="icon" [size]="20"></sb-icon>
      </div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-row">
        <span class="stat-label">{{ label }}</span>
        @if (trend) {
          <span class="stat-trend" [class.down]="trendDirection === 'down'">
            <sb-icon [name]="trendDirection === 'down' ? 'chevron-down' : 'trend-up'" [size]="12"></sb-icon>
            {{ trend }}
          </span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .stat-card {
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .stat-icon {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stat-value {
        font-size: 26px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
      }
      .stat-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .stat-label {
        font-size: 13px;
        color: var(--text-secondary);
        font-weight: 500;
      }
      .stat-trend {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 12px;
        font-weight: 700;
        color: var(--success);
      }
      .stat-trend.down {
        color: var(--danger);
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() icon = 'dashboard';
  @Input() color = '#4F6EF7';
  @Input() trend = '';
  @Input() trendDirection: 'up' | 'down' = 'up';
}
