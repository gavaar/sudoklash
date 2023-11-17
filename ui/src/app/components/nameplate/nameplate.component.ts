import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  standalone: true,
  imports: [NgIf],
  selector: 'sudo-nameplate',
  template: `
    <div *ngIf="user"
      class="sudo-namplate">
      <img class="sudo-namplate__img"
        alt="user photo"
        [src]="user.avatar"/>
      {{ user.username }}
    </div>
  `,
  styles: [`
    .sudo-namplate {
      display: flex;
      font-weight: bold;
      align-items: center;
      justify-content: space-around;
      gap: 1rem; 
    }

    .sudo-namplate__img {
      width: 3rem;
      border-radius: 50%;
    }
  `],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameplateComponent {
  @Input() user!: { avatar: string; username: string };
}
