import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownOptionModel } from '../../models/dropdown.model';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-single-select-dropdown',
  imports: [MatSelectModule, MatFormFieldModule, FormsModule],
  templateUrl: './single-select-dropdown.component.html',
  styleUrl: './single-select-dropdown.component.scss',
})
export class SingleSelectDropdownComponent {
  labelText = input<string>('');
  placeholder = input<string>('Select an option');
  options = input<DropdownOptionModel[]>([]);
  disabled = input<boolean>(false);
  ariaLabel = input<string>('');

  value = model<DropdownOptionModel | null>(null);

  /**
   * Compares two options for equality based on their value property.
   * This prevents unnecessary change detection when the same option is selected.
   */
  compareOptions(opt1: DropdownOptionModel | null, opt2: DropdownOptionModel | null): boolean {
    return opt1?.value === opt2?.value;
  }
}
