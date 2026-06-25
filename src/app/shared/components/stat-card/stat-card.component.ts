import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent implements OnChanges {
  @Input({required: true}) label!: string;
  @Input({required: true}) value!: string | number;
  @Input() icon: string = 'info-circle';
  @Input() bgColor: string = '#6C5CE7';
  @Input() gradient: string = 'linear-gradient(135deg, #6C5CE7, #a29bfe)';
  @Input() trend: number | null = null;
  @Input() progress: number | null = null;

  displayValue: string | number = 0;
  accentColor   = '#6C5CE7';
  accentBg      = 'rgba(108, 92, 231, 0.12)';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bgColor']) {
      this.accentColor = this.bgColor;
      this.accentBg    = this.hexToRgba(this.bgColor, 0.12);
      if (!changes['gradient']?.currentValue) {
        this.gradient = `linear-gradient(135deg, ${this.bgColor}, ${this.lightenHex(this.bgColor, 40)})`;
      }
    }
    if (changes['value']) {
      this.animateValue();
    }
  }

  private animateValue(): void {
    const target = typeof this.value === 'number' ? this.value : 0;
    if (typeof this.value === 'string') {
      this.displayValue = this.value;
      return;
    }

    let current = 0;
    const steps  = 30;
    const inc    = target / steps;
    const timer = setInterval(() => {
      current = Math.min(current + inc, target);
      this.displayValue = Math.round(current);
      if (current >= target) clearInterval(timer);
    }, 30);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private lightenHex(hex: string, amount: number): string {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
}
