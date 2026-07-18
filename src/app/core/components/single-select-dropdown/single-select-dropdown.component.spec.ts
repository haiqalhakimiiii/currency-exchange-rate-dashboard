import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleSelectDropdownComponent } from './single-select-dropdown.component';
import { DropdownOptionModel } from '../../models/dropdown.model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

describe('SingleSelectDropdownComponent', () => {
  let component: SingleSelectDropdownComponent;
  let fixture: ComponentFixture<SingleSelectDropdownComponent>;

  const mockOptions: DropdownOptionModel[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleSelectDropdownComponent, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with label text', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('labelText', 'Select Currency');
    });
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('mat-label');
    expect(label.textContent).toContain('Select Currency');
  });

  it('should render mat-form-field with dropdown-field class', () => {
    const formField = fixture.nativeElement.querySelector('mat-form-field');
    expect(formField).toBeTruthy();
    expect(formField.classList.contains('dropdown-field')).toBe(true);
  });

  it('should have input element for autocomplete', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('should update value and search text when option is selected', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', mockOptions);
    });
    fixture.detectChanges();

    component.selectOption(mockOptions[0]);
    expect(component.value()).toEqual(mockOptions[0]);
    expect(component.searchText()).toBe(mockOptions[0].label);
  });

  it('should respect disabled state', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('disabled', true);
    });
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should use compareOptions for value comparison', () => {
    const option1 = { label: 'Test', value: 'test' };
    const option2 = { label: 'Test', value: 'test' };
    const option3 = { label: 'Different', value: 'diff' };

    expect(component.compareOptions(option1, option2)).toBe(true);
    expect(component.compareOptions(option1, option3)).toBe(false);
    expect(component.compareOptions(null, null)).toBe(true);
  });

  it('should default to placeholder input', () => {
    expect(component.placeholder()).toBe('Select an option');
  });

  it('should allow custom placeholder', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('placeholder', 'Choose a value');
    });
    expect(component.placeholder()).toBe('Choose a value');
  });

  it('should use ariaLabel when provided', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('ariaLabel', 'Currency Selection');
    });
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Currency Selection');
  });

  it('should fallback to labelText for aria-label when ariaLabel is not provided', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('labelText', 'Select Currency');
    });
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Select Currency');
  });

  it('should initialize with null value', () => {
    expect(component.value()).toBeNull();
  });

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should filter options from search text', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('options', mockOptions);
    });
    fixture.detectChanges();

    component.onSearchTextChange('2');

    expect(component.filteredOptions()).toEqual([mockOptions[1]]);
  });
});
