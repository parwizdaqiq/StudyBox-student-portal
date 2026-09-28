import { Component, Input } from '@angular/core';

/**
 * Minimal inline-SVG icon set — no external icon font/library dependency.
 * Add a new @case here rather than pulling in an icon package.
 */
@Component({
  selector: 'sb-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name) {
        @case ('dashboard') {
          <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
        }
        @case ('students') {
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        }
        @case ('courses') {
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        }
        @case ('grades') {
          <polygon points="12 2 15 8.5 22 9.5 17 14.5 18.3 21.5 12 18 5.7 21.5 7 14.5 2 9.5 9 8.5 12 2" />
        }
        @case ('attendance') {
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          <path d="M9 16l2 2 4-4" />
        }
        @case ('bell') {
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        }
        @case ('chevron-right') {
          <polyline points="9 18 15 12 9 6" />
        }
        @case ('chevron-down') {
          <polyline points="6 9 12 15 18 9" />
        }
        @case ('cloud') {
          <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4-1.8A4.5 4.5 0 0 0 6.5 19h11z" />
        }
        @case ('code') {
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        }
        @case ('smartphone') {
          <rect x="6" y="2" width="12" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" />
        }
        @case ('build') {
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6 3 3 6-6a4 4 0 0 0 5.4-5.4l-3-3z" />
        }
        @case ('lock') {
          <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
        }
        @case ('trend-up') {
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        }
        @case ('mail') {
          <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2 7 12 14 22 7" />
        }
        @case ('logout') {
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        }
        @case ('wallet') {
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
        }
        @case ('clipboard-check') {
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M9 14l2 2 4-4" />
        }
        @case ('message-circle') {
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.35 0-2.62-.32-3.75-.88L3 21l1.88-5.65A8.5 8.5 0 1 1 21 11.5z" />
        }
        @case ('calendar') {
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        }
        @case ('file-text') {
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
        }
        @case ('megaphone') {
          <path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 5V5L6 10H4a1 1 0 0 0-1 1z" />
          <path d="M15 8a4 4 0 0 1 0 8" /><path d="M18 5a8 8 0 0 1 0 14" />
        }
        @case ('log-out') {
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        }
        @case ('grid') {
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
        }
        @case ('chevron-left') {
          <polyline points="15 18 9 12 15 6" />
        }
        @case ('arrow-right') {
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
        }
        @case ('layers') {
          <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        }
        @case ('more-vertical') {
          <circle cx="12" cy="5" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="19" r="1.2" fill="currentColor" />
        }
        @case ('check') {
          <polyline points="20 6 9 17 4 12" />
        }
        @case ('badge-check') {
          <path fill="currentColor" stroke="none" d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z" />
          <polyline points="8.5 12 11 14.5 15.5 9.5" stroke="#fff" stroke-width="2" />
        }
        @case ('badge-x') {
          <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
          <line x1="9" y1="9" x2="15" y2="15" stroke="#fff" stroke-width="2" />
          <line x1="15" y1="9" x2="9" y2="15" stroke="#fff" stroke-width="2" />
        }
        @case ('hourglass') {
          <path fill="currentColor" stroke="none" d="M6 2h12v2h-1v3.2a4 4 0 0 1-1.6 3.2L13.3 12l2.1 1.6A4 4 0 0 1 17 16.8V20h1v2H6v-2h1v-3.2a4 4 0 0 1 1.6-3.2L10.7 12 8.6 10.4A4 4 0 0 1 7 7.2V4H6z" />
        }
        @case ('alarm') {
          <circle cx="12" cy="13" r="8" /><polyline points="12 9 12 13 14.5 14.5" />
          <line x1="3" y1="5" x2="6" y2="2.5" /><line x1="21" y1="5" x2="18" y2="2.5" />
        }
        @case ('briefcase') {
          <rect x="2.5" y="7" width="19" height="13" rx="2.5" fill="currentColor" stroke="none" />
          <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
          <line x1="2.5" y1="12.5" x2="21.5" y2="12.5" stroke="#fff" stroke-width="1.6" />
        }
        @case ('calendar-fill') {
          <rect x="3" y="5" width="18" height="16" rx="2.5" fill="currentColor" stroke="none" />
          <line x1="8" y1="2.5" x2="8" y2="6.5" /><line x1="16" y1="2.5" x2="16" y2="6.5" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="#fff" stroke-width="1.6" />
        }
        @case ('bell-fill') {
          <path fill="currentColor" stroke="none" d="M12 2.5a6 6 0 0 0-6 6c0 5.5-2.5 7.5-2.5 7.5h17S18 14 18 8.5a6 6 0 0 0-6-6z" />
          <path d="M10.3 20a2 2 0 0 0 3.4 0" />
        }
        @case ('shield') {
          <path d="M12 2l8 3.5v6C20 16.5 16.5 20.5 12 22c-4.5-1.5-8-5.5-8-10.5v-6L12 2z" />
          <polyline points="9 12 11 14 15 9.5" />
        }
        @case ('plus') {
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        }
        @case ('trash') {
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        }
        @case ('x') {
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        }
        @case ('user-plus') {
          <path d="M13 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
        }
        @case ('logo') {
          <path fill="currentColor" stroke="none" d="M2 21 12.5 6.5l2.7 2-6.3 8.7H19V21z" />
          <path fill="currentColor" stroke="none" d="M18.5 1.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
        }
        @default {
          <circle cx="12" cy="12" r="9" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input() name = '';
  @Input() size = 18;
}
