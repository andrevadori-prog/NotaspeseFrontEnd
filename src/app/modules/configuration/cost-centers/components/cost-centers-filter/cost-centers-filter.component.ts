import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FilterCostCenter } from '@mch-core/models/filters/filter-cost-center';

@Component({
  selector: 'app-cost-centers-filter',
  standalone: false,
  templateUrl: './cost-centers-filter.component.html',
  styleUrl: './cost-centers-filter.component.scss'
})
export class CostCentersFilterComponent {
  private readonly fb = inject(FormBuilder);

  @Output()
  onFilterChange = new EventEmitter<FilterCostCenter>();

  filterForm = this.fb.nonNullable.group({
    code: [''],
    costCenterName: [''],
    description: ['']
  });

  handleFilterChange(): void {
    const values = this.filterForm.getRawValue();

    const filter = new FilterCostCenter();
    filter.code = values.code.trim();
    filter.costCenterName = values.costCenterName.trim();
    filter.description = values.description.trim();

    this.onFilterChange.emit(filter);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.handleFilterChange();
  }
}