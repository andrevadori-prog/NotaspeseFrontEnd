import { Component, OnInit } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { PeopleApiService } from '@mch-core/http-api/people-api.service';
import { CostCenterApiService } from '@mch-core/http-api/cost-center-api.service';
import { People } from '@mch-core/models/people';
import { CostCenterSlim } from '@mch-core/models/cost-center';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzHelper, Pagination, Sortable, AuthApi } from 'mch-authentication-v2-lib';

import { ExpenseReportApiService } from '@mch-core/http-api/expense-report-api.service';
import { ExpenseReport } from '@mch-core/models/expense-report';
import { FilterExpenseReport } from '@mch-core/models/filters/filter-expense-report';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalExpenseReportsComponent } from './modals/modal-expense-reports/modal-expense-reports.component';
import { ModalExpenseSummaryComponent } from './modals/modal-expense-summary/modal-expense-summary.component';
import { CommissionApiService } from '@mch-core/http-api/commission-api.service';
import { CommissionSlim } from '@mch-core/models/commission';


@Component({
  selector: 'app-expense-reports',
  standalone: false,
  templateUrl: './expense-reports.component.html',
  styleUrl: './expense-reports.component.scss'
})
export class ExpenseReportsComponent implements OnInit {
  peoples: People[] = [];
  costCenters: CostCenterSlim[] = [];
  commissions: CommissionSlim[] = [];

  anagraficheCaricate = false;
  caricamentoAnagrafiche = false;

  expenseReports: ExpenseReport[] = [];
  pagination = new Pagination(50);
  filterExpenseReport = new FilterExpenseReport();
  sortExpenseReport?: Sortable;
  nzHelper = new NzHelper();

  constructor(
    private readonly peopleApi: PeopleApiService,
    private readonly costCenterApi: CostCenterApiService,
    private readonly commissionApi: CommissionApiService,
    private readonly notification: NzNotificationService,
    private readonly expenseReportApi: ExpenseReportApiService,
    private readonly modal: NzModalService,
    private readonly authApi: AuthApi,
  ) { }

  ngOnInit(): void {
    this.caricaAnagrafiche();
  }

  caricaAnagrafiche(): void {
    if (this.caricamentoAnagrafiche) {
      return;
    }

    this.caricamentoAnagrafiche = true;
    this.anagraficheCaricate = false;

    forkJoin({
      peoples: this.authApi.hasRole('Admin')
        ? this.peopleApi.getAllPeoples()
        : this.peopleApi.getCurrentPeople().pipe(
          map(persona => [persona])
        ),
      costCenters: this.costCenterApi.getAllCostCenters(),
      commissions: this.commissionApi.getAllCommissions()
    }).subscribe({
      next: (res) => {
        this.peoples = res.peoples;
        this.costCenters = res.costCenters;
        this.commissions = res.commissions;

        this.anagraficheCaricate = true;
        this.caricamentoAnagrafiche = false;
      },
      error: () => {
        this.caricamentoAnagrafiche = false;

        this.notification.error(
          'Note spese',
          'Impossibile caricare persone, centri di costo e commesse.'
        );
      }
    });
  }

  onView(report: ExpenseReport): void {
    this.expenseReportApi
      .getExpenseReportById(report.expenseReportId)
      .subscribe({
        next: (data) => {
          this.onOpen(data, true);
        },
        error: () => {
          this.notification.error(
            'Note spese',
            'Impossibile caricare la nota spese.'
          );
        }
      });
  }

  onSummary(report: ExpenseReport): void {
    this.expenseReportApi
      .getExpenseReportById(report.expenseReportId)
      .subscribe({
        next: (data) => {
          const modalRef = this.modal.create({
            nzTitle: 'Riepilogo nota spese',
            nzContent: ModalExpenseSummaryComponent,
            nzWidth: 1100,
            nzFooter: null,
            nzWrapClassName: 'expense-summary-print-modal'
          });

          const component = modalRef.componentInstance!;

          component.report = data;
          component.peoples = this.peoples;
          component.costCenters = this.costCenters;
          component.commissions = this.commissions;
        },
        error: () => {
          this.notification.error(
            'Note spese',
            'Impossibile caricare il riepilogo della nota spese.'
          );
        }
      });
  }

  onEdit(report: ExpenseReport): void {
    this.expenseReportApi
      .getExpenseReportById(report.expenseReportId)
      .subscribe({
        next: (data) => {
          this.onOpen(data);
        },
        error: () => {
          this.notification.error(
            'Note spese',
            'Impossibile caricare la nota spese da modificare.'
          );
        }
      });
  }

