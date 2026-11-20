import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';

import { CommissionSlim } from '@mch-core/models/commission';
import { ExpenseItem } from '@mch-core/models/expense-item';
import { CostCenterSlim } from '@mch-core/models/cost-center';
import { ExpenseItemDetail } from '@mch-core/models/expense-item-detail';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-modal-expense-items',
  standalone: false,
  templateUrl: './modal-expense-items.component.html',
  styleUrl: './modal-expense-items.component.scss'
})
export class ModalExpenseItemsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NzNotificationService);
  @Input() commissions: CommissionSlim[] = [];
  maxDay = 31;
  solaLettura = false;
  @Input() costCenters: CostCenterSlim[] = [];
  @Input() defaultCostCenterId: string | null = null;

  expenseItemDetails: ExpenseItemDetail[] = [];
  editingDetail?: ExpenseItemDetail;
  receiptFileName: string | null = null;
  receiptBase64: string | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ExpenseItem>();

  currentItem?: ExpenseItem;

  private readonly currencyValidator: ValidatorFn = (control) => {
    const currency = control.get('currencyCode')?.value
      ?.trim()
      .toUpperCase();

    const foreignAmount = control.get('foreignAmount')?.value;

    return currency === 'EUR' && foreignAmount != null
      ? { foreignAmountWithEur: true }
      : null;
  };

  itemForm = this.fb.group({
    dayOfMonth: this.fb.nonNullable.control(1, [
      Validators.required,
      Validators.min(1),
      Validators.max(31),
      Validators.pattern(/^\d+$/)
    ]),

    description: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500)
    ]),

    category: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100)
    ]),

    commissionId: this.fb.control<string | null>(null),

    currencyCode: this.fb.nonNullable.control('EUR', [
      Validators.required,
      Validators.pattern(/^[A-Za-z]{3}$/)
    ]),

    foreignAmount: this.fb.control<number | null>(null, [
      Validators.min(0),
      Validators.max(99999999.99)
    ]),

    amountEur: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(99999999.99)
    ])
  }, {
    validators: this.currencyValidator
  });

  detailForm = this.fb.group({
    costCenterId: this.fb.control<string | null>(
      null,
      Validators.required
    ),

    perCent: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(100)
    ])
  });

  @Input()
  set maxDaysInMonth(value: number) {
    this.maxDay = value;

    const dayControl = this.itemForm.controls.dayOfMonth;

    dayControl.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(value),
      Validators.pattern(/^\d+$/)
    ]);

    dayControl.updateValueAndValidity();
  }

  @Input()
  set item(value: ExpenseItem | undefined) {
    this.currentItem = value
      ? structuredClone(value)
      : undefined;

    this.expenseItemDetails = structuredClone(
      value?.expenseItemDetails ?? []
    );
    this.receiptFileName = value?.receiptFileName ?? null;
    this.receiptBase64 = value?.receiptBase64 ?? null;

    this.itemForm.reset({
      dayOfMonth: value?.dayOfMonth ?? 1,
      description: value?.description ?? '',
      category: value?.category ?? '',
      commissionId: value?.commissionId ?? null,
      currencyCode: value?.currencyCode ?? 'EUR',
      foreignAmount: value?.foreignAmount ?? null,
      amountEur: value?.amountEur ?? null
    });
  }

  @Input()
  set readOnly(value: boolean) {
    this.solaLettura = value;

    if (value) {
      this.itemForm.disable();
      this.detailForm.disable();
    } else {
      this.itemForm.enable();
      this.detailForm.enable();
    }
  }

  onFileSelected(event: Event): void {
    if (this.solaLettura) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.notification.error(
        'Allegato',
        'Il file dello scontrino non può superare i 5 MB.'
      );
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.receiptFileName = file.name;
      this.receiptBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRemoveReceipt(): void {
    if (this.solaLettura) {
      return;
    }

    this.receiptFileName = null;
    this.receiptBase64 = null;
  }

  getAvailableCostCenters(): CostCenterSlim[] {
    return this.costCenters.filter(center =>
      center.costCenterId !== this.defaultCostCenterId &&
      !this.expenseItemDetails.some(detail =>
        detail !== this.editingDetail &&
        detail.costCenterId === center.costCenterId
      )
    );
  }

  getCostCenterCode(costCenterId: string | null): string {
    const center = this.costCenters.find(
      item => item.costCenterId === costCenterId
    );

    return center?.code ?? 'Centro non disponibile';
  }

  getAllocatedPercent(): number {
    const total = this.expenseItemDetails.reduce(
      (sum, detail) => sum + Math.round(detail.perCent * 100),
      0
    );

    return total / 100;
  }

  onEditDetail(detail: ExpenseItemDetail): void {
    if (this.solaLettura) {
      return;
    }

    this.editingDetail = detail;

    this.detailForm.reset({
      costCenterId: detail.costCenterId,
      perCent: detail.perCent
    });
  }

  onResetDetail(): void {
    this.editingDetail = undefined;
    this.detailForm.reset();
  }

  onAddDetail(): void {
    if (this.solaLettura) {
      return;
    }
    const category = this.itemForm.controls.category.value
      .trim()
      .toLowerCase();

    if (category === 'auto') {
      this.notification.error(
        'Ripartizioni',
        'La categoria Auto usa solo il centro di costo predefinito.'
      );
      return;
    }

    const { costCenterId, perCent } = this.detailForm.getRawValue();

    if (this.detailForm.invalid || !costCenterId || perCent == null) {
      this.detailForm.markAllAsTouched();

      Object.values(this.detailForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });

      return;
    }

    const available = this.getAvailableCostCenters().some(
      center => center.costCenterId === costCenterId
    );

    if (!this.defaultCostCenterId || !available) {
      this.notification.error(
        'Ripartizioni',
        'Seleziona un centro disponibile diverso da quello predefinito.'
      );
      return;
    }

    const percent = Math.round(perCent * 100);

    const allocated = this.expenseItemDetails
      .filter(detail => detail !== this.editingDetail)
      .reduce(
        (total, detail) => total + Math.round(detail.perCent * 100),
        0
      );

    if (allocated + percent > 10000) {
      this.notification.error(
        'Ripartizioni',
        'La somma delle percentuali non può superare il 100%.'
      );
      return;
    }

    const emptyId = '00000000-0000-0000-0000-000000000000';

    const detail = Object.assign(
      new ExpenseItemDetail(),
      structuredClone(this.editingDetail ?? {})
    );

    detail.expenseItemDetailId =
      this.editingDetail?.expenseItemDetailId ?? emptyId;

    detail.expenseItemId =
      this.editingDetail?.expenseItemId ??
      this.currentItem?.expenseItemId ??
      emptyId;
    detail.costCenterId = costCenterId;
    detail.perCent = percent / 100;

    this.expenseItemDetails = this.editingDetail
      ? this.expenseItemDetails.map(existing =>
        existing === this.editingDetail ? detail : existing
      )
      : [...this.expenseItemDetails, detail];

    this.onResetDetail();
  }

  onRemoveDetail(detail: ExpenseItemDetail): void {
    if (this.solaLettura) {
      return;
    }

    if (this.editingDetail === detail) {
      this.onResetDetail();
    }

    this.expenseItemDetails = this.expenseItemDetails.filter(
      existing => existing !== detail
    );
  }

  onSave(): void {
    if (this.solaLettura) {
      return;
    }

    this.itemForm.patchValue({
      description: this.itemForm.controls.description.value.trim(),
      category: this.itemForm.controls.category.value.trim(),
      currencyCode: this.itemForm.controls.currencyCode.value
        .trim()
        .toUpperCase()
    });

    const value = this.itemForm.getRawValue();

    if (this.itemForm.invalid || value.amountEur == null) {
      this.itemForm.markAllAsTouched();

      Object.values(this.itemForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });

      return;
    }

    const pendingDetail = this.detailForm.getRawValue();

    if (
      pendingDetail.costCenterId != null ||
      pendingDetail.perCent != null
    ) {
      this.notification.error(
        'Ripartizioni',
        'Completa o annulla la ripartizione in compilazione prima di confermare la voce.'
      );
      return;
    }

    if (
      value.category.trim().toLowerCase() === 'auto' &&
      this.expenseItemDetails.length > 0
    ) {
      this.notification.error(
        'Ripartizioni',
        'La categoria Auto usa solo il centro predefinito. Rimuovi le ripartizioni prima di confermare.'
      );
      return;
    }

    const emptyId = '00000000-0000-0000-0000-000000000000';

    const item = Object.assign(
      new ExpenseItem(),
      structuredClone(this.currentItem ?? {})
    );

    item.expenseItemId =
      this.currentItem?.expenseItemId ?? emptyId;

    item.expenseReportId =
      this.currentItem?.expenseReportId ?? emptyId;
    item.dayOfMonth = value.dayOfMonth;
    item.description = value.description;
    item.category = value.category;
    item.commissionId = value.commissionId;
    item.currencyCode = value.currencyCode.toUpperCase();
    item.foreignAmount = value.foreignAmount;
    item.amountEur = value.amountEur;
    item.receiptFileName = this.receiptFileName;
    item.receiptBase64 = this.receiptBase64;
    item.expenseItemDetails = structuredClone(
      this.expenseItemDetails
    );

    this.save.emit(item);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}