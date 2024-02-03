import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sudo-send-button',
  template: `
    <button class="sudo-send-button"
      [disabled]="disabled"
      (click)="disabled && $event.stopImmediatePropagation()">
      <span class="sudo-send-button__arrow">➤</span>
    </button>
  `,
  styles: [`
    .sudo-send-button {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: transparent;
      border: 0;
      color: var(--white);
      background-color: var(--lightblue);
      font-size: 1rem;
      text-align: end;

      &[disabled] {
        opacity: 0.5;
        background-color: var(--lightgray);
        pointer-events: none;
      }
    }

    .sudo-send-button__arrow {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 0.25rem
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SendButtonComponent {
  @Input() disabled = false;
}
