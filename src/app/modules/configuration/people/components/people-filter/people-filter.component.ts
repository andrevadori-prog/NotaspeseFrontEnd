import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FilterPeople } from '@mch-core/models/filters/filter-people';
import { ConfigEnableMode } from 'mch-authentication-v2-lib';

@Component({
  selector: 'app-people-filter',
  standalone: false,
  templateUrl: './people-filter.component.html',
  styleUrl: './people-filter.component.scss'
})
export class PeopleFilterComponent {
  private readonly fb = inject(FormBuilder);
  readonly ConfigEnableMode = ConfigEnableMode;

  @Output()
  onFilterChange = new EventEmitter<FilterPeople>();

  filterForm = this.fb.nonNullable.group({
    name: [''],
    surname: [''],
    statuses: this.fb.nonNullable.control<ConfigEnableMode[]>([])
  });

  handleFilterChange(): void {
    const values = this.filterForm.getRawValue();

    const filter = new FilterPeople();
    filter.name = values.name.trim();
    filter.surname = values.surname.trim();
    filter.statuses = values.statuses;

    this.onFilterChange.emit(filter);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.handleFilterChange();
  }
}
