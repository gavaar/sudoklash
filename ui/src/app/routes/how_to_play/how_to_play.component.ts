import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `Hello How to Play`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowToPlayComponent {}
