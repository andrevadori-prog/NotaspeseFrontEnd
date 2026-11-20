import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfigEnableMode, UserSlim } from 'mch-authentication-v2-lib';
import { People } from '@mch-core/models/people';


@Component({
  selector: 'app-modal-people',
  standalone: false,
  templateUrl: './modal-people.component.html',
  styleUrl: './modal-people.component.scss'
})
export class ModalPeopleComponent {
  private readonly fb = inject(FormBuilder);

  readonly ConfigEnableMode = ConfigEnableMode;

  @Input() userList: UserSlim[] = [];
  @Output() save = new EventEmitter<People>();
  @Output() cancel = new EventEmitter<void>();

  salvataggio = false;
  errore = '';

  peopleForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(50)
    ]],
    surname: ['', [
      Validators.required,
      Validators.maxLength(50)
    ]],
    badge: ['', Validators.maxLength(50)],
    userId: this.fb.control<string | null>(null),
    active: [ConfigEnableMode.Enabled, Validators.required]
  });

  currentPeople?: People;

  @Input()
  set people(value: People | undefined) {
    this.currentPeople = value;

    this.peopleForm.reset({
      name: value?.name ?? '',
      surname: value?.surname ?? '',
      badge: value?.badge ?? '',
      userId: value?.userId ?? null,
      active: value?.active ?? ConfigEnableMode.Enabled
    });
  }

  solaLettura = false;

  @Input()
  set readOnly(value: boolean) {
    this.solaLettura = value;

    if (value) {
      this.peopleForm.disable();
    } else {
      this.peopleForm.enable();
    }
  }

  onSubmit(): void {
    if (this.solaLettura || this.salvataggio) {
      return;
    }
    const values = this.peopleForm.getRawValue();

    const name = values.name.trim();
    const surname = values.surname.trim();

    this.peopleForm.patchValue({ name, surname });

    if (this.peopleForm.invalid) {
      this.peopleForm.markAllAsTouched();

      Object.values(this.peopleForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });

      return;
    }

    const people = new People();
    people.peopleId =
      this.currentPeople?.peopleId ??
      '00000000-0000-0000-0000-000000000000';
    people.name = name;
    people.surname = surname;
    people.badge = values.badge.trim() || null;
    people.userId = values.userId || null;
    people.active = values.active;

    this.save.emit(people);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
