import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { People } from '@mch-core/models/people';
import { CostCenterSlim } from '@mch-core/models/cost-center';
import { FilterExpenseReport } from '@mch-core/models/filters/filter-expense-report';

@Component({
  selector: 'app-expense-reports-filter',
  standalone: false,
  templateUrl: './expense-reports-filter.component.html',
  styleUrl: './expense-reports-filter.component.scss'
})
export class ExpenseReportsFilterComponent {
  private readonly fb = inject(FormBuilder);

  @Input() peoples: People[] = [];
  @Input() costCenters: CostCenterSlim[] = [];

  @Output()
  onFilterChange = new EventEmitter<FilterExpenseReport>();

  readonly months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile',
    'Maggio', 'Giugno', 'Luglio', 'Agosto',
    'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  filterForm = this.fb.group({
    peopleId: this.fb.control<string | null>(null),
    costCenterId: this.fb.control<string | null>(null),
    month: this.fb.control<number | null>(null),
    year: this.fb.control<number | null>(null, [
      Validators.min(1),
      Validators.max(9999),
      Validators.pattern(/^\d+$/)
    ])
  });

  handleFilterChange(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const values = this.filterForm.getRawValue();

    const filter = new FilterExpenseReport();
    filter.peopleId = values.peopleId ?? undefined;
    filter.costCenterId = values.costCenterId ?? undefined;
    filter.month = values.month ?? undefined;
    filter.year = values.year ?? undefined;

    this.onFilterChange.emit(filter);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.handleFilterChange();
  }
}