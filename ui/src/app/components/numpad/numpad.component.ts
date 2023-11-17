import { NgClass, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';

@Component({
  standalone: true,
  imports: [NgFor, NgClass],
  selector: 'sudo-numpad',
  templateUrl: './numpad.component.html',
  styleUrls: ['./numpad.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumpadComponent implements OnChanges {
  @Input() disabledPads:  boolean[] = [];
  @Input() accentPads: boolean[] = [];
  @Input() lockedPads: boolean[] = [];
  @Output() hold = new EventEmitter<number>();
  @Output() select = new EventEmitter<number>();

  padStatuses = Array.from(new Array(10), () => ({ disabled: false, accent: false, locked: false }));

  private held = false;
  private timeout?: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accentPads']) {
      for (let num in this.accentPads) {
        this.padStatuses[+num].accent = this.accentPads[num];
      }
    }

    if (changes['disabledPads']) {
      for (let num in this.disabledPads) {
        this.padStatuses[+num].disabled = this.disabledPads[num];
      }
    }

    if (changes['lockedPads']) {
      for (let num in this.lockedPads) {
        this.padStatuses[+num].locked = this.lockedPads[num];
      }
    }
  }

  down(num: number): void {
    this.timeout = setTimeout(() => {
      this.held = true;
      this.hold.emit(num);
    }, 500);
  }

  up(num: number): void {
    clearTimeout(this.timeout);

    if (this.held) {
      this.held = false;
      return;
    }
    
    this.select.emit(num);
  }
}
