import { Component } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthApi, NzHelper, Pagination, Sortable } from 'mch-authentication-v2-lib';

import { CommissionApiService } from '@mch-core/http-api/commission-api.service';
import { Commission } from '@mch-core/models/commission';
import { FilterCommission } from '@mch-core/models/filters/filter-commission';
import { RecordStatus } from '@mch-core/enums/record-status.enums';
import { CommissionType } from '@mch-core/enums/commision-type.enum';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ModalCommissionsComponent } from './modals/modal-commissions/modal-commissions.component';

@Component({
  selector: 'app-commissions',
  standalone: false,
  templateUrl: './commissions.component.html',
  styleUrl: './commissions.component.scss'
})
export class CommissionsComponent {
  commissions: Commission[] = [];
  pagination = new Pagination(50);
  filterCommission = new FilterCommission();
  sortCommission?: Sortable;
  nzHelper = new NzHelper();
  errore = '';

  readonly RecordStatus = RecordStatus;
  readonly CommissionType = CommissionType;

  constructor(
    readonly authApi: AuthApi,
    private readonly commissionApi: CommissionApiService,
    private readonly modal: NzModalService,
    private readonly notification: NzNotificationService
  ) { }

  onDelete(commission: Commission): void {
    this.modal.confirm({
      nzTitle: 'Eliminare la commessa selezionata?',
      nzContent: 'La cancellazione è definitiva.',
      nzOkText: 'Elimina',
      nzOkDanger: true,
      nzCancelText: 'Annulla',

      nzOnOk: () => new Promise<boolean>((resolve) => {
        this.commissionApi
          .deleteCommission(commission.commissionId)
          .subscribe({
            next: () => {
              this.notification.success(
                'Commesse',
                'Commessa eliminata correttamente.'
              );

              this.pagination.currentPage = 1;
              this.findCommissions();
              resolve(true);
            },

            error: (err) => {
              const message = err?.error?.Message;

              const messaggio =
                message === 'common.used-relation'
                  ? 'La commessa è utilizzata da voci di spesa e non può essere eliminata.'
                  : 'Impossibile eliminare la commessa. Riprova.';

              this.notification.error('Commesse', messaggio);
              resolve(false);
            }
          });
      })
    });
  }

  onView(commission: Commission): void {
    this.errore = '';

    this.commissionApi
      .getCommissionById(commission.commissionId)
      .subscribe({
        next: (data) => {
          this.onOpen(data, true);
        },
        error: () => {
          this.notification.error(
            'Commesse',
            'Impossibile caricare la commessa.'
          );
        }
      });
  }

  onEdit(commission: Commission): void {
    this.errore = '';

    this.commissionApi
      .getCommissionById(commission.commissionId)
      .subscribe({
        next: (data) => {
          this.onOpen(data);
        },
        error: () => {
          this.notification.error(
            'Commesse',
            'Impossibile caricare la commessa.'
          );
        }
      });
  }

  onOpen(commission?: Commission, solaLettura = false): void {
    const modalRef = this.modal.create({
      nzTitle: solaLettura
        ? 'Dettagli commessa'
        : commission ? 'Modifica commessa' : 'Nuova commessa',
      nzContent: ModalCommissionsComponent,
      nzWidth: 600,
      nzFooter: null,
      nzOnCancel: (instance: ModalCommissionsComponent) =>
        instance.salvataggio ? false : undefined
    });

    const component = modalRef.componentInstance!;
    component.commission = commission;
    component.readOnly = solaLettura;

    component.cancel.subscribe(() => {
      if (!component.salvataggio) {
        modalRef.close();
      }
    });

    component.save.subscribe((data: Commission) => {
      if (component.salvataggio || component.solaLettura) {
        return;
      }

      component.salvataggio = true;
      component.commissionForm.disable();
      component.errore = '';

      this.commissionApi.createOrUpdateCommission(data).subscribe({
        next: () => {
          modalRef.close();

          this.notification.success(
            'Commesse',
            'Commessa salvata correttamente.'
          );

          this.findCommissions();
        },
        error: (err) => {
          component.salvataggio = false;
          component.commissionForm.enable();

          const message = err?.error?.Message;

          const messaggio =
            message === 'common.duplicate-code'
              ? 'Esiste già una commessa con questo codice.'
              : typeof message === 'string' && message.trim()
                ? message
                : 'Salvataggio non riuscito. Controlla i dati e riprova.';

          this.notification.error('Commesse', messaggio);
        }
      });
    });
  }

  onFilterChange(filter: FilterCommission): void {
    this.filterCommission = filter;
    this.pagination.currentPage = 1;
    this.findCommissions();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pagination.currentPage = params.pageIndex;
    this.pagination.pageSize = params.pageSize;

    const currentSort = params.sort.find(item => item.value !== null);

    this.sortCommission = currentSort
      ? new Sortable().setValuesFromNz(
        currentSort.key,
        currentSort.value
      )
      : undefined;

    this.findCommissions();
  }

  private findCommissions(): void {
    this.nzHelper.loading = true;
    this.errore = '';
    this.filterCommission.sort = this.sortCommission;

    this.commissionApi.searchCommissions(
      this.filterCommission,
      this.pagination.currentPage,
      this.pagination.pageSize
    ).subscribe({
      next: (res) => {
        this.commissions = res.result;
        this.pagination.setCollectionSize(res.collectionSize);
        this.nzHelper.loading = false;
      },
      error: () => {
        this.nzHelper.loading = false;

        this.notification.error(
          'Commesse',
          'Impossibile caricare le commesse.'
        );
      }
    });
  }
}