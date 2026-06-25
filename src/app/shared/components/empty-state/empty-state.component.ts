import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzButtonModule} from 'ng-zorro-antd/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, NzEmptyModule, NzButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input({required: true}) message: string = 'Aucune donnée disponible';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
