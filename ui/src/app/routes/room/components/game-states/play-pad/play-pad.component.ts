import { NgClass, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { NumpadComponent } from 'src/app/components/numpad/numpad.component';
import { SendButtonComponent } from 'src/app/components/send-button/send-button.component';

@Component({
  standalone: true,
  imports: [NgFor, NgClass, NumpadComponent, SendButtonComponent],
  selector: 'sudo-play-pad',
  templateUrl: './play-pad.component.html',
  styleUrls: ['./play-pad.component.scss', './play-pad.component.overrides.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayPadComponent {
  @Input() forceDisabled = false;
  @Input() canLock = true;

  @Output() played = new EventEmitter<string>();

  focusedPos: 0 | 1 | 2 | 3 = 0;
  accentPads = new Array(10);
  lockedPads = new Array(10);
  lockedSelection = [false, false, false, false];
  hidePad = false;
  selection = signal(<(number | null)[]>[null, null, null, null]);
  disabledPads = computed(() => Array.from(new Array(10), (_, index) => this.selection().includes(index)));
  submitDisabled = computed(() => {
    const allValuesSelected = this.selection().findIndex(v => v == null) === -1;
    return !allValuesSelected;
  });

  selectNum(num: number) {
    this.selection.mutate(val => {
      const existingSelection = val.findIndex(v => v === num);
      // cant remove if focusing locked or reselecting locked
      if (this.lockedSelection[this.focusedPos] || this.lockedSelection[existingSelection]) { return; }
      delete val[existingSelection];
      val[this.focusedPos] = num;
      this.selectNextPad();
    });

  }

  holdNum(num: number) {
    this.accentPads[num] = !this.accentPads[num];
    this.accentPads = [...this.accentPads];
  }

  toggleLock(index: number): void {
    if (this.selection()[index] == null || !this.canLock) {
      return;
    }

    this.lockedSelection[index] = !this.lockedSelection[index];
    this.lockedPads[this.selection()[index]!] = this.lockedSelection[index];
    this.lockedPads = [...this.lockedPads];

    if (this.lockedSelection[index] && this.focusedPos === index) {
      this.selectNextPad();
    }
  }

  updateFocus(index: number) {
    if (!this.lockedSelection[index]) { 
      this.focusedPos = index as 0 | 1 | 2 | 3;
    }
  }

  submitSelection() {
    if (!this.submitDisabled() && !this.forceDisabled) {
      this.played.emit(this.selection().join(''));
      this.selection.set(this.selection().map((prev, i) => this.lockedSelection[i] ? prev : null));
    }
  }

  private selectNextPad(): void {
    // upcoming pad indexes removing those that are locked
    const upcomingPads = [0,1,2,3].map((i) => {
      // e.g. [2,3,0,1];
      const upcomingIndex = (i + 1 + this.focusedPos) % 4;

      return this.lockedSelection[upcomingIndex] ? null : (i + 1 + this.focusedPos) % 4
    });

    this.focusedPos = upcomingPads.find(newIndex => newIndex != null) as 0 | 1 | 2 | 3;
  }
}
