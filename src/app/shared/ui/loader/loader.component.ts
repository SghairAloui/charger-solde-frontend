import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzSpinModule} from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  @Input() loading: boolean = true;
  @Input() tip: string = 'Chargement...';
}
