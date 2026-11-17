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
import { ExpenseReport } from '@mch-core/models/expense-report';
import { ExpenseItem } from '@mch-core/models/expense-item';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ModalExpenseItemsComponent } from '../modal-expense-items/modal-expense-items.component';
import { CommissionSlim } from '@mch-core/models/commission';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { takeUntil } from 'rxjs';
import { CommissionApiService } from '@mch-core/http-api/commission-api.service';


@Component({
  selector: 'app-modal-expense-reports',
  standalone: false,
  templateUrl: './modal-expense-reports.component.html',
  styleUrl: './modal-expense-reports.component.scss'
})
export class ModalExpenseReportsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly oggi = new Date();
  private readonly modal = inject(NzModalService);
  private readonly notification = inject(NzNotificationService);
  private readonly commissionApi = inject(CommissionApiService);

  @Input() peoples: People[] = [];
  @Input() costCenters: CostCenterSlim[] = [];
  @Input() commissions: CommissionSlim[] = [];

  readonly months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile',
    'Maggio', 'Giugno', 'Luglio', 'Agosto',
    'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ExpenseReport>();

  expenseItems: ExpenseItem[] = [];
  solaLettura = false;
  salvataggio = false;

  private currentReport?: ExpenseReport;

  reportForm = this.fb.group({
    peopleId: this.fb.control<string | null>(
      null,
      Validators.required
    ),
    costCenterId: this.fb.control<string | null>(
      null,
      Validators.required
    ),
    month: this.fb.nonNullable.control(
      this.oggi.getMonth() + 1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(12)
      ]
    ),
    year: this.fb.nonNullable.control(
      this.oggi.getFullYear(),
      [
        Validators.required,
        Validators.min(1),
        Validators.max(9999),
        Validators.pattern(/^\d+$/)
      ]
    ),
    description: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500)
    ])
  });

  @Input()
  set report(value: ExpenseReport | undefined) {
    this.currentReport = value;
    this.expenseItems = structuredClone(value?.expenseItems ?? []);

    const defaultPeopleId =
      value?.peopleId ??
      (this.peoples.length === 1 ? this.peoples[0].peopleId : null);

    this.reportForm.reset({
      peopleId: defaultPeopleId,
      costCenterId: value?.costCenterId ?? null,
      month: value?.month ?? this.oggi.getMonth() + 1,
      year: value?.year ?? this.oggi.getFullYear(),
      description: value?.description ?? ''
    });
  }

  @Input()
  set readOnly(value: boolean) {
    this.solaLettura = value;

    if (value) {
      this.reportForm.disable();
    } else {
      this.reportForm.enable();
    }
  }

  private loadItemCommissions(
    modalRef: NzModalRef<ModalExpenseItemsComponent>,
    item?: ExpenseItem
  ): void {
    const component = modalRef.componentInstance!;
    component.commissions = [...this.commissions];

    const commissionId = item?.commissionId;

    if (
      !commissionId ||
      this.commissions.some(c => c.commissionId === commissionId)
    ) {
      return;
    }

    component.commissions = [
      ...component.commissions,
      { commissionId, code: 'Commessa già associata' }
    ];

    this.commissionApi.getCommissionById(commissionId)
      .pipe(takeUntil(modalRef.afterClose))
      .subscribe({
        next: commission => {
          component.commissions = component.commissions.map(current =>
            current.commissionId === commissionId
              ? { commissionId, code: commission.code }
              : current
          );
        },
        error: () => {
          this.notification.error(
            'Commesse',
            'Impossibile caricare il codice della commessa già associata.'
          );
        }
      });
  }

  onViewItem(item: ExpenseItem): void {
    if (this.salvataggio) {
      return;
    }

    const modalRef = this.modal.create({
      nzTitle: 'Dettagli voce di spesa',
      nzContent: ModalExpenseItemsComponent,
      nzWidth: 800,
      nzFooter: null
    });

    const component = modalRef.componentInstance!;

    component.maxDaysInMonth = this.getDaysInMonth();
    this.loadItemCommissions(modalRef, item);
    component.costCenters = this.costCenters;
    component.defaultCostCenterId =
      this.reportForm.controls.costCenterId.value;

    component.item = item;
    component.readOnly = true;

    component.cancel.subscribe(() => {
      modalRef.close();
    });
  }

  onAddItem(itemToEdit?: ExpenseItem): void {
    if (this.solaLettura || this.salvataggio) {
      return;
    }

    const { month, year, costCenterId } = this.reportForm.controls;

    if (month.invalid || year.invalid || costCenterId.invalid) {
      [month, year, costCenterId].forEach(control => {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });

      return;
    }

    const modalRef = this.modal.create({
      nzTitle: itemToEdit
        ? 'Modifica voce di spesa'
        : 'Nuova voce di spesa',
      nzContent: ModalExpenseItemsComponent,
      nzWidth: 800,
      nzFooter: null
    });

    const component = modalRef.componentInstance!;

    component.maxDaysInMonth = this.getDaysInMonth();
    this.loadItemCommissions(modalRef, itemToEdit);
    component.costCenters = this.costCenters;
    component.defaultCostCenterId = costCenterId.value;
    component.item = itemToEdit;

    component.save.subscribe(item => {
      item.expenseReportId =
        this.currentReport?.expenseReportId ?? item.expenseReportId;

      this.expenseItems = itemToEdit
        ? this.expenseItems.map(existing =>
          existing === itemToEdit ? item : existing
        )
        : [...this.expenseItems, item];
      this.reportForm.markAsDirty();

      modalRef.close();
    });

    component.cancel.subscribe(() => {
      modalRef.close();
    });
  }

  onRemoveItem(item: ExpenseItem): void {
    if (this.solaLettura || this.salvataggio) {
      return;
    }

    this.modal.confirm({
      nzTitle: 'Rimuovere la voce selezionata?',
      nzContent: 'La rimozione verrà salvata insieme alla nota.',
      nzOkText: 'Rimuovi',
      nzOkDanger: true,
      nzCancelText: 'Annulla',

      nzOnOk: () => {
        this.expenseItems = this.expenseItems.filter(
          existing => existing !== item
        );

        this.reportForm.markAsDirty();
      }
    });
  }

  getDaysInMonth(): number {
    const { year, month } = this.reportForm.getRawValue();

    if (
      this.reportForm.controls.year.invalid ||
      this.reportForm.controls.month.invalid
    ) {
      return 31;
    }

    return new Date(year, month, 0).getDate();
  }

  getTotal(): number {
    const totaleCentesimi = this.expenseItems.reduce(
      (totale, item) => totale + Math.round(item.amountEur * 100),
      0
    );

    return totaleCentesimi / 100;
  }

  getExpenseGroups(items: readonly ExpenseItem[]): {
    label: string;
    items: readonly ExpenseItem[];
  }[] {
    if (!this.solaLettura) {
      return [{ label: '', items }];
    }

    const isAuto = (item: ExpenseItem) =>
      item.category?.trim().toLowerCase() === 'auto';

    return [
      { label: 'Altre spese', items: items.filter(item => !isAuto(item)) },
      { label: 'Spese auto', items: items.filter(isAuto) }
    ].filter(group => group.items.length > 0);
  }


  onSave(): void {
    if (this.solaLettura || this.salvataggio) {
      return;
    }

    this.reportForm.patchValue({
      description: this.reportForm.controls.description.value.trim()
    });

    const value = this.reportForm.getRawValue();

    if (
      this.reportForm.invalid ||
      !value.peopleId ||
      !value.costCenterId
    ) {
      this.reportForm.markAllAsTouched();

      Object.values(this.reportForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });

      return;
    }

    if (this.expenseItems.length === 0) {
      this.notification.error(
        'Note spese',
        'Aggiungi almeno una voce di spesa.'
      );
      return;
    }

    const maxDay = this.getDaysInMonth();

    if (this.expenseItems.some(item =>
      item.dayOfMonth < 1 || item.dayOfMonth > maxDay
    )) {
      this.notification.error(
        'Note spese',
        'Una voce contiene un giorno non valido per il mese selezionato.'
      );
      return;
    }

    const conflictingItem = this.expenseItems.find(item =>
      item.expenseItemDetails?.some(detail =>
        detail.costCenterId === value.costCenterId
      )
    );

    if (conflictingItem) {
      this.notification.error(
        'Ripartizioni',
        `La voce del giorno ${conflictingItem.dayOfMonth} contiene una ripartizione sul centro predefinito. Apri la voce e rimuovi quella ripartizione.`
      );
      return;
    }

    const report = Object.assign(
      new ExpenseReport(),
      this.currentReport
    );

    report.expenseReportId = this.currentReport?.expenseReportId ??
      '00000000-0000-0000-0000-000000000000';

    report.peopleId = value.peopleId;
    report.costCenterId = value.costCenterId;
    report.month = value.month;
    report.year = value.year;
    report.day = maxDay;
    report.description = value.description;
    report.expenseItems = structuredClone(this.expenseItems);

    this.save.emit(report);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}