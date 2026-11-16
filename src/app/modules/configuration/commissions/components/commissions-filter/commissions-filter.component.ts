import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { FilterCommission } from '@mch-core/models/filters/filter-commission';
import { CommissionType } from '@mch-core/enums/commision-type.enum';

@Component({
  selector: 'app-commissions-filter',
  standalone: false,
  templateUrl: './commissions-filter.component.html',
  styleUrl: './commissions-filter.component.scss'
})
export class CommissionsFilterComponent {
  private readonly fb = inject(FormBuilder);

  readonly CommissionType = CommissionType;

  @Output()
  onFilterChange = new EventEmitter<FilterCommission>();

  filterForm = this.fb.nonNullable.group({
    code: [''],
    description: [''],
    type: this.fb.control<CommissionType | null>(null),
    showObsolete: [false]
  });

  handleFilterChange(): void {
    const values = this.filterForm.getRawValue();

    const filter = new FilterCommission();
    filter.code = values.code.trim();
    filter.description = values.description.trim();
    filter.type = values.type ?? undefined;
    filter.showObsolete = values.showObsolete;

    this.onFilterChange.emit(filter);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.handleFilterChange();
  }
}