import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { RecordStatus } from '@mch-core/enums/record-status.enums';
import { CommissionType } from '@mch-core/enums/commision-type.enum';

import { Commission } from '@mch-core/models/commission';

@Component({
  selector: 'app-modal-commissions',
  standalone: false,
  templateUrl: './modal-commissions.component.html',
  styleUrl: './modal-commissions.component.scss'
})
export class ModalCommissionsComponent {
  private readonly fb = inject(FormBuilder);

  readonly RecordStatus = RecordStatus;
  readonly CommissionType = CommissionType;


  @Output() save = new EventEmitter<Commission>();
  @Output() cancel = new EventEmitter<void>();

  salvataggio = false;
  errore = '';
  solaLettura = false;

  private currentCommission?: Commission;
  commissionForm = this.fb.nonNullable.group({
    code: ['', [
      Validators.required,
      Validators.maxLength(50)
    ]],
    description: ['', [
      Validators.required,
      Validators.maxLength(250)
    ]],
    type: [CommissionType.Planning, Validators.required],
    status: [RecordStatus.Active, Validators.required]
  });

  @Input()
  set commission(value: Commission | undefined) {
    this.currentCommission = value;

    this.commissionForm.reset({
      code: value?.code ?? '',
      description: value?.description ?? '',
      type: value?.type ?? CommissionType.Planning,
      status: value?.status ?? RecordStatus.Active
    });
  }

  @Input()
  set readOnly(value: boolean) {
    this.solaLettura = value;

    if (value) {
      this.commissionForm.disable();
    } else {
      this.commissionForm.enable();
    }
  }

  onSubmit(): void {
    if (this.solaLettura || this.salvataggio) {
      return;
    }

    const values = this.commissionForm.getRawValue();

    const code = values.code.trim();
    const description = values.description.trim();

    this.commissionForm.patchValue({ code, description });

    if (this.commissionForm.invalid) {
      this.commissionForm.markAllAsTouched();

      Object.values(this.commissionForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });

      return;
    }

    const commission = new Commission();

    commission.commissionId =
      this.currentCommission?.commissionId ??
      '00000000-0000-0000-0000-000000000000';

    commission.code = code;
    commission.description = description;
    commission.type = values.type;
    commission.status = values.status;

    this.save.emit(commission);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}