  onOpen(report?: ExpenseReport, solaLettura = false): void {
    const modalRef = this.modal.create({
      nzTitle: solaLettura
        ? 'Dettagli nota spese'
        : report ? 'Modifica nota spese' : 'Nuova nota spese',
      nzContent: ModalExpenseReportsComponent,
      nzWidth: '90vw',
      nzFooter: null,
      nzOnCancel: (instance: ModalExpenseReportsComponent) =>
        instance.salvataggio ? false : undefined
    });

    const component = modalRef.componentInstance!;
    component.peoples = this.peoples;
    component.costCenters = this.costCenters;
    component.commissions = this.commissions;
    component.report = report;
    component.readOnly = solaLettura;

    component.cancel.subscribe(() => {
      if (!component.salvataggio) {
        modalRef.close();
      }
    });

    component.save.subscribe(data => {
      if (component.salvataggio || component.solaLettura) {
        return;
      }

      component.salvataggio = true;
      component.reportForm.disable();

      this.expenseReportApi.createOrUpdateExpenseReport(data).subscribe({
        next: () => {
          component.salvataggio = false;
          modalRef.close();

          this.notification.success(
            'Note spese',
            'Nota spese salvata correttamente.'
          );

          this.findExpenseReports();
        },
        error: (err) => {
          component.salvataggio = false;
          component.reportForm.enable();

          const message = err?.error?.Message;

          const messaggio =
            typeof message === 'string' && message.trim()
              ? message
              : 'Salvataggio non riuscito. Controlla i dati e riprova.';

          this.notification.error('Note spese', messaggio);
        }
      });
    });
  }

  onDelete(report: ExpenseReport): void {
    this.modal.confirm({
      nzTitle: 'Eliminare la nota spese selezionata?',
      nzContent:
        'Verranno eliminate definitivamente anche le voci e le ripartizioni della nota.',
      nzOkText: 'Elimina',
      nzOkDanger: true,
      nzCancelText: 'Annulla',

      nzOnOk: () => new Promise<boolean>((resolve) => {
        this.expenseReportApi
          .deleteExpenseReport(report.expenseReportId)
          .subscribe({
            next: () => {
              this.notification.success(
                'Note spese',
                'Nota spese eliminata correttamente.'
              );

              this.pagination.currentPage = 1;
              this.findExpenseReports();
              resolve(true);
            },
            error: (err) => {
              const message = err?.error?.Message;

              const messaggio =
                typeof message === 'string' && message.trim()
                  ? message
                  : 'Impossibile eliminare la nota spese. Riprova.';

              this.notification.error('Note spese', messaggio);
              resolve(false);
            }
          });
      })
    });
  }

  onFilterChange(filter: FilterExpenseReport): void {
    this.filterExpenseReport = filter;
    this.pagination.currentPage = 1;
    this.findExpenseReports();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pagination.currentPage = params.pageIndex;
    this.pagination.pageSize = params.pageSize;

    const currentSort = params.sort.find(item => item.value !== null);

    this.sortExpenseReport = currentSort
      ? new Sortable().setValuesFromNz(
        currentSort.key,
        currentSort.value
      )
      : undefined;

    this.findExpenseReports();
  }

  getPeopleName(peopleId: string): string {
    const persona = this.peoples.find(
      item => item.peopleId === peopleId
    );

    return persona
      ? `${persona.name} ${persona.surname}`
      : 'Persona non disponibile';
  }

  getCostCenterCode(costCenterId: string): string {
    const costCenter = this.costCenters.find(
      item => item.costCenterId === costCenterId
    );

    return costCenter?.code ?? 'Centro non disponibile';
  }

  getReportTotal(report: ExpenseReport): number {
    const totaleCentesimi = (report.expenseItems ?? []).reduce(
      (totale, item) => totale + Math.round(item.amountEur * 100),
      0
    );

    return totaleCentesimi / 100;
  }

  private findExpenseReports(): void {
    this.nzHelper.loading = true;
    this.filterExpenseReport.sort = this.sortExpenseReport;

    this.expenseReportApi.searchExpenseReports(
      this.filterExpenseReport,
      this.pagination.currentPage,
      this.pagination.pageSize
    ).subscribe({
      next: (res) => {
        this.expenseReports = res.result;
        this.pagination.setCollectionSize(res.collectionSize);
        this.nzHelper.loading = false;
      },
      error: () => {
        this.nzHelper.loading = false;

        this.notification.error(
          'Note spese',
          'Impossibile caricare le note spese.'
        );
      }
    });
  }
}