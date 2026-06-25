import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = 'Confirmer la suppression';
  @Input() message = 'Voulez-vous vraiment effectuer cette action ? Cette action est irréversible.';
  @Input() itemName = '';
  @Input() confirmText = 'Supprimer';
  @Input() cancelText = 'Annuler';
  @Input() loading = false;
  @Input() danger = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isAnimalSelected = false;

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  close(): void {
    this.onCancel();
  }
}
