import { Component } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzHelper, Pagination, AuthApi } from 'mch-authentication-v2-lib';

import { CostCenterApiService } from '@mch-core/http-api/cost-center-api.service';
import { CostCenter } from '@mch-core/models/cost-center';
import { FilterCostCenter } from '@mch-core/models/filters/filter-cost-center';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalCostCentersComponent } from './modals/modal-cost-centers/modal-cost-centers.component';

@Component({
  selector: 'app-cost-centers',
  standalone: false,
  templateUrl: './cost-centers.component.html',
  styleUrl: './cost-centers.component.scss'
})
export class CostCentersComponent {
  costCenters: CostCenter[] = [];
  pagination = new Pagination(50);
  filterCostCenter = new FilterCostCenter();
  nzHelper = new NzHelper();

  constructor(
    readonly authApi: AuthApi,
    private readonly costCenterApi: CostCenterApiService,
    private readonly notification: NzNotificationService,
    private readonly modal: NzModalService
  ) { }

  onDelete(costCenter: CostCenter): void {
    this.modal.confirm({
      nzTitle: 'Eliminare il centro di costo selezionato?',
      nzContent: 'La cancellazione è definitiva.',
      nzOkText: 'Elimina',
      nzOkDanger: true,
      nzCancelText: 'Annulla',

      nzOnOk: () => new Promise<boolean>((resolve) => {
        this.costCenterApi
          .deleteCostCenter(costCenter.costCenterId)
          .subscribe({
            next: () => {
              this.notification.success(
                'Centri di costo',
                'Centro di costo eliminato correttamente.'
              );

              this.pagination.currentPage = 1;
              this.findCostCenters();
              resolve(true);
            },

            error: (err) => {
              const message = err?.error?.Message;

              const messaggio =
                message === 'common.used-relation'
                  ? 'Il centro di costo è utilizzato da note spese o ripartizioni e non può essere eliminato.'
                  : 'Impossibile eliminare il centro di costo. Riprova.';

              this.notification.error('Centri di costo', messaggio);
              resolve(false);
            }
          });
      })
    });
  }

  onView(costCenter: CostCenter): void {
    this.costCenterApi
      .getCostCenterById(costCenter.costCenterId)
      .subscribe({
        next: (data) => {
          this.onOpen(data, true);
        },
        error: () => {
          this.notification.error(
            'Centri di costo',
            'Impossibile caricare il centro di costo.'
          );
        }
      });
  }

  onEdit(costCenter: CostCenter): void {
    this.costCenterApi
      .getCostCenterById(costCenter.costCenterId)
      .subscribe({
        next: (data) => {
          this.onOpen(data);
        },
        error: () => {
          this.notification.error(
            'Centri di costo',
            'Impossibile caricare il centro di costo.'
          );
        }
      });
  }

  onOpen(costCenter?: CostCenter, solaLettura = false): void {
    const modalRef = this.modal.create({
      nzTitle: solaLettura
        ? 'Dettagli centro di costo'
        : costCenter
          ? 'Modifica centro di costo'
          : 'Nuovo centro di costo',
      nzContent: ModalCostCentersComponent,
      nzWidth: 600,
      nzFooter: null,
      nzOnCancel: (instance: ModalCostCentersComponent) =>
        instance.salvataggio ? false : undefined
    });

    const component = modalRef.componentInstance!;
    component.costCenter = costCenter;
    component.readOnly = solaLettura;

    component.cancel.subscribe(() => {
      if (!component.salvataggio) {
        modalRef.close();
      }
    });

    component.save.subscribe((data: CostCenter) => {
      if (component.salvataggio || component.solaLettura) {
        return;
      }

      component.salvataggio = true;
      component.costCenterForm.disable();

      this.costCenterApi.createOrUpdateCostCenter(data).subscribe({
        next: () => {
          modalRef.close();

          this.notification.success(
            'Centri di costo',
            'Centro di costo salvato correttamente.'
          );

          this.findCostCenters();
        },
        error: (err) => {
          component.salvataggio = false;
          component.costCenterForm.enable();

          const message = err?.error?.Message;

          const messaggio =
            message === 'common.duplicate-code'
              ? 'Esiste già un centro di costo con questo codice.'
              : typeof message === 'string' && message.trim()
                ? message
                : 'Salvataggio non riuscito. Riprova.';

          this.notification.error('Centri di costo', messaggio);
        }
      });
    });
  }

  onFilterChange(filter: FilterCostCenter): void {
    this.filterCostCenter = filter;
    this.pagination.currentPage = 1;
    this.findCostCenters();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pagination.currentPage = params.pageIndex;
    this.pagination.pageSize = params.pageSize;

    this.findCostCenters();
  }

  private findCostCenters(): void {
    this.nzHelper.loading = true;

    this.costCenterApi.searchCostCenters(
      this.filterCostCenter,
      this.pagination.currentPage,
      this.pagination.pageSize
    ).subscribe({
      next: (res) => {
        this.costCenters = res.result;
        this.pagination.setCollectionSize(res.collectionSize);
        this.nzHelper.loading = false;
      },
      error: () => {
        this.nzHelper.loading = false;

        this.notification.error(
          'Centri di costo',
          'Impossibile caricare i centri di costo.'
        );
      }
    });
  }
}