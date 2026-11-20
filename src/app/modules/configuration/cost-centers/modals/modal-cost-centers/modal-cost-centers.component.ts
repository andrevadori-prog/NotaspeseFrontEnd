import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CostCenter } from '@mch-core/models/cost-center';

@Component({
  selector: 'app-modal-cost-centers',
  standalone: false,
  templateUrl: './modal-cost-centers.component.html',
  styleUrl: './modal-cost-centers.component.scss'
})
export class ModalCostCentersComponent {
  private readonly fb = inject(FormBuilder);

  @Output() save = new EventEmitter<CostCenter>();
  @Output() cancel = new EventEmitter<void>();

  salvataggio = false;
  solaLettura = false;

  currentCostCenter?: CostCenter;

  costCenterForm = this.fb.nonNullable.group({
    code: ['', [
      Validators.required,
      Validators.maxLength(20)
    ]],
    costCenterName: ['', [
      Validators.required,
      Validators.maxLength(20)
    ]],
    description: ['', [
      Validators.required,
      Validators.maxLength(500)
    ]]
  });

  @Input()
  set costCenter(value: CostCenter | undefined) {
    this.currentCostCenter = value;

    this.costCenterForm.reset({
      code: value?.code ?? '',
      costCenterName: value?.costCenterName ?? '',
      description: value?.description ?? ''
    });
  }

  @Input()
  set readOnly(value: boolean) {
    this.solaLettura = value;

    if (value) {
      this.costCenterForm.disable();
    } else {
      this.costCenterForm.enable();
    }
  }

  onSubmit(): void {
    if (this.solaLettura || this.salvataggio) {
      return;
    }

    const values = this.costCenterForm.getRawValue();

    const code = values.code.trim();
    const costCenterName = values.costCenterName.trim();
    const description = values.description.trim();

    this.costCenterForm.patchValue({
      code,
      costCenterName,
      description
    });

    if (this.costCenterForm.invalid) {
      this.costCenterForm.markAllAsTouched();

      Object.values(this.costCenterForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });

      return;
    }

    const costCenter = new CostCenter();

    costCenter.costCenterId =
      this.currentCostCenter?.costCenterId ??
      '00000000-0000-0000-0000-000000000000';

    costCenter.code = code;
    costCenter.costCenterName = costCenterName;
    costCenter.description = description;

    this.save.emit(costCenter);
  }

  onCancel(): void {
    this.cancel.emit();
  }


}