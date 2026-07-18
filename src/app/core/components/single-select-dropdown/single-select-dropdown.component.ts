import { Component, computed, effect, input, model, signal } from '@angular/core';
import { DropdownOptionModel } from '../../models/dropdown.model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-single-select-dropdown',
  imports: [MatAutocompleteModule, MatFormFieldModule, MatInputModule],
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
  searchText = signal('');

  filteredOptions = computed(() => {
    const query = this.searchText().trim().toLowerCase();

    if (!query) {
      return this.options();
    }

    return this.options().filter(option => {
      const label = option.label.toLowerCase();
      const value = String(option.value).toLowerCase();

      return label.includes(query) || value.includes(query);
    });
  });

  constructor() {
    effect(() => {
      const selectedOption = this.value();
      const selectedLabel = selectedOption?.label;

      if (selectedLabel && this.searchText() !== selectedLabel) {
        this.searchText.set(selectedLabel);
      }
    });
  }

  /**
   * Compares two options for equality based on their value property.
   * This prevents unnecessary change detection when the same option is selected.
   */
  compareOptions(opt1: DropdownOptionModel | null, opt2: DropdownOptionModel | null): boolean {
    return opt1?.value === opt2?.value;
  }

  displayOption(option: DropdownOptionModel | null): string {
    return option?.label ?? '';
  }

  onSearchTextChange(text: string): void {
    this.searchText.set(text);

    if (text.trim() === '') {
      this.value.set(null);
    }
  }

  selectOption(option: DropdownOptionModel): void {
    this.value.set(option);
    this.searchText.set(option.label);
  }
}
