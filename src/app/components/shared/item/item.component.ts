import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-item',
  standalone: true,
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',

})
export class ItemComponent {
  @Input({
    required: true,
  }) title!: string;

  @Input({
    required: true,
  }) previewContent!: string;
}